const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { createOrder, processResult } = require('../payments');
const { createApp } = require('../app');
const { TestSender, deliverOne } = require('../mail-worker');

const socket = process.env.STAGE1_TEST_SOCKET;
if (!socket || !socket.includes('rehab-stage1-')) throw new Error('Run only via run-local.js');
const pool = new Pool({ host: socket, port: 55439, database: 'rehab_stage1_test', user: 'stage1_owner', max: 20 });
let servicePool;
const config = { mode: 'test', password2: 'synthetic-stage1-not-a-real-secret' };
const userId = '10000000-0000-4000-8000-000000000001';
const productId = '20000000-0000-4000-8000-000000000001';
const otherProductId = '20000000-0000-4000-8000-000000000002';
const videoId = '30000000-0000-4000-8000-000000000001';
const token = 'a'.repeat(64);
let server, base, providerCalls;
const passwordFixture = 'synthetic-hash-fixture';

async function q(sql, values) { return (await pool.query(sql, values)).rows; }
async function order(options = {}) {
  return createOrder(servicePool, { productSlug: 'personal-program', buyerEmail: 'buyer@example.invalid', mode: 'test', ...options });
}
function notice(o, overrides = {}, signConfig = config) {
  const params = { OutSum: o.amount, InvId: o.invoice_id, ...o.expected_shp, ...overrides };
  const shp = Object.keys(params).filter(k => /^shp_/i.test(k)).sort().map(k => `${k}=${params[k]}`);
  params.SignatureValue = crypto.createHash('md5').update([params.OutSum, params.InvId, signConfig.password2, ...shp].join(':')).digest('hex');
  return params;
}
async function callback(params, method = 'POST') {
  const query = new URLSearchParams(params);
  const response = await fetch(`${base}/api/robokassa/result${method === 'GET' ? `?${query}` : ''}`, {
    method, headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    ...(method === 'POST' ? { body: query } : {}),
  });
  return { status: response.status, text: await response.text() };
}
async function counts() {
  return (await q(`SELECT (SELECT count(*)::int FROM rehab.payments) payments,
    (SELECT count(*)::int FROM rehab.purchases) purchases,
    (SELECT count(*)::int FROM rehab.mail_outbox) mail`))[0];
}
before(async () => {
  for(const file of ['001_payment_core.sql','002_auth.sql','003_import.sql','004_providers.sql','005_legacy_and_confirmation.sql'])await pool.query(fs.readFileSync(path.join(__dirname,'../migrations',file),'utf8'));
  await q('CREATE ROLE stage1_runtime LOGIN');
  await q(`GRANT USAGE ON SCHEMA rehab TO stage1_runtime;
    GRANT SELECT, INSERT, UPDATE ON rehab.users, rehab.orders TO stage1_runtime;
    GRANT SELECT, INSERT ON rehab.profiles, rehab.payments, rehab.purchases TO stage1_runtime;
    GRANT SELECT, INSERT, UPDATE ON rehab.mail_outbox TO stage1_runtime;
    GRANT SELECT ON rehab.products, rehab.sessions, rehab.course_videos TO stage1_runtime;
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA rehab TO stage1_runtime;`);
  servicePool = new Pool({ host: socket, port: 55439, database: 'rehab_stage1_test', user: 'stage1_runtime', max: 20 });
  const app = createApp({ pool: servicePool, paymentConfig: config, videoProvider: {
    async playback(id) { providerCalls.push(id); return { signedUrl: 'https://video.example.invalid/test-playback' }; },
  } });
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (servicePool) await servicePool.end();
  await pool.end();
});
beforeEach(async () => {
  providerCalls = [];
  await q('TRUNCATE rehab.users, rehab.products CASCADE');
  await q('INSERT INTO rehab.users (id, email,email_confirmed_at) VALUES ($1, $2,now())', [userId, 'buyer@example.invalid']);
  await q('INSERT INTO rehab.profiles (id,email) VALUES ($1,$2)', [userId, 'buyer@example.invalid']);
  await q("INSERT INTO rehab.credentials VALUES ($1,$2,'bcrypt')", [userId, passwordFixture]);
  await q("INSERT INTO rehab.products (id,slug,title,price) VALUES ($1,'personal-program','Synthetic course',8000),($2,'other-course','Other synthetic course',9000)", [productId, otherProductId]);
  await q('INSERT INTO rehab.sessions (token_hash,user_id,expires_at) VALUES ($1,$2,now()+interval \'1 hour\')',
    [crypto.createHash('sha256').update(token).digest('hex'), userId]);
  await q("INSERT INTO rehab.videos (id,user_id,title,file_path) VALUES ($1,$2,'Synthetic video','synthetic/video.mp4')", [videoId, userId]);
  await q("INSERT INTO rehab.course_videos VALUES ($1,'stage-1',$2,'synthetic-provider-id',true),($3,'stage-1',$2,'other-provider-id',true)", [productId, videoId, otherProductId]);
});

test('rejects incorrect signature with no database mutations', async () => {
  const o = await order();
  const p = notice(o); p.SignatureValue = '0'.repeat(32);
  assert.equal((await callback(p)).status, 400);
  assert.deepEqual(await counts(), { payments: 0, purchases: 0, mail: 0 });
});
test('rejects validly signed wrong amount and malformed amounts', async () => {
  const o = await order();
  assert.equal((await callback(notice(o, { OutSum: '1.00' }))).text, 'amount_mismatch');
  for (const amount of ['8000junk', '8e3', '8000.001', '-8000', 'NaN']) {
    assert.equal((await callback(notice(o, { OutSum: amount }))).status, 400);
  }
  assert.deepEqual(await counts(), { payments: 0, purchases: 0, mail: 0 });
});
test('rejects unknown order and mode mismatch including forged IsTest', async () => {
  const o = await order({ mode: 'live' });
  assert.equal((await callback(notice(o))).text, 'mode_mismatch');
  assert.equal((await callback(notice(o, { InvId: '9223372036854775807' }))).status, 404);
  const t = await order();
  assert.equal((await callback(notice(t, { IsTest: '0' }))).text, 'mode_mismatch');
  assert.deepEqual(await counts(), { payments: 0, purchases: 0, mail: 0 });
});
test('sequential GET/POST replay commits exactly once and preserves UUID/credentials', async () => {
  const o = await order({ shp: { Shp_course: 'personal-program', Shp_marker: 'fixture' } });
  const p = notice(o, { OutSum: '8000.0' });
  assert.deepEqual(await callback(p), { status: 200, text: `OK${o.invoice_id}` });
  assert.equal((await callback(p, 'GET')).text, `OK${o.invoice_id}`);
  assert.deepEqual(await counts(), { payments: 1, purchases: 1, mail: 1 });
  assert.equal((await q('SELECT user_id FROM rehab.purchases'))[0].user_id, userId);
  assert.equal((await q('SELECT password_hash FROM rehab.credentials'))[0].password_hash, passwordFixture);
});
test('twenty concurrent callbacks produce one payment, purchase and outbox row', async () => {
  const o = await order();
  const responses = await Promise.all(Array.from({ length: 20 }, () => callback(notice(o))));
  assert.ok(responses.every(r => r.status === 200 && r.text === `OK${o.invoice_id}`));
  assert.deepEqual(await counts(), { payments: 1, purchases: 1, mail: 1 });
});
test('different concurrent orders for a new buyer resolve one account without credentials', async () => {
  const orders = await Promise.all(Array.from({ length: 4 }, () => order({ buyerEmail: 'new@example.invalid' })));
  await Promise.all(orders.map(o => processResult(servicePool, notice(o), config)));
  const users = await q("SELECT id FROM rehab.users WHERE email='new@example.invalid'");
  assert.equal(users.length, 1);
  assert.equal((await q('SELECT count(*)::int n FROM rehab.credentials WHERE user_id=$1', [users[0].id]))[0].n, 0);
  assert.deepEqual(await counts(), { payments: 4, purchases: 4, mail: 4 });
});
test('real outbox insert failure rolls back payment, purchase, account and order state', async () => {
  const o = await order({ buyerEmail: 'rollback@example.invalid' });
  await q("ALTER TABLE rehab.mail_outbox ADD CONSTRAINT simulated_failure CHECK (recipient <> 'rollback@example.invalid')");
  try {
    const result = await callback(notice(o));
    assert.equal(result.status, 503); assert.ok(!result.text.startsWith('OK'));
    assert.deepEqual(await counts(), { payments: 0, purchases: 0, mail: 0 });
    assert.equal((await q('SELECT status FROM rehab.orders WHERE id=$1', [o.id]))[0].status, 'pending');
    assert.equal((await q("SELECT count(*)::int n FROM rehab.users WHERE email='rollback@example.invalid'"))[0].n, 0);
  } finally { await q('ALTER TABLE rehab.mail_outbox DROP CONSTRAINT simulated_failure'); }
  assert.equal((await callback(notice(o))).status, 200);
});
test('commit-time failure never acknowledges and rolls back all writes', async () => {
  const o = await order();
  await q(`CREATE FUNCTION rehab.fail_commit() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'synthetic deferred failure'; END $$`);
  await q(`CREATE CONSTRAINT TRIGGER fail_commit AFTER INSERT ON rehab.payments
    DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION rehab.fail_commit()`);
  try {
    assert.equal((await callback(notice(o))).status, 503);
    assert.deepEqual(await counts(), { payments: 0, purchases: 0, mail: 0 });
  } finally {
    await q('DROP TRIGGER fail_commit ON rehab.payments'); await q('DROP FUNCTION rehab.fail_commit()');
  }
  assert.equal((await callback(notice(o))).status, 200);
});
test('mail failure after commit leaves active purchase and queues retry', async () => {
  const o = await order();
  assert.equal((await callback(notice(o))).status, 200);
  assert.equal(await deliverOne(servicePool, new TestSender({ fail: true })), false);
  const [job] = await q('SELECT * FROM rehab.mail_outbox');
  assert.equal(job.status, 'pending'); assert.equal(job.attempts, 1);
  assert.equal((await q('SELECT status FROM rehab.purchases'))[0].status, 'active');
  assert.equal((await callback(notice(o))).status, 200);
  assert.deepEqual(await counts(), { payments: 1, purchases: 1, mail: 1 });
  await q('UPDATE rehab.mail_outbox SET available_at=now()');
  const sender = new TestSender();
  assert.equal(await deliverOne(servicePool, sender), true);
  assert.equal(await deliverOne(servicePool, sender), false);
  assert.equal(sender.messages.length, 1);
  assert.deepEqual(Object.keys(sender.messages[0]).sort(), ['idempotencyKey', 'kind', 'orderId', 'to']);
});
test('concurrent mail workers claim once', async () => {
  const o = await order(); await processResult(servicePool, notice(o), config);
  const sender = new TestSender();
  const results = await Promise.all(Array.from({ length: 5 }, () => deliverOne(servicePool, sender)));
  assert.equal(results.filter(Boolean).length, 1); assert.equal(sender.messages.length, 1);
});
test('another purchase and replay never modify existing password/profile', async () => {
  const first = await order(); const second = await order();
  await processResult(servicePool, notice(first), config);
  await processResult(servicePool, notice(second), config);
  await processResult(servicePool, notice(second), config);
  assert.equal((await q('SELECT password_hash FROM rehab.credentials'))[0].password_hash, passwordFixture);
  assert.equal((await q('SELECT id FROM rehab.profiles'))[0].id, userId);
  assert.deepEqual(await counts(), { payments: 2, purchases: 2, mail: 2 });
});
test('replay after refund does not reactivate access', async () => {
  const o = await order(); await processResult(servicePool, notice(o), config);
  await q("UPDATE rehab.purchases SET status='refunded'");
  await q("UPDATE rehab.orders SET status='refunded'");
  assert.equal((await callback(notice(o))).status, 200);
  assert.equal((await q('SELECT status FROM rehab.purchases'))[0].status, 'refunded');
});
test('server checks corresponding active purchase before provider access', async () => {
  const getVideo = (slug, cookie = `mr_session=${token}`) => fetch(`${base}/api/courses/${slug}/videos/stage-1`, { headers: { cookie } });
  assert.equal((await getVideo('personal-program', '')).status, 401);
  assert.equal((await getVideo('personal-program')).status, 403);
  const o = await order(); await processResult(servicePool, notice(o), config);
  assert.equal((await getVideo('other-course')).status, 403);
  assert.equal(providerCalls.length, 0);
  const allowed = await getVideo('personal-program');
  assert.equal(allowed.status, 200); assert.equal(allowed.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(providerCalls, ['synthetic-provider-id']);
  assert.equal((await fetch(`${base}/api/courses/meniscus/stage-video?stage=1`, { headers: { cookie: `mr_session=${token}` } })).status, 200);
  for (const status of ['expired','refunded']) {
    await q('UPDATE rehab.purchases SET status=$1', [status]);
    assert.equal((await getVideo('personal-program')).status, 403);
  }
  await q("UPDATE rehab.purchases SET status='active', mode='test'");
  await q("UPDATE rehab.purchases SET expires_at=now()-interval '1 second'");
  assert.equal((await getVideo('personal-program')).status, 403);
  await q('UPDATE rehab.purchases SET expires_at=NULL');
  await q('UPDATE rehab.sessions SET revoked_at=now()');
  assert.equal((await getVideo('personal-program')).status, 401);
});
test('test purchase never grants live access', async () => {
  const { accessibleVideo } = require('../access');
  const o = await order(); await processResult(servicePool, notice(o), config);
  assert.equal(await accessibleVideo(servicePool, userId, 'personal-program', 'stage-1', 'live'), null);
});
test('browser completion and raw HLS cannot bypass checks', async () => {
  assert.equal((await fetch(`${base}/api/robokassa/complete-personal-program`, { method: 'POST' })).status, 410);
  assert.equal((await fetch(`${base}/api/courses/meniscus/hls/segment?path=arbitrary`)).status, 410);
  assert.equal((await fetch(`${base}/api/robokassa-sdk/callback`, { method: 'POST' })).status, 404);
  assert.deepEqual(await counts(), { payments: 0, purchases: 0, mail: 0 });
});
test('ambiguous imported email and mismatching signed custom params fail closed', async () => {
  const o = await order({ shp: { Shp_course: 'personal-program' } });
  assert.equal((await callback(notice(o, { Shp_course: 'other-course' }))).text, 'order_parameters_mismatch');
  await q("INSERT INTO rehab.users (email) VALUES ('BUYER@example.invalid')");
  assert.equal((await callback(notice(o))).text, 'ambiguous_account');
  assert.deepEqual(await counts(), { payments: 0, purchases: 0, mail: 0 });
});
test('historical UUIDs and purchases without order survive new checkout', async () => {
  const id = '40000000-0000-4000-8000-000000000001';
  await q("INSERT INTO rehab.purchases (id,user_id,product_id,status,mode) VALUES ($1,$2,$3,'active','live')", [id,userId,productId]);
  const o = await order(); await processResult(servicePool, notice(o), config);
  const [legacy] = await q('SELECT * FROM rehab.purchases WHERE id=$1', [id]);
  assert.equal(legacy.user_id, userId); assert.equal(legacy.product_id, productId);
  assert.equal(legacy.order_id, null); assert.equal(legacy.status, 'active');
});

test('runtime cannot read or change password hashes', async () => {
  await assert.rejects(servicePool.query('SELECT * FROM rehab.credentials'), e => e.code === '42501');
  await assert.rejects(servicePool.query("UPDATE rehab.credentials SET password_hash='changed'"), e => e.code === '42501');
  assert.equal((await q('SELECT password_hash FROM rehab.credentials'))[0].password_hash, passwordFixture);
});
test('invoice allocation skips numeric legacy invoices even if sequence lagged', async () => {
  await q("SELECT setval('rehab.orders_invoice_id_seq', 1, false)");
  await q("INSERT INTO rehab.purchases (user_id,product_id,status,mode,robokassa_invoice_id) VALUES ($1,$2,'active','live','0001')", [userId,productId]);
  assert.equal((await order()).invoice_id, '2');
});
test('replay does not acknowledge corrupted processed state', async () => {
  const o = await order(); await processResult(servicePool, notice(o), config);
  await q('DELETE FROM rehab.mail_outbox WHERE order_id=$1', [o.id]);
  assert.equal((await callback(notice(o))).status, 503);
});
test('order creation uses server catalogue price and status endpoint is read-only and owner-bound', async () => {
  const o = await order({ userId, amount: '1.00' });
  assert.equal(o.amount, '8000.00');
  const status = () => fetch(`${base}/api/robokassa/orders/${o.invoice_id}/status`, { headers: { cookie: `mr_session=${token}` } });
  assert.equal((await (await status()).json()).data.status, 'pending');
  assert.deepEqual(await counts(), { payments: 0, purchases: 0, mail: 0 });
  await processResult(servicePool, notice(o), config);
  assert.equal((await (await status()).json()).data.status, 'paid');
  const foreign = await order({ buyerEmail: 'other@example.invalid' });
  assert.equal((await fetch(`${base}/api/robokassa/orders/${foreign.invoice_id}/status`, { headers: { cookie: `mr_session=${token}` } })).status, 404);
  assert.equal((await fetch(`${base}/api/robokassa/orders/${o.invoice_id}/status`)).status, 401);
});
