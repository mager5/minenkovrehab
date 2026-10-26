const test=require('node:test');const assert=require('node:assert/strict');
const {mailProvider}=require('../providers/config');
const cfg={auth:{siteOrigin:'https://minenkovrehab.ru'}};
const env={MIGRATION_ENV:'vps',MIGRATION_MAIL_PROVIDER:'smtp',MIGRATION_MAIL_NETWORK_ENABLED:'true',SMTP_HOST:'mail.hosting.reg.ru',SMTP_PORT:'465',
 SMTP_USER:'noreply@minenkovrehab.ru',SMTP_PASSWORD:'x',SMTP_REPLY_TO:'support@minenkovrehab.ru'};
const id='3f2b8c1e-1d2a-4c5b-9e8f-0a1b2c3d4e5f';
function fake(behaviour){const sent=[];return {sent,transport:{async sendMail(m){sent.push(m);if(behaviour)throw behaviour;return {messageId:'<abc@reg.ru>'};}}};}

test('smtp sender: purchase mail',async()=>{
 const t=fake();const s=mailProvider(env,cfg,t.transport);
 const r=await s.send({idempotencyKey:id,to:'buyer@example.com',kind:'purchase_access',orderId:'1'});
 assert.equal(r.messageId,'<abc@reg.ru>');assert.equal(t.sent[0].to,'buyer@example.com');
 assert.equal(t.sent[0].from.address,'noreply@minenkovrehab.ru');assert.equal(t.sent[0].replyTo,'support@minenkovrehab.ru');
 assert.match(t.sent[0].text,/https:\/\/minenkovrehab\.ru\/dashboard/);assert.match(t.sent[0].text,/forgot-password/);
});
test('smtp sender: reset link must be same-origin one-time link',async()=>{
 const t=fake();const s=mailProvider(env,cfg,t.transport);const token='a'.repeat(64);
 await s.send({idempotencyKey:id,to:'u@example.com',kind:'password_reset',url:`https://minenkovrehab.ru/reset-password#token=${token}`});
 assert.match(t.sent[0].text,new RegExp(token));
 await assert.rejects(s.send({idempotencyKey:id,to:'u@example.com',kind:'password_reset',url:`https://evil.example/reset-password#token=${token}`}),e=>e.retryable===false);
 await assert.rejects(s.send({idempotencyKey:id,to:'u@example.com',kind:'other'}),e=>e.retryable===false);
});
test('smtp sender: error classes',async()=>{
 await assert.rejects(mailProvider(env,cfg,fake(Object.assign(Error('x'),{responseCode:550})).transport).send({idempotencyKey:id,to:'u@example.com',kind:'purchase_access'}),e=>e.retryable===false);
 await assert.rejects(mailProvider(env,cfg,fake(Object.assign(Error('x'),{code:'ETIMEDOUT'})).transport).send({idempotencyKey:id,to:'u@example.com',kind:'purchase_access'}),e=>e.retryable===true);
});
test('smtp sender: guarded configuration',async()=>{
 assert.throws(()=>mailProvider({...env,MIGRATION_ENV:'staging'},cfg));
 assert.throws(()=>mailProvider({...env,MIGRATION_MAIL_NETWORK_ENABLED:'false'},cfg));
 assert.throws(()=>mailProvider({...env,SMTP_PASSWORD:''},cfg));
 const s=mailProvider({...env,MIGRATION_MAIL_ALLOWED_RECIPIENTS:'me@example.com'},cfg,fake().transport);
 await assert.rejects(s.send({idempotencyKey:id,to:'other@example.com',kind:'purchase_access'}),e=>e.retryable===false);
});
