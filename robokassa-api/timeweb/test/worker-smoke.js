const {Pool}=require('pg');const {spawn}=require('node:child_process');const path=require('node:path');const assert=require('node:assert/strict');const crypto=require('node:crypto');
async function main(){
 const socket=process.env.STAGE1_TEST_SOCKET;if(!socket?.includes('rehab-stage1-'))throw Error('isolated_runner_required');
 const pool=new Pool({host:socket,port:55439,database:'rehab_stage1_test',user:'stage1_owner'});
 const {rows:[job]}=await pool.query(`WITH u AS (INSERT INTO rehab.users(email,email_confirmed_at) VALUES('worker@example.invalid',now()) RETURNING id),
 profile AS (INSERT INTO rehab.profiles(id,email) SELECT id,'worker@example.invalid' FROM u RETURNING id),
 product AS (INSERT INTO rehab.products(slug,title,price) VALUES('worker-synthetic','Synthetic',1) RETURNING id),
 orders AS (INSERT INTO rehab.orders(product_id,buyer_email,user_id,amount,mode,invoice_id) SELECT product.id,'worker@example.invalid',profile.id,1,'test',(SELECT COALESCE(max(invoice_id),0)+1 FROM rehab.orders) FROM product,profile RETURNING id)
 INSERT INTO rehab.mail_outbox(order_id,recipient,kind) SELECT id,'worker@example.invalid','purchase_access' FROM orders RETURNING id`);
 const env={PATH:process.env.PATH,HOME:socket,MIGRATION_ENV:'local',MIGRATION_SITE_ORIGIN:'http://127.0.0.1:3100',
 MIGRATION_DATABASE_URL:'postgresql://stage1_owner@127.0.0.1:55439/rehab_stage1_test',MIGRATION_WORKER_DATABASE_URL:'postgresql://stage1_owner@127.0.0.1:55439/rehab_stage1_test',
 MIGRATION_RESET_KEY:crypto.randomBytes(32).toString('hex'),STAGE1_TEST_PASSWORD2:crypto.randomBytes(32).toString('hex'),MIGRATION_MAIL_PROVIDER:'test',MIGRATION_WORKER_PORT:'3192'};
 const child=spawn(process.execPath,[path.join(__dirname,'../queue-worker.js')],{env,stdio:'ignore'});
 try{let ready=false;for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:3192/health/ready')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 assert.ok(ready);for(let i=0;i<50;i++){if((await pool.query('SELECT status FROM rehab.mail_outbox WHERE id=$1',[job.id])).rows[0].status==='sent')break;await new Promise(r=>setTimeout(r,100));}
 assert.equal((await pool.query('SELECT status FROM rehab.mail_outbox WHERE id=$1',[job.id])).rows[0].status,'sent');
 assert.equal((await pool.query("SELECT count(*)::int n FROM rehab.worker_heartbeat WHERE id='mail'")).rows[0].n,1);
 console.log('Worker process smoke: readiness, synthetic delivery, heartbeat, graceful stop passed.');
 }finally{child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));await pool.end();}
}
main().catch(error=>{console.error('Worker smoke failed:',error.code||error.name);console.error((error.stack||'').split('\n').slice(1).join('\n')); process.exitCode=1;});
