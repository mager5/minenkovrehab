// Synthetic browser harness only. No sink files, SMTP, provider calls or token logs.
const {main}=require('../queue-worker');
if(!process.send||process.env.MIGRATION_ENV!=='local'||process.env.MIGRATION_MAIL_PROVIDER!=='test')throw Error('local_ipc_test_required');
const accepted=new Set();
const testSender={async send(message){
 if(!message.to?.endsWith('@example.invalid'))throw Error('synthetic_recipient_required');
 if(!accepted.has(message.idempotencyKey)){accepted.add(message.idempotencyKey);process.send(message);}
}};
main(process.env,{testSender}).catch(()=>{console.error('synthetic_worker_failed');process.exitCode=1;});
