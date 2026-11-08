// Four real local processes, fresh synthetic-only cluster. Never accepts a target DB URL.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net'),crypto=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process'),assert=require('node:assert/strict');
const {Pool}=require('pg'),bcrypt=require('bcryptjs');
const bin='/opt/homebrew/opt/postgresql@17/bin',root=path.resolve(__dirname,'../../..');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const random=()=>crypto.randomBytes(24).toString('hex');
async function port(){const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const p=server.address().port;await new Promise(r=>server.close(r));return p;}
async function wait(check,label){for(let i=0;i<150;i++){try{if(await check())return;}catch{}await delay(100);}throw Error(label);}
async function main(){
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'rehab-staging-local-'));
 const environment={PATH:process.env.PATH,HOME:directory,LANG:'C',LC_ALL:'C',NEXT_TELEMETRY_DISABLED:'1'};
 const children=[];let started=false,pool,browser;let step='initialize';let memory;
 const run=(command,args,env=environment)=>{const result=spawnSync(command,args,{env,encoding:'utf8'});if(result.status!==0)throw Error('local_command_failed');};
 const child=(file,args,env,ipc=false)=>{const process=spawn(file,args,{cwd:directory,env,stdio:ipc?['ignore','ignore','ignore','ipc']:'ignore'});children.push(process);return process;};
 try{
  const [pgPort,apiPort,frontPort,workerPort]=await Promise.all([port(),port(),port(),port()]);
  const passwords=Object.fromEntries(['owner','rehab_migrator','rehab_payment','rehab_auth','rehab_worker'].map(k=>[k,random()]));
  const passwordFile=path.join(directory,'password');fs.writeFileSync(passwordFile,passwords.owner,{mode:0o600});
  run(path.join(bin,'initdb'),['-D',path.join(directory,'data'),'-U','owner','--pwfile',passwordFile,'--auth-local=trust','--auth-host=scram-sha-256','--encoding=UTF8','--locale=C']);fs.unlinkSync(passwordFile);
  run(path.join(bin,'pg_ctl'),['-D',path.join(directory,'data'),'-l',path.join(directory,'postgres.log'),'-o',`-k ${directory} -h 127.0.0.1 -p ${pgPort}`,'-w','start']);started=true;
  pool=new Pool({host:'127.0.0.1',port:pgPort,database:'postgres',user:'owner',password:passwords.owner});
  for(const role of ['rehab_migrator','rehab_payment','rehab_auth','rehab_worker'])await pool.query(`CREATE ROLE ${role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '${passwords[role]}'`);
  await pool.query('CREATE DATABASE rehab_stage1_test OWNER rehab_migrator');await pool.end();
  pool=new Pool({host:'127.0.0.1',port:pgPort,database:'rehab_stage1_test',user:'owner',password:passwords.owner});
  await pool.query('REVOKE ALL ON DATABASE rehab_stage1_test FROM PUBLIC');
  await pool.query('GRANT CONNECT ON DATABASE rehab_stage1_test TO rehab_migrator,rehab_payment,rehab_auth,rehab_worker');
  await pool.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
  const url=role=>`postgresql://${role}:${passwords[role]}@127.0.0.1:${pgPort}/rehab_stage1_test`;
  const site=`http://127.0.0.1:${frontPort}`,api=`http://127.0.0.1:${apiPort}`;
  const env={...environment,MIGRATION_ENV:'local',MIGRATION_SITE_ORIGIN:site,MIGRATION_API_INTERNAL_URL:api,
   MIGRATION_DATABASE_URL:url('rehab_payment'),MIGRATION_AUTH_DATABASE_URL:url('rehab_auth'),MIGRATION_WORKER_DATABASE_URL:url('rehab_worker'),
   MIGRATION_RESET_KEY:crypto.randomBytes(32).toString('hex'),STAGE1_TEST_PASSWORD2:random(),MIGRATION_MAIL_PROVIDER:'test',MIGRATION_VIDEO_PROVIDER:'disabled',STAGE1_PORT:String(apiPort),MIGRATION_WORKER_PORT:String(workerPort)};
  step='migrations';run(process.execPath,[path.join(root,'robokassa-api/timeweb/migrate.js'),'--grants'],{...env,MIGRATION_MIGRATOR_DATABASE_URL:url('rehab_migrator'),MIGRATION_MIGRATION_CONFIRM:'isolated-rehab-schema'});
  assert.equal((await pool.query('SELECT count(*)::int n FROM public.rehab_schema_versions')).rows[0].n,5);
  for(const role of ['rehab_payment','rehab_auth','rehab_worker']){const restricted=new Pool({connectionString:url(role)});try{await assert.rejects(()=>restricted.query('CREATE TABLE public.forbidden(id int)'),e=>e.code==='42501');await assert.rejects(()=>restricted.query('CREATE DATABASE forbidden'),e=>e.code==='42501');if(role!=='rehab_auth')await assert.rejects(()=>restricted.query('SELECT * FROM rehab.credentials'),e=>e.code==='42501');}finally{await restricted.end();}}
  step='synthetic seed replay';const {seedSynthetic}=require('../synthetic-seed');await seedSynthetic(pool,random());const seedHash=(await pool.query('SELECT password_hash FROM rehab.credentials')).rows[0].password_hash;await seedSynthetic(pool,random());assert.equal((await pool.query('SELECT password_hash FROM rehab.credentials')).rows[0].password_hash,seedHash);await pool.query("INSERT INTO rehab.products(slug,title,price) VALUES('unexpected','Synthetic unexpected',100)");await assert.rejects(()=>seedSynthetic(pool,random()),e=>e.message==='existing_nonmatching_seed_refused');await pool.query('TRUNCATE rehab.users,rehab.products CASCADE');
  const email='staging@example.invalid',password=random()+'A!',hash=await bcrypt.hash(password,10);
  const {rows:[user]}=await pool.query('INSERT INTO rehab.users(email,email_confirmed_at) VALUES($1,now()) RETURNING id',[email]);
  await pool.query("INSERT INTO rehab.credentials VALUES($1,$2,'bcrypt')",[user.id,hash]);
  await pool.query("INSERT INTO rehab.products(slug,title,price) VALUES('personal-program','Synthetic programme',8000),('foreign-course','Synthetic foreign course',100)");
  // A synthetic binding only: access is checked but playback must remain disabled.
  const {rows:[video]}=await pool.query("INSERT INTO rehab.videos(user_id,title,file_path) VALUES($1,'Synthetic placeholder','synthetic/disabled') RETURNING id",[user.id]);
  await pool.query("INSERT INTO rehab.course_videos(product_id,lesson_key,video_id,ready) SELECT id,'stage-3',$1,true FROM rehab.products WHERE slug='personal-program'",[video.id]);
  const messages=[];step='start services';const apiProcess=child(process.execPath,[path.join(root,'robokassa-api/timeweb/server.js')],env);
  const worker=child(process.execPath,[path.join(__dirname,'worker-ipc.js')],env,true);worker.on('message',message=>messages.push(message));
  const build=process.env.STAGE2_NEXT_BUILD;if(!build||!fs.existsSync(path.join(build,'.next/BUILD_ID')))throw Error('isolated_next_build_required');
  const next=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start','-H','127.0.0.1','-p',String(frontPort)],{cwd:build,env:{...environment,NODE_ENV:'production',MIGRATION_ENV:'local',MIGRATION_SITE_ORIGIN:site,MIGRATION_API_INTERNAL_URL:api},stdio:'ignore'});children.push(next);
  if(process.env.STAGE5_MEMORY_REPORT){memory=require('./memory-sampler').measure({frontend:next.pid,api:apiProcess.pid,worker:worker.pid,postgres:Number(fs.readFileSync(path.join(directory,'data/postmaster.pid'),'utf8').split('\n')[0])});}
  for(const origin of [api,`http://127.0.0.1:${workerPort}`])await wait(async()=>(await fetch(origin+'/health/ready')).ok,'service_readiness');
  await wait(async()=>(await fetch(site+'/api/health')).ok,'frontend_readiness');assert.ok((await fetch(site+'/api/health/live')).ok);
  const {chromium}=require('playwright-core');browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-networking','--disable-component-update','--no-first-run','--disable-sync']});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.route('**/*',route=>new URL(route.request().url()).origin===site?route.continue():route.abort());
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('dialog',dialog=>dialog.accept());
  const login=async(pass)=>{await page.goto(site+'/login');const banner=page.getByRole('button',{name:/Только необходимые/});if(await banner.isVisible())await banner.click();await page.locator('#email').fill(email);await page.locator('#password').fill(pass);await page.locator('form button[type=submit]').click();await page.waitForURL('**/dashboard');await page.locator('[data-session-authenticated]').waitFor();};
  const request=endpoint=>context.request.get(site+endpoint);
  step='login dashboard no profile';await login(password);assert.equal((await pool.query('SELECT count(*)::int n FROM rehab.profiles')).rows[0].n,0);
  step='access without purchase';assert.equal((await request('/api/courses/meniscus-resection-rehab/access')).status(),403);await page.goto(site+'/dashboard/courses/meniscus-resection-rehab');await page.getByRole('heading',{name:'Доступ к курсу закрыт'}).waitFor();
  step='checkout';await page.goto(site+'/products/personal-program');for(const checkbox of await page.locator('input[type=checkbox]').all())await checkbox.locator('..').click();await page.getByRole('button',{name:/Купить онлайн:/}).first().click();await page.waitForURL('**/payment/success?InvId=*');await page.getByText('Заказ ожидает подтверждения оплаты.').waitFor();
  const {rows:[order]}=await pool.query('SELECT invoice_id,amount FROM rehab.orders');assert.equal((await pool.query('SELECT count(*)::int n FROM rehab.purchases')).rows[0].n,0);assert.equal(order.amount,'8000.00');
  step='signed synthetic ResultURL';const signature=crypto.createHash('md5').update(`${order.amount}:${order.invoice_id}:${env.STAGE1_TEST_PASSWORD2}`).digest('hex');
  const notify=()=>fetch(site+'/api/robokassa/result',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({OutSum:order.amount,InvId:order.invoice_id,SignatureValue:signature,IsTest:'1'})});
  const first=await notify();assert.equal(first.status,200);assert.equal(await first.text(),'OK'+order.invoice_id);
  step='sequential and concurrent ResultURL replay';for(const response of [await notify(),...await Promise.all(Array.from({length:6},notify))]){assert.equal(response.status,200);assert.equal(await response.text(),'OK'+order.invoice_id);}
  for(const table of ['payments','purchases','mail_outbox'])assert.equal((await pool.query(`SELECT count(*)::int n FROM rehab.${table}`)).rows[0].n,1);
  assert.equal((await pool.query('SELECT password_hash FROM rehab.credentials')).rows[0].password_hash,hash);
  step='paid status access disabled playback';await page.reload();await page.getByText('Оплата подтверждена. Доступ открыт в личном кабинете.').waitFor();assert.equal((await request('/api/courses/meniscus-resection-rehab/access')).status(),200);assert.equal((await request('/api/courses/foreign-course/access')).status(),403);assert.equal((await request('/api/courses/personal-program/videos/stage-3')).status(),503);
  step='purchased course SSR';await page.goto(site+'/dashboard/courses/meniscus-resection-rehab');await page.locator('h1').first().waitFor();assert.equal(await page.getByRole('heading',{name:'Доступ к курсу закрыт'}).count(),0);
  await page.goto(site+'/dashboard');await page.locator('[data-session-authenticated]').waitFor();
  step='worker purchase delivery';await wait(async()=>(await pool.query("SELECT count(*)::int n FROM rehab.mail_outbox WHERE status='sent'")).rows[0].n===1,'worker_purchase');assert.equal(messages.filter(m=>m.kind==='purchase_access').length,1);
  step='logout';await page.getByRole('button',{name:'Меню профиля',exact:true}).hover();const logout=page.locator('button:visible').filter({hasText:'Выйти'}).first();await logout.focus();const response=page.waitForResponse(r=>r.url()===site+'/api/auth/logout'&&r.request().method()==='POST');await logout.press('Enter');assert.equal((await response).status(),200);await page.waitForURL('**/login*');assert.equal((await request('/api/auth/me')).status(),401);await page.goto(site+'/dashboard');await page.waitForURL('**/login*');
  step='password recovery through actual worker';await page.goto(site+'/forgot-password');await page.locator('#email').fill(email);await page.locator('form button[type=submit]').click();await page.getByText('Запрос принят').waitFor();await wait(()=>messages.some(m=>m.kind==='password_reset'),'worker_reset');const reset=messages.find(m=>m.kind==='password_reset');
  const changed=random()+'Z!';await page.goto(reset.url);await page.locator('#password').fill(changed);await page.locator('#confirmPassword').fill(changed);await page.locator('form button[type=submit]').click();await page.getByText('Пароль успешно изменен').waitFor();await login(changed);
  assert.equal((await pool.query("SELECT count(*)::int n FROM rehab.auth_mail_outbox WHERE status='sent' AND ciphertext=''")).rows[0].n,1);
  step='consumed reset cannot be reused';await page.goto(reset.url);await page.locator('#password').fill(changed);await page.locator('#confirmPassword').fill(changed);const reused=page.waitForResponse(r=>r.url()===site+'/api/auth/reset-password'&&r.request().method()==='POST');await page.locator('form button[type=submit]').click();assert.equal((await reused).status(),400);
  console.log(JSON.stringify({scenario:'four-service synthetic staging',passed:true,services:4,users:1,products:2,orders:1,payments:1,purchases:1,purchaseMessages:1,resetMessages:1,resultNotifications:8,realExternalCalls:0}));
 }catch(error){throw Error('Synthetic staging failed at '+step+' ('+(error.code||error.name)+'); sensitive diagnostics suppressed');}
 finally{
  if(memory){const destination=process.env.STAGE5_MEMORY_REPORT;if(/^\/private\/tmp\/rehab-[a-z0-9-]+\.json$/.test(destination))fs.writeFileSync(destination,JSON.stringify(memory.stop(),null,2));else memory.stop();}
  if(browser)await browser.close();for(const process of children.reverse()){if(process.exitCode===null&&process.signalCode===null){const ended=new Promise(r=>process.once('exit',r));process.kill('SIGTERM');await Promise.race([ended,delay(5000)]);if(process.exitCode===null&&process.signalCode===null)process.kill('SIGKILL');}}
  if(pool)await pool.end();if(started)run(path.join(bin,'pg_ctl'),['-D',path.join(directory,'data'),'-m','fast','-w','stop']);fs.rmSync(directory,{recursive:true,force:true});
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
