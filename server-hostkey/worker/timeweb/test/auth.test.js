const {test,before,after,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const bcrypt=require('bcryptjs');const {Pool}=require('pg');const {spawn}=require('node:child_process');
const {createApp}=require('../app');const {verifyPassword,digest}=require('../auth');
const {processResult}=require('../payments');const {TestSender}=require('../mail-worker');const {deliverReset}=require('../auth-mail-worker');
const {loadConfig}=require('../config');
const socket=process.env.STAGE1_TEST_SOCKET;if(!socket||!socket.includes('rehab-stage1-'))throw new Error('Use temporary runner');
const db={host:socket,port:55439,database:'rehab_stage2_test'};
const owner=new Pool({...db,user:'stage1_owner'});let paymentPool,authPool,server,base,nextServer;
const site='http://127.0.0.1:3128';
const config={siteOrigin:site,resetKey:crypto.randomBytes(32).toString('hex'),loginLimit:5};
const paymentConfig={mode:'test',password2:crypto.randomBytes(32).toString('hex')};
const uid='10000000-0000-4000-8000-000000000002';
const pid='20000000-0000-4000-8000-000000000002';
const email='synthetic@example.invalid';
const password=crypto.randomBytes(16).toString('hex')+'A!';
let initialHash;
const q=async(sql,values)=>(await owner.query(sql,values)).rows;
class Browser {
  constructor(url){this.url=url;this.cookies=new Map();}
  async request(endpoint,{method='GET',body,csrf,origin=site}={}){
    const headers={cookie:[...this.cookies].map(([k,v])=>`${k}=${v}`).join('; ')};
    if(method!=='GET'){headers.origin=origin;headers['content-type']='application/json';if(csrf)headers['x-csrf-token']=csrf;}
    const response=await fetch(this.url+endpoint,{method,headers,...(body?{body:JSON.stringify(body)}:{}),redirect:'manual'});
    const cookies=response.headers.getSetCookie?.()||response.headers.get('set-cookie')?.split(/,(?=\s*[^;,\s]+=)/)||[];
    for(const value of cookies){const first=value.split(';')[0];const i=first.indexOf('=');this.cookies.set(first.slice(0,i).trim(),first.slice(i+1));}
    return response;
  }
  async post(endpoint,body){const r=await this.request('/api/auth/csrf');const data=await r.json();return this.request(endpoint,{method:'POST',body,csrf:data.data.csrfToken});}
  async login(){return this.post('/api/auth/signin',{email,password});}
}
before(async()=>{
  for(const file of ['001_payment_core.sql','002_auth.sql','003_import.sql','004_providers.sql','005_legacy_and_confirmation.sql'])await owner.query(fs.readFileSync(path.join(__dirname,'../migrations',file),'utf8'));
  await q(`CREATE ROLE stage2_payment LOGIN; CREATE ROLE stage2_auth LOGIN;
    GRANT USAGE ON SCHEMA rehab TO stage2_payment,stage2_auth;
    GRANT SELECT,INSERT,UPDATE ON rehab.users,rehab.orders TO stage2_payment;
    GRANT SELECT,INSERT ON rehab.profiles,rehab.payments,rehab.purchases TO stage2_payment;
    GRANT SELECT,INSERT,UPDATE ON rehab.mail_outbox TO stage2_payment;
    GRANT SELECT ON rehab.products,rehab.sessions,rehab.course_videos TO stage2_payment;
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA rehab TO stage2_payment;
    GRANT SELECT,UPDATE ON rehab.users TO stage2_auth;
    GRANT SELECT,INSERT,UPDATE ON rehab.credentials,rehab.sessions,rehab.csrf_challenges,
      rehab.auth_limits,rehab.password_resets,rehab.auth_mail_outbox,rehab.email_confirmations,rehab.confirmation_mail_outbox TO stage2_auth;
    GRANT SELECT ON rehab.profiles,rehab.products,rehab.purchases TO stage2_auth;`);
  paymentPool=new Pool({...db,user:'stage2_payment'});authPool=new Pool({...db,user:'stage2_auth'});
  const {createKinescope}=require('../providers/kinescope');const videoProvider=createKinescope({secret:crypto.randomBytes(32).toString('hex'),basicUser:'synthetic',basicPassword:'synthetic',issuer:site,strictAcknowledged:true});
  server=createApp({pool:paymentPool,authPool,authConfig:config,paymentConfig,videoProvider}).listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;
  initialHash=await bcrypt.hash(password,10);
  if(process.env.STAGE2_NEXT_BUILD){
    const directory=process.env.STAGE2_NEXT_BUILD;
    nextServer=spawn(process.execPath,[path.resolve(__dirname,'../../../node_modules/next/dist/bin/next'),'start','-H','127.0.0.1','-p','3128'],{
      cwd:directory,env:{PATH:process.env.PATH,HOME:directory,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',
        MIGRATION_ENV:'local',MIGRATION_SITE_ORIGIN:site,MIGRATION_API_INTERNAL_URL:base},stdio:'ignore'});
    let ready=false;
    for(let i=0;i<100;i++){try{await fetch(site+'/api/auth/csrf');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}
    if(!ready)throw new Error('Isolated SSR server did not start');
  }
});
after(async()=>{
  if(nextServer){nextServer.kill('SIGTERM');await new Promise(r=>nextServer.once('exit',r));}
  if(server)await new Promise(r=>server.close(r));
  if(paymentPool)await paymentPool.end();if(authPool)await authPool.end();await owner.end();
});
beforeEach(async()=>{
  await q('TRUNCATE rehab.users,rehab.products,rehab.csrf_challenges,rehab.auth_limits CASCADE');
  await q('INSERT INTO rehab.users (id,email,email_confirmed_at) VALUES ($1,$2,now())',[uid,email]);
  await q("INSERT INTO rehab.profiles (id,email,full_name) VALUES ($1,$2,'Synthetic')",[uid,email]);
  await q("INSERT INTO rehab.credentials VALUES ($1,$2,'bcrypt')",[uid,initialHash]);
  await q("INSERT INTO rehab.products (id,slug,title,price) VALUES ($1,'personal-program','Synthetic',8000)",[pid]);
});
test('synthetic bcrypt 2a, 2b, 2y verify correct password and reject wrong password',async()=>{
  for(const version of ['2a','2b','2y']){
    const hash=initialHash.replace(/^\$2b\$/,'$'+version+'$');
    assert.ok(await verifyPassword(password,hash));assert.ok(!await verifyPassword(password+'x',hash));
  }
  assert.ok(!await verifyPassword('a'.repeat(73),initialHash));
});
test('login, me and logout with HttpOnly SameSite and persisted session hash',async()=>{
  const browser=new Browser(base);const response=await browser.login();assert.equal(response.status,200);
  const set=response.headers.get('set-cookie');assert.ok(set.includes('HttpOnly')&&set.includes('SameSite=Lax'));
  assert.equal((await browser.request('/api/auth/me')).status,200);
  const [session]=await q('SELECT token_hash FROM rehab.sessions');
  assert.ok(session.token_hash===digest(browser.cookies.get('mr_session')));
  assert.ok(session.token_hash!==browser.cookies.get('mr_session'));
  assert.equal((await browser.post('/api/auth/logout',{})).status,200);
  assert.equal((await browser.request('/api/auth/me')).status,401);
});
test('HTTPS configuration emits Secure cookies without trusting request headers',async()=>{
  const secureConfig={...config,siteOrigin:'https://stage.example.invalid'};
  const s=createApp({pool:paymentPool,authPool,authConfig:secureConfig,paymentConfig}).listen(0,'127.0.0.1');
  await new Promise(r=>s.once('listening',r));
  try{const r=await fetch(`http://127.0.0.1:${s.address().port}/api/auth/csrf`);assert.ok(r.headers.get('set-cookie').includes('Secure'));}
  finally{await new Promise(r=>s.close(r));}
});
test('expired, revoked and blocked/deleted sessions are rejected',async()=>{
  for(const mutation of ["UPDATE rehab.sessions SET expires_at=now()-interval '1 second'",'UPDATE rehab.sessions SET revoked_at=now()',"UPDATE rehab.users SET banned_until=now()+interval '1 day'",'UPDATE rehab.users SET deleted_at=now()']){
    await q('UPDATE rehab.users SET deleted_at=NULL,banned_until=NULL');await q('TRUNCATE rehab.auth_limits');
    const browser=new Browser(base);assert.equal((await browser.login()).status,200);await q(mutation);
    assert.equal((await browser.request('/api/auth/me')).status,401);
  }
});
test('CSRF requires matching token, cookie, session binding and exact origin',async()=>{
  const browser=new Browser(base);
  assert.equal((await browser.request('/api/auth/signin',{method:'POST',body:{email,password}})).status,403);
  const challenge=await (await browser.request('/api/auth/csrf')).json();const csrf=challenge.data.csrfToken;
  assert.equal((await browser.request('/api/auth/signin',{method:'POST',body:{email,password},csrf,origin:'https://foreign.example.invalid'})).status,403);
  assert.equal((await browser.request('/api/auth/signin',{method:'POST',body:{email,password},csrf:'0'.repeat(64)})).status,403);
  assert.equal((await browser.login()).status,200);
  assert.equal((await browser.request('/api/auth/logout',{method:'POST',csrf,body:{}})).status,403);
});
test('persistent login limit applies to sequential and concurrent attempts',async()=>{
  const browser=new Browser(base);
  for(let i=0;i<5;i++)assert.equal((await browser.post('/api/auth/signin',{email,password:'wrong'})).status,401);
  assert.equal((await browser.login()).status,429);
  await q('TRUNCATE rehab.auth_limits');
  const replies=await Promise.all(Array.from({length:8},()=>new Browser(base).post('/api/auth/signin',{email,password:'wrong'})));
  assert.equal(replies.filter(r=>r.status===401).length,5);assert.equal(replies.filter(r=>r.status===429).length,3);
});
test('reset request is anonymous-safe, encrypted outbox, one-time reset revokes all old sessions',async()=>{
  const browser=new Browser(base);await browser.login();const oldCookie=browser.cookies.get('mr_session');
  const valid=await browser.post('/api/auth/forgot-password',{email});
  const unknown=await new Browser(base).post('/api/auth/forgot-password',{email:'unknown@example.invalid'});
  assert.ok((await valid.text())===(await unknown.text()));
  const sender=new TestSender();assert.ok(await deliverReset(authPool,sender,config));
  const resetToken=new URL(sender.messages[0].url).hash.slice('#token='.length);
  const [reset]=await q('SELECT token_hash FROM rehab.password_resets');assert.ok(reset.token_hash===digest(resetToken));
  const [job]=await q('SELECT ciphertext FROM rehab.auth_mail_outbox');assert.equal(job.ciphertext,'');
  const changed=crypto.randomBytes(16).toString('hex')+'B!';
  assert.equal((await browser.post('/api/auth/reset-password',{token:resetToken,password:changed})).status,200);
  assert.equal((await browser.post('/api/auth/reset-password',{token:resetToken,password:changed})).status,400);
  const old=new Browser(base);old.cookies.set('mr_session',oldCookie);assert.equal((await old.request('/api/auth/me')).status,401);
  const [credential]=await q('SELECT password_hash FROM rehab.credentials');assert.ok(await verifyPassword(changed,credential.password_hash));
});
test('expired reset token and concurrent reuse cannot reset twice',async()=>{
  const browser=new Browser(base);await browser.post('/api/auth/forgot-password',{email});
  const sender=new TestSender();await deliverReset(authPool,sender,config);const token=new URL(sender.messages[0].url).hash.slice(7);
  await q("UPDATE rehab.password_resets SET expires_at=now()-interval '1 second'");
  assert.equal((await browser.post('/api/auth/reset-password',{token,password})).status,400);
  await q("UPDATE rehab.password_resets SET expires_at=now()+interval '1 hour'");
  const replies=await Promise.all(Array.from({length:2},()=>new Browser(base).post('/api/auth/reset-password',{token,password})));
  assert.equal(replies.filter(r=>r.status===200).length,1);assert.equal(replies.filter(r=>r.status===400).length,1);
});
test('checkout binds owner/catalogue and success/status cannot grant a purchase',async()=>{
  const browser=new Browser(base);
  // Гость без email — 400; гость с email — заказ на его email по цене каталога, без привязки к аккаунту.
  assert.equal((await browser.post('/api/checkout',{productId:'personal-program',agreement:true})).status,400);
  assert.equal((await browser.post('/api/checkout',{productId:'personal-program',agreement:true,email:'not-an-email'})).status,400);
  const guest=await new Browser(base).post('/api/checkout',{productId:'personal-program',agreement:true,email:' Guest@Example.invalid ',amount:1});
  assert.equal(guest.status,200);assert.equal((await guest.json()).data.amount,'8000.00');
  const [guestOrder]=await q('SELECT * FROM rehab.orders WHERE user_id IS NULL');assert.ok(guestOrder.buyer_email==='guest@example.invalid'&&guestOrder.amount==='8000.00');
  await browser.login();
  assert.equal((await browser.post('/api/checkout',{productId:'personal-program'})).status,400);
  const checkout=await browser.post('/api/checkout',{productId:'personal-program',agreement:true,amount:1,email:'foreign@example.invalid',receipt:{items:[]}});
  assert.equal(checkout.status,200);const result=await checkout.json();assert.equal(result.data.amount,'8000.00');assert.ok(result.data.paymentUrl.startsWith('/payment/success?'));
  const [order]=await q('SELECT * FROM rehab.orders WHERE user_id IS NOT NULL');assert.ok(order.user_id===uid&&order.buyer_email===email);
  const status=await (await browser.request(`/api/robokassa/orders/${order.invoice_id}/status`)).json();assert.equal(status.data.status,'pending');
  assert.equal((await browser.request('/api/courses/meniscus-resection-rehab/access')).status,403);
  const params={OutSum:order.amount,InvId:order.invoice_id};params.SignatureValue=crypto.createHash('md5').update(`${params.OutSum}:${params.InvId}:${paymentConfig.password2}`).digest('hex');
  await processResult(paymentPool,params,paymentConfig);
  assert.equal((await browser.request('/api/courses/meniscus-resection-rehab/access')).status,200);
  assert.equal((await browser.request('/api/courses/another-course/access')).status,403);
  assert.ok((await q('SELECT password_hash FROM rehab.credentials'))[0].password_hash===initialHash);
});
test('configuration rejects implicit/production services and incomplete staging',()=>{
  assert.throws(()=>loadConfig({}));assert.throws(()=>loadConfig({MIGRATION_ENV:'production'}));
  assert.throws(()=>loadConfig({MIGRATION_ENV:'staging',MIGRATION_SITE_ORIGIN:'http://stage.example.invalid'}));
  const env={MIGRATION_ENV:'staging',MIGRATION_SITE_ORIGIN:'https://stage.example.invalid',MIGRATION_DATABASE_URL:'postgres://rehab_payment@192.168.10.4/rehab_staging',MIGRATION_STAGING_CONFIRM:'synthetic-rehab-staging',MIGRATION_PG_TLS:'verify-full',MIGRATION_PG_CA:'-----BEGIN CERTIFICATE-----\nsynthetic configuration fixture\n-----END CERTIFICATE-----',STAGE1_TEST_PASSWORD2:'synthetic',MIGRATION_RESET_KEY:'a'.repeat(64)};
  const c=loadConfig(env);
  assert.equal(c.payment.mode,'test');
  assert.equal(c.ssl.rejectUnauthorized,true);
  assert.equal(c.ssl.checkServerIdentity('ignored',{subjectaltname:'IP Address:192.168.10.4'}),undefined);
  assert.equal(c.ssl.checkServerIdentity('ignored',{subjectaltname:'IP Address:127.0.0.1'}).code,'ERR_TLS_CERT_ALTNAME_INVALID');
  for(const patch of [{MIGRATION_STAGING_CONFIRM:''},{MIGRATION_PG_TLS:'disable'},{MIGRATION_PG_CA:''},{MIGRATION_DATABASE_URL:'postgres://rehab_payment@192.168.10.4/default_db'},{MIGRATION_DATABASE_URL:env.MIGRATION_DATABASE_URL+'?sslmode=no-verify'},{MIGRATION_AUTH_DATABASE_URL:'postgres://rehab_auth@192.168.10.4/rehab_staging?sslmode=disable'},{MIGRATION_DATABASE_URL:'postgres://gen_user@192.168.10.4/rehab_staging'}])assert.throws(()=>loadConfig({...env,...patch}));
});
test('Next proxy, middleware and SSR share login/logout and course checks',{skip:!process.env.STAGE2_NEXT_BUILD},async()=>{
  const browser=new Browser(site);
  const anonymous=await browser.request('/dashboard');assert.equal(anonymous.status,307);assert.ok(anonymous.headers.get('location').includes('/login'));
  assert.equal((await browser.login()).status,200);
  const dashboard=await browser.request('/dashboard');assert.equal(dashboard.status,200);assert.ok((await dashboard.text()).includes('data-session-authenticated'));
  const denied=await browser.request('/dashboard/courses/meniscus-resection-rehab');assert.equal(denied.status,200);assert.ok((await denied.text()).includes('Доступ к курсу закрыт'));
  const checkout=await browser.post('/api/checkout',{productId:'personal-program',agreement:true});assert.equal(checkout.status,200);
  const invoice=(await checkout.json()).data.invoiceId;
  const success=await browser.request(`/payment/success?InvId=${invoice}`);assert.equal(success.status,200);
  assert.equal((await q('SELECT count(*)::int n FROM rehab.purchases'))[0].n,0);
  await q('UPDATE rehab.sessions SET revoked_at=now()');assert.equal((await browser.request('/dashboard')).status,307);
});

test('synthetic browser: login dashboard checkout status logout recovery and foreign course',
 {skip:!process.env.STAGE3_BROWSER||!process.env.STAGE2_NEXT_BUILD},async()=>{
 const {chromium}=require('playwright-core');let browser;let step='launch';
 try{
  browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,
   args:['--disable-background-networking','--disable-component-update','--no-first-run','--disable-sync']});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',route=>new URL(route.request().url()).origin===site?route.continue():route.abort());
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('dialog',d=>d.accept());
  const login=async(pass)=>{
   step='login page';await page.goto(site+'/login');
   const banner=page.getByRole('button',{name:/Только необходимые/});if(await banner.isVisible())await banner.click();
   step='login form';await page.locator('#email').fill(email);await page.locator('#password').fill(pass);
   step='login submit';await page.locator('form button[type=submit]').click();await page.waitForURL('**/dashboard');
   await page.locator('[data-session-authenticated]').waitFor();
  };
  step='updated Swiper carousel';await page.goto(site+'/products/rehabilitation-protocols');await page.locator('.swiper-initialized').waitFor();
  const before=await page.locator('.swiper-slide-active').first().getAttribute('data-swiper-slide-index');
  await page.locator('.swiper-button-next-custom').click();
  await page.waitForFunction(previous=>document.querySelector('.swiper-slide-active')?.getAttribute('data-swiper-slide-index')!==previous,before);
  await q('DELETE FROM rehab.profiles WHERE id=$1',[uid]);
  step='login and dashboard';await login(password);
  step='foreign course';await page.goto(site+'/dashboard/courses/meniscus-resection-rehab');
  await page.getByRole('heading',{name:'Доступ к курсу закрыт'}).waitFor();
  step='checkout';await page.goto(site+'/products/personal-program');
  step='checkout consent';for(const checkbox of await page.locator('input[type=checkbox]').all()){await checkbox.locator('..').click();assert.ok(await checkbox.isChecked());}
  step='checkout submit';
  await page.getByRole('button',{name:/Купить онлайн:/}).first().click();
  await page.waitForURL('**/payment/success?InvId=*');
  step='order status';await page.getByText('Заказ ожидает подтверждения оплаты.').waitFor();
  assert.equal((await q('SELECT count(*)::int n FROM rehab.orders'))[0].n,1);
  assert.equal((await q('SELECT count(*)::int n FROM rehab.purchases'))[0].n,0);
  step='logout';await page.getByRole('button',{name:'Меню профиля',exact:true}).hover();
  step='logout control';const logout=page.locator('button:visible').filter({hasText:'Выйти'}).first();await logout.focus();const logoutResponse=page.waitForResponse(r=>r.url()===site+'/api/auth/logout'&&r.request().method()==='POST');await logout.press('Enter');assert.equal((await logoutResponse).status(),200);await page.waitForURL('**/login*');
  step='logout redirect';
  await page.goto(site+'/dashboard');await page.waitForURL('**/login*');
  step='forgot password';await page.goto(site+'/forgot-password');await page.locator('#email').fill(email);
  await page.locator('form button[type=submit]').click();
  await page.getByText('Запрос принят').waitFor();
  const sender=new TestSender();assert.ok(await deliverReset(authPool,sender,config));
  step='reset password';await page.goto(sender.messages[0].url);
  const changed=crypto.randomBytes(16).toString('hex')+'Z!';await page.locator('#password').fill(changed);
  await page.locator('#confirmPassword').fill(changed);await page.locator('form button[type=submit]').click();
  await page.getByText('Пароль успешно изменен').waitFor();
  step='login after reset';await login(changed);
  await q('UPDATE rehab.users SET email_confirmed_at=NULL');await q('UPDATE rehab.sessions SET revoked_at=now()');
  step='confirmation request';await page.goto(site+'/confirm-email');await page.locator('input[type=email]').fill(email);await page.locator('form button[type=submit]').click();
  await page.getByText('Если подтверждение необходимо, инструкция поставлена в очередь.').waitFor();
  const confirmSender=new TestSender();const {deliverConfirmation}=require('../confirmation-mail-worker');assert.ok(await deliverConfirmation(authPool,confirmSender,config));
  step='confirmation consume';await page.goto(confirmSender.messages[0].url);await page.getByRole('button',{name:'Подтвердить по ссылке из письма',exact:true}).click();
  await page.getByText('Email подтверждён. Теперь можно войти.').waitFor();
  step='login after confirmation';await login(changed);
 }catch{throw new Error('Synthetic browser scenario failed at: '+step+'; sensitive diagnostics suppressed');}
 finally{if(browser)await browser.close();}
});

test('unclassified historical active purchase does not grant course or video access',async()=>{
 const browser=new Browser(base);assert.equal((await browser.login()).status,200);
 await q("INSERT INTO rehab.purchases(id,user_id,product_id,status,mode) VALUES(gen_random_uuid(),$1,$2,'active',NULL)",[uid,pid]);
 assert.equal((await browser.request('/api/courses/meniscus-resection-rehab/access')).status,403);
 assert.equal((await browser.request('/api/courses/personal-program/videos/lesson-1')).status,403);
});

test('unconfirmed imported email cannot obtain a login session',async()=>{
 await q('UPDATE rehab.users SET email_confirmed_at=NULL');
 const browser=new Browser(base);assert.equal((await browser.login()).status,401);
 assert.equal((await q('SELECT count(*)::int n FROM rehab.sessions'))[0].n,0);
});

test('profile absent does not block login or dashboard identity',async()=>{
 await q('DELETE FROM rehab.profiles WHERE id=$1',[uid]);const browser=new Browser(base);
 assert.equal((await browser.login()).status,200);assert.equal((await browser.request('/api/auth/me')).status,200);
 assert.equal((await q('SELECT count(*)::int n FROM rehab.profiles'))[0].n,0);
});
test('unconfirmed account requires one-time confirmation sent only by test sender',async()=>{
 const {deliverConfirmation}=require('../confirmation-mail-worker');
 await q('UPDATE rehab.users SET email_confirmed_at=NULL');const browser=new Browser(base);
 assert.equal((await browser.login()).status,401);
 assert.equal((await browser.post('/api/auth/request-confirmation',{email})).status,200);
 const sender=new TestSender();assert.ok(await deliverConfirmation(authPool,sender,config));
 const token=new URL(sender.messages[0].url).hash.slice(7);
 assert.equal((await browser.post('/api/auth/confirm-email',{token})).status,200);
 assert.equal((await browser.post('/api/auth/confirm-email',{token})).status,400);
 assert.equal((await browser.login()).status,200);
});
test('owner approved legacy grant allows access but is not a recorded payment',async()=>{
 await q("INSERT INTO rehab.purchases(user_id,product_id,status,mode,source) VALUES($1,$2,'active',NULL,'legacy migration')",[uid,pid]);
 const browser=new Browser(base);assert.equal((await browser.login()).status,200);
 assert.equal((await browser.request('/api/courses/personal-program/access')).status,200);
 assert.equal((await browser.request('/api/courses/other/access')).status,403);
 assert.equal((await q('SELECT count(*)::int n FROM rehab.payments'))[0].n,0);
 await q("UPDATE rehab.purchases SET source='payment'");assert.equal((await browser.request('/api/courses/personal-program/access')).status,403);
});
test('queue retry, permanent failure and concurrent workers preserve one accepted job',async()=>{
 const {deliverOne}=require('../mail-worker');const {DeliveryError}=require('../providers/rusender');
 const {createOrder}=require('../payments');const order=await createOrder(owner,{productSlug:'personal-program',buyerEmail:email,userId:uid,mode:'test'});
 const signature=crypto.createHash('md5').update(`${order.amount}:${order.invoice_id}:${paymentConfig.password2}`).digest('hex');
 // Use actual transaction path, not an inserted paid state.
 const params={OutSum:order.amount,InvId:String(order.invoice_id),SignatureValue:signature,IsTest:'1'};
 await processResult(paymentPool,params,paymentConfig);
 await deliverOne(owner,{send:async()=>{throw new DeliveryError('provider_rejected',{retryAfter:120});}});
 const [retry]=await q('SELECT status,attempts,extract(epoch FROM available_at-now()) delay FROM rehab.mail_outbox');assert.equal(retry.status,'pending');assert.equal(retry.attempts,1);assert.ok(Number(retry.delay)>110);
 await q('UPDATE rehab.mail_outbox SET available_at=now()');let sent=0;
 const sender={send:async()=>{sent++;await new Promise(r=>setTimeout(r,30));return{messageId:'synthetic'};}};
 const results=await Promise.all([deliverOne(owner,sender),deliverOne(owner,sender)]);assert.equal(sent,1);assert.equal(results.filter(Boolean).length,1);
 await q("UPDATE rehab.mail_outbox SET status='pending',available_at=now()");
 await deliverOne(owner,{send:async()=>{throw new DeliveryError('permanent',{retryable:false});}});assert.equal((await q('SELECT status FROM rehab.mail_outbox'))[0].status,'failed');
 assert.equal((await q('SELECT status FROM rehab.orders'))[0].status,'paid');
});

test('Kinescope callback queries actual course entitlement and session, fail closed after logout',async()=>{
 const vid='30000000-0000-4000-8000-000000000004';const provider='40000000-0000-4000-8000-000000000004';
 await q("INSERT INTO rehab.videos(id,user_id,title,file_path) VALUES($1,$2,'Synthetic','synthetic')",[vid,uid]);
 await q("INSERT INTO rehab.course_videos VALUES($1,'stage-3',$2,$3,true)",[pid,vid,provider]);
 await q("INSERT INTO rehab.purchases(user_id,product_id,status,mode,source) VALUES($1,$2,'active',NULL,'legacy migration')",[uid,pid]);
 const browser=new Browser(base);assert.equal((await browser.login()).status,200);
 const playback=await browser.request('/api/courses/personal-program/videos/stage-3');assert.equal(playback.status,200);
 const token=new URL((await playback.json()).data.embedUrl).searchParams.get('drmauthtoken');
 const callback=()=>fetch((process.env.STAGE2_NEXT_BUILD?site:base)+'/api/kinescope/authorize',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Basic '+Buffer.from('synthetic:synthetic').toString('base64')},body:JSON.stringify({id:provider,type:'video',token})});
 assert.equal((await callback()).status,200);await browser.post('/api/auth/logout',{});assert.equal((await callback()).status,403);
});

test('mail commit failure retries same key without duplicate delivery; retry budget ends in failed',async()=>{
 const {createOrder}=require('../payments');const {deliverOne}=require('../mail-worker');
 const order=await createOrder(owner,{productSlug:'personal-program',buyerEmail:email,userId:uid,mode:'test'});
 const params={OutSum:order.amount,InvId:String(order.invoice_id),IsTest:'1'};params.SignatureValue=crypto.createHash('md5').update(`${params.OutSum}:${params.InvId}:${paymentConfig.password2}`).digest('hex');await processResult(paymentPool,params,paymentConfig);
 await q("CREATE FUNCTION rehab.fail_mail_commit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic'; END $$; CREATE CONSTRAINT TRIGGER fail_mail_commit AFTER UPDATE ON rehab.mail_outbox DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION rehab.fail_mail_commit()");
 const sender=new TestSender();try{await assert.rejects(()=>deliverOne(owner,sender));assert.equal((await q('SELECT status FROM rehab.mail_outbox'))[0].status,'pending');}
 finally{await q('DROP TRIGGER fail_mail_commit ON rehab.mail_outbox;DROP FUNCTION rehab.fail_mail_commit()');}
 assert.ok(await deliverOne(owner,sender));assert.equal(sender.messages.length,1);
 await q("UPDATE rehab.mail_outbox SET status='pending',attempts=7,available_at=now()");await deliverOne(owner,new TestSender({fail:true}));
 const [job]=await q('SELECT status,attempts FROM rehab.mail_outbox');assert.equal(job.status,'failed');assert.equal(job.attempts,8);
});
