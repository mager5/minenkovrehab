const {test}=require('node:test');const assert=require('node:assert/strict');const crypto=require('node:crypto');
const {RuSender,DeliveryError}=require('../providers/rusender');const {createKinescope}=require('../providers/kinescope');const {mailProvider}=require('../providers/config');
const id='10000000-0000-4000-8000-000000000001';const video='20000000-0000-4000-8000-000000000001';
const config={token:'synthetic',keyId:1,from:'sender@example.invalid',siteOrigin:'https://stage.example.invalid',namespace:'synthetic'};
test('RuSender sends official format with stable key and no passwords; external transport mocked',async()=>{
 const requests=[];const sender=new RuSender({...config,transport:async(url,options)=>{requests.push({url,body:JSON.parse(options.body)});return new Response(JSON.stringify({uuid:id}));}});
 const message={idempotencyKey:id,to:'synthetic@example.invalid',kind:'purchase_access',password:'never-forward'};
 assert.equal((await sender.send(message)).messageId,id);await sender.send(message);
 assert.equal(requests[0].body.idempotencyKey,requests[1].body.idempotencyKey);assert.equal(requests[0].body.mail.to.email,message.to);assert.ok(!JSON.stringify(requests).includes('never-forward'));
 assert.equal(requests[0].url,'https://api.rusender.ru/api/v1/external-mails/send/1');
});
test('RuSender retries 429 and 503, permanently rejects 422, redacts provider errors',async()=>{
 for(const status of [429,503,422]){
  const sender=new RuSender({...config,transport:async()=>new Response('private provider body',{status,headers:{'Retry-After':'120'}})});
  await assert.rejects(()=>sender.send({idempotencyKey:id,to:'synthetic@example.invalid',kind:'purchase_access'}),e=>e instanceof DeliveryError&&e.retryable===(status!==422)&&e.message==='provider_rejected'&&e.retryAfter===120);
 }
 const sender=new RuSender({...config,transport:async()=>{throw Error('private');}});
 await assert.rejects(()=>sender.send({idempotencyKey:id,kind:'purchase_access'}),e=>e.message==='transport_failed');
 assert.throws(()=>mailProvider({}, {auth:{siteOrigin:config.siteOrigin}}));
});
test('Kinescope token expires, rejects tampering/wrong video/basic, rechecks entitlement at callback',async()=>{
 let clock=Date.now();const provider=createKinescope({secret:crypto.randomBytes(32).toString('hex'),basicUser:'synthetic',basicPassword:'synthetic',issuer:config.siteOrigin,strictAcknowledged:true},()=>clock);
 const output=await provider.playback(video,{user:{id},req:{headers:{cookie:'mr_session='+crypto.randomBytes(32).toString('hex')}}});const token=new URL(output.embedUrl).searchParams.get('drmauthtoken');
 const req={get:()=> 'Basic '+Buffer.from('synthetic:synthetic').toString('base64'),body:{type:'video',id:video,token}};let calls=0;
 const pool={query:async(sql)=>{calls++;assert.ok(sql.includes('revoked_at')&&sql.includes("status='active'")&&sql.includes('legacy migration'));return{rows:[{}]};}};
 assert.equal(await provider.authorize(pool,req,'test'),200);assert.equal(calls,1);
 assert.equal(await provider.authorize({query:async()=>({rows:[]})},req,'test'),403);
 assert.equal(await provider.authorize(pool,{...req,body:{...req.body,id}},'test'),403);
 assert.equal(await provider.authorize(pool,{...req,body:{...req.body,token:token+'x'}},'test'),403);
 assert.equal(await provider.authorize(pool,{...req,get:()=>''},'test'),403);clock+=121000;assert.equal(await provider.authorize(pool,req,'test'),403);
});
test('patched protobuf can encode/decode synthetic message',()=>{
 const path=require('node:path');const protobuf=require(require.resolve('protobufjs',{paths:[path.dirname(require.resolve('@heygen/streaming-avatar/package.json'))]}));
 const type=protobuf.parse('syntax="proto3";message Demo{string text=1;}').root.lookupType('Demo');assert.equal(type.decode(type.encode({text:'synthetic'}).finish()).text,'synthetic');
});
test('staging mailbox delivers only synthetic reset/confirmation; rejects missing opt-in and live mode',async()=>{
 const env={MIGRATION_ENV:'staging',MIGRATION_MAIL_PROVIDER:'staging-mailbox',MIGRATION_MAIL_NETWORK_ENABLED:'true',MIGRATION_MAIL_ALLOWED_RECIPIENTS:'staging@example.invalid',MIGRATION_MAIL_NAMESPACE:'synthetic',MIGRATION_TEST_MAILBOX:'mailbox@example.invalid',MIGRATION_TEST_MAILBOX_CONFIRM:'dedicated-synthetic-mailbox',RUSENDER_API_TOKEN:'synthetic',RUSENDER_KEY_ID:'1',RUSENDER_FROM:'sender@example.invalid'};
 const cfg={auth:{siteOrigin:config.siteOrigin},payment:{mode:'test'}};const requests=[];
 const sender=mailProvider(env,cfg,async(url,options)=>{requests.push(JSON.parse(options.body));return new Response(JSON.stringify({uuid:id}));});
 const message={idempotencyKey:id,to:'staging@example.invalid',kind:'password_reset',url:config.siteOrigin+'/reset-password#token='+crypto.randomBytes(32).toString('hex')};
 await sender.send(message);await sender.send(message);
 assert.equal(requests[0].mail.to.email,env.MIGRATION_TEST_MAILBOX);assert.equal(requests[0].idempotencyKey,requests[1].idempotencyKey);
 await sender.send({...message,kind:'purchase_access'});assert.equal(requests.length,2);
 await assert.rejects(()=>sender.send({...message,to:'real@some-domain.invalid'}),e=>e.message==='recipient_not_allowed');
 await assert.rejects(()=>sender.send({...message,kind:'unknown'}),e=>e.message==='unsupported_mailbox_kind');
 for(const changes of [{MIGRATION_MAIL_NETWORK_ENABLED:'false'},{MIGRATION_TEST_MAILBOX_CONFIRM:''},{MIGRATION_MAIL_ALLOWED_RECIPIENTS:'other@domain.invalid'},{MIGRATION_ENV:'local'}])assert.throws(()=>mailProvider({...env,...changes},cfg));
 assert.throws(()=>mailProvider(env,{...cfg,payment:{mode:'live'}}));
});
