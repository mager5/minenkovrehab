// Continuous process. No .env, no legacy routes, no logs containing jobs.
const http=require('node:http');const {Pool}=require('pg');const {loadConfig}=require('./config');
const {mailProvider}=require('./providers/config');const {deliverOne}=require('./mail-worker');
const {deliverReset}=require('./auth-mail-worker');const {deliverConfirmation}=require('./confirmation-mail-worker');
async function cycle(pool,sender,config){
 await deliverOne(pool,sender);await deliverReset(pool,sender,config);await deliverConfirmation(pool,sender,config);
 await pool.query("INSERT INTO rehab.worker_heartbeat VALUES('mail',now()) ON CONFLICT(id) DO UPDATE SET last_seen=EXCLUDED.last_seen");
}
async function main(env=process.env,{testSender}={}){
 const config=loadConfig(env);const url=new URL(env.MIGRATION_WORKER_DATABASE_URL||(env.MIGRATION_ENV==='private'?config.databaseUrl:''));const target=new URL(config.databaseUrl);
 if(['protocol','hostname','port','pathname'].some(k=>url[k]!==target[k]))throw Error('worker_isolated_database_required');
 if(testSender&&(env.MIGRATION_ENV!=='local'||env.MIGRATION_MAIL_PROVIDER!=='test'))throw Error('local_test_sender_only');
 if(env.MIGRATION_ENV==='staging'&&(url.username!=='rehab_worker'||url.search))throw Error('restricted_worker_role_required');
 if(env.MIGRATION_ENV==='private'&&url.toString()!==target.toString())throw Error('private_worker_target_required');
 const pool=new Pool({connectionString:url.toString(),ssl:config.ssl,connectionTimeoutMillis:5000,max:2});const sender=testSender||mailProvider(env,config);
 let healthy=false,stopping=false,lastSuccess=0;
 const server=http.createServer((req,res)=>{const live=req.url==='/health/live';const ready=req.url==='/health/ready'&&healthy&&Date.now()-lastSuccess<30000;
  res.statusCode=live||ready?200:503;res.end(live||ready?'ok':'unavailable');}).listen(Number(env.MIGRATION_WORKER_PORT||3102),config.host);
 const stop=()=>{stopping=true;};process.once('SIGTERM',stop);process.once('SIGINT',stop);
 try{while(!stopping){try{await cycle(pool,sender,config.auth);healthy=true;lastSuccess=Date.now();}catch{healthy=false;}
  if(!stopping)await new Promise(r=>setTimeout(r,1000));}}
 finally{await new Promise(r=>server.close(r));await pool.end();}
}
if(require.main===module)main().catch(()=>{console.error('worker_configuration_or_startup_failed');process.exitCode=1;});
module.exports={cycle,main};
