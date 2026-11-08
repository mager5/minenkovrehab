// Starts a liveness-only shell until operator explicitly approves DB setup.
// No DB connection, automatic migration, seed or import during waiting.
const http=require('node:http');
function approved(env){return env.MIGRATION_ENV!=='private'||env.MIGRATION_DB_READY_CONFIRM==='verified-and-initialized-default_db';}
async function main(){
 const role=process.argv[2];if(!['api','worker'].includes(role))throw Error('explicit_process_required');
 if(approved(process.env)){
  if(role==='api')require('./server');else await require('./queue-worker').main();return;
 }
 const port=Number(role==='api'?process.env.STAGE1_PORT||3101:process.env.MIGRATION_WORKER_PORT||3102);
 const server=http.createServer((req,res)=>{res.statusCode=req.url==='/health/live'?200:503;res.end(req.url==='/health/live'?'waiting':'database_setup_not_approved');}).listen(port,'0.0.0.0');
 process.once('SIGTERM',()=>server.close());process.once('SIGINT',()=>server.close());
}
if(require.main===module)main().catch(()=>{console.error('private_boot_refused');process.exitCode=1;});
module.exports={approved};
