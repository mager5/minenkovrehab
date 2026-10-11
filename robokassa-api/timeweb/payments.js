const crypto = require('node:crypto');

class PaymentError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function money(value) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,11})(\.\d{1,2})?$/.test(value)) {
    throw new PaymentError('invalid_amount');
  }
  const [whole, fraction = ''] = value.split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (cents <= 0n) throw new PaymentError('invalid_amount');
  return cents;
}

function parseNotification(params, config) {
  if (!['test', 'live'].includes(config.mode) || !config.password2) {
    throw new PaymentError('payment_configuration_missing', 503);
  }
  const { OutSum, InvId, SignatureValue } = params;
  money(OutSum);
  if (typeof InvId !== 'string' || !/^[1-9]\d{0,18}$/.test(InvId) || BigInt(InvId) > 9223372036854775807n) {
    throw new PaymentError('invalid_invoice');
  }
  if (typeof SignatureValue !== 'string' || !/^[a-f\d]{32}$/i.test(SignatureValue)) {
    throw new PaymentError('invalid_signature');
  }
  const shp = {};
  for (const key of Object.keys(params)) {
    if (/^shp_/i.test(key)) {
      if (!/^shp_[a-z\d_]+$/i.test(key) || typeof params[key] !== 'string') {
        throw new PaymentError('invalid_custom_parameter');
      }
      shp[key] = params[key];
    }
  }
  const parts = [OutSum, InvId, config.password2];
  for (const key of Object.keys(shp).sort()) parts.push(`${key}=${shp[key]}`);
  // Sign the exact received OutSum string, not a floating-point conversion.
  const expected = crypto.createHash('md5').update(parts.join(':'), 'utf8').digest();
  if (!crypto.timingSafeEqual(expected, Buffer.from(SignatureValue, 'hex'))) {
    throw new PaymentError('invalid_signature');
  }
  // IsTest is not signed; it is an additional consistency check, not authority.
  if (params.IsTest !== undefined && params.IsTest !== (config.mode === 'test' ? '1' : '0')) {
    throw new PaymentError('mode_mismatch');
  }
  return { invoiceId: InvId, amount: OutSum, mode: config.mode, shp };
}

function sameShp(a, b) {
  const keys = Object.keys(a).sort();
  return keys.length === Object.keys(b).length && keys.every(k => a[k] === b[k]);
}

async function reserveInvoice(pool) {
  // Import must reseed the identity above the historical high-water mark.
  // Also skip existing numeric legacy invoice IDs if the sequence lagged.
  for (let attempt = 0; attempt < 1000; attempt++) {
    const { rows: [candidate] } = await pool.query(`WITH candidate AS MATERIALIZED (
      SELECT nextval('rehab.orders_invoice_id_seq')::text AS invoice_id
    ) SELECT invoice_id FROM candidate c WHERE NOT EXISTS (
      SELECT 1 FROM rehab.purchases p WHERE p.robokassa_invoice_id ~ '^[0-9]+$'
      AND ltrim(p.robokassa_invoice_id, '0') = c.invoice_id
    ) AND NOT EXISTS (SELECT 1 FROM rehab.orders o WHERE o.invoice_id::text = c.invoice_id)`);
    if (candidate) return candidate.invoice_id;
  }
  throw new PaymentError('invoice_sequence_requires_reseed', 503);
}

// Internal order creation only. No public API can supply price or recipient UUID.
async function createOrder(pool, { productSlug, buyerEmail, mode, userId = null, shp = {} }) {
  if (!['test', 'live'].includes(mode) || typeof buyerEmail !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) throw new PaymentError('invalid_order');
  for (const [key, value] of Object.entries(shp)) {
    if (!/^shp_[a-z\d_]+$/i.test(key) || typeof value !== 'string') throw new PaymentError('invalid_custom_parameter');
  }
  const email = buyerEmail.trim().toLowerCase();
  const invoiceId = await reserveInvoice(pool);
  const result = await pool.query(`
    INSERT INTO rehab.orders (product_id, buyer_email, amount, mode, user_id, expected_shp, invoice_id)
    SELECT p.id, $2, p.price, $3, $4, $5, $6 FROM rehab.products p
    WHERE p.slug = $1 AND ($4::uuid IS NULL OR EXISTS (
      SELECT 1 FROM rehab.users u WHERE u.id = $4 AND lower(u.email) = $2
      AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until <= now())
    )) RETURNING *`, [productSlug, email, mode, userId, shp, invoiceId]);
  if (!result.rows[0]) throw new PaymentError('invalid_order');
  return result.rows[0];
}

async function processResult(pool, params, config) {
  const notification = parseNotification(params, config);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [order] } = await client.query(
      'SELECT * FROM rehab.orders WHERE invoice_id = $1 FOR UPDATE', [notification.invoiceId]);
    if (!order) throw new PaymentError('unknown_order', 404);
    if (order.mode !== notification.mode) throw new PaymentError('mode_mismatch');
    if (money(order.amount) !== money(notification.amount)) throw new PaymentError('amount_mismatch');
    if (!sameShp(order.expected_shp, notification.shp)) throw new PaymentError('order_parameters_mismatch');
    const { rows: [payment] } = await client.query('SELECT * FROM rehab.payments WHERE order_id = $1', [order.id]);
    if (payment) {
      if (!['paid', 'refunded'].includes(order.status) || payment.mode !== order.mode ||
          money(payment.amount) !== money(order.amount)) throw new Error('Inconsistent payment state');
      const { rows: [processed] } = await client.query(`SELECT p.id FROM rehab.purchases p
        JOIN rehab.mail_outbox m ON m.order_id = p.order_id
        WHERE p.order_id = $1 AND p.user_id = $2 AND p.product_id = $3 AND p.mode = $4`,
      [order.id, order.user_id, order.product_id, order.mode]);
      if (!processed) throw new Error('Incomplete payment effects');
      await client.query('COMMIT');
      return { invoiceId: order.invoice_id, duplicate: true };
    }
    if (order.status !== 'pending') throw new PaymentError('order_not_payable', 409);
    // Serialize account resolution across different orders for the same email.
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [order.buyer_email.toLowerCase()]);
    let user;
    if (order.user_id) {
      ({ rows: [user] } = await client.query('SELECT * FROM rehab.users WHERE id = $1 FOR UPDATE', [order.user_id]));
    } else {
      const { rows } = await client.query('SELECT * FROM rehab.users WHERE lower(email) = lower($1) FOR UPDATE', [order.buyer_email]);
      if (rows.length > 1) throw new PaymentError('ambiguous_account', 409);
      user = rows[0];
      if (!user) ({ rows: [user] } = await client.query('INSERT INTO rehab.users (email) VALUES ($1) RETURNING *', [order.buyer_email]));
    }
    if (!user || user.deleted_at || (user.banned_until && new Date(user.banned_until) > new Date())) {
      throw new PaymentError('account_unavailable', 409);
    }
    await client.query(`INSERT INTO rehab.profiles (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [user.id, user.email]);
    // Deliberately no INSERT/UPDATE to credentials and no password generation.
    await client.query('INSERT INTO rehab.payments (order_id, amount, mode) VALUES ($1, $2, $3)', [order.id, order.amount, order.mode]);
    await client.query(`INSERT INTO rehab.purchases (user_id, product_id, status, robokassa_invoice_id, order_id, mode)
      VALUES ($1, $2, 'active', $3, $4, $5)`, [user.id, order.product_id, order.invoice_id, order.id, order.mode]);
    await client.query(`INSERT INTO rehab.mail_outbox (order_id, recipient, kind) VALUES ($1, $2, 'purchase_access')`, [order.id, user.email]);
    await client.query(`UPDATE rehab.orders SET status = 'paid', paid_at = now(), user_id = $2 WHERE id = $1`, [order.id, user.id]);
    await client.query('COMMIT');
    return { invoiceId: order.invoice_id, duplicate: false };
  } catch (error) {
    // An uncertain COMMIT also returns failure. A retry confirms committed state.
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { PaymentError, money, createOrder, parseNotification, processResult };
