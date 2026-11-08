const {failed}=require('./delivery');
// This stage has no network sender. Production delivery needs a reviewed adapter.
class TestSender {
  constructor({ fail = false, capture = true } = {}) { this.fail = fail; this.capture=capture; this.messages = []; }
  async send(message) {
    if (this.fail) throw new Error('Simulated delivery failure');
    if (this.capture && !this.messages.some(m => m.idempotencyKey === message.idempotencyKey)) this.messages.push(message);
  }
}

async function deliverOne(pool, sender) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [job] } = await client.query(`SELECT * FROM rehab.mail_outbox
      WHERE status = 'pending' AND available_at <= now()
      ORDER BY created_at, id FOR UPDATE SKIP LOCKED LIMIT 1`);
    if (!job) { await client.query('COMMIT'); return false; }
    let receipt;
    try {
      // Only fixed template fields. Never forward credentials, params or secrets.
      receipt=await sender.send({ idempotencyKey: job.id, to: job.recipient, kind: job.kind, orderId: job.order_id });
    } catch (_error) {
      await failed(client,'mail_outbox',job,_error);
      await client.query('COMMIT');
      return false;
    }
    await client.query(`UPDATE rehab.mail_outbox SET status = 'sent', attempts = attempts + 1,
      sent_at = now(), last_error = NULL,provider_message_id=$2 WHERE id = $1`, [job.id,receipt?.messageId||null]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

module.exports = { TestSender, deliverOne };
