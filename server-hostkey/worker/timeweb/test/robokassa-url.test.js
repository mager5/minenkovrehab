const test=require('node:test');const assert=require('node:assert/strict');const crypto=require('node:crypto');
const {robokassaConfig,buildPaymentUrl}=require('../robokassa-url');
const env={ROBOKASSA_MERCHANT_LOGIN:'demo_shop',ROBOKASSA_TEST_PASSWORD1:'synthetic-test-pass1',ROBOKASSA_PASSWORD1:'synthetic-live-pass1'};
const order={amount:'8000.00',invoice_id:'1045',buyer_email:'buyer@example.invalid'};
test('not configured: no Robokassa link, checkout stays local',()=>{assert.equal(robokassaConfig({},'test'),null);});
test('login without password fails closed',()=>{assert.throws(()=>robokassaConfig({ROBOKASSA_MERCHANT_LOGIN:'demo_shop'},'test'),/incomplete/);});
test('test mode signs with test password #1 over the stored order and marks IsTest',()=>{
 const url=new URL(buildPaymentUrl(robokassaConfig(env,'test'),order,'personal-program'));
 const p=url.searchParams;assert.equal(url.origin+url.pathname,'https://auth.robokassa.ru/Merchant/Index.aspx');
 assert.equal(p.get('OutSum'),'8000.00');assert.equal(p.get('InvId'),'1045');assert.equal(p.get('IsTest'),'1');assert.equal(p.get('Email'),order.buyer_email);
 const receipt=JSON.parse(p.get('Receipt'));assert.equal(receipt.sno,'usn_income');assert.equal(receipt.items[0].sum,8000);assert.equal(receipt.items[0].tax,'none');
 const expected=crypto.createHash('md5').update(['demo_shop','8000.00','1045',p.get('Receipt'),'synthetic-test-pass1'].join(':')).digest('hex');
 assert.equal(p.get('SignatureValue'),expected);
});
test('live mode uses live password and omits IsTest',()=>{
 const p=new URL(buildPaymentUrl(robokassaConfig(env,'live'),order,'consultation')).searchParams;
 assert.equal(p.get('IsTest'),null);
 const expected=crypto.createHash('md5').update(['demo_shop','8000.00','1045',p.get('Receipt'),'synthetic-live-pass1'].join(':')).digest('hex');
 assert.equal(p.get('SignatureValue'),expected);
});
test('malformed stored amount is refused',()=>{assert.throws(()=>buildPaymentUrl(robokassaConfig(env,'test'),{...order,amount:'8000'},'personal-program'),/invalid_order_amount/);});
