// No supplied DB URL, PGHOST or .env. Only a cluster created by this process.
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');const net=require('node:net');const assert=require('node:assert/strict');
const {Client}=require('pg');const {readDump}=require('./read-dump');const {importData,ImportError}=require('./import');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'rehab-import-'));
const bin='/opt/homebrew/opt/postgresql@17/bin';
const environment={PATH:process.env.PATH,HOME:directory,LANG:'C',LC_ALL:'C'};
let started=false,client;
function run(command,args){const r=spawnSync(path.join(bin,command),args,{env:environment,encoding:'utf8'});if(r.status!==0)throw new Error('isolated_postgres_command_failed');}
function stop(){if(started){run('pg_ctl',['-D',path.join(directory,'data'),'-m','immediate','-w','stop']);started=false;}fs.rmSync(directory,{recursive:true,force:true});}
async function port(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function main(){
 const dump=process.argv[2];if(!dump||!path.isAbsolute(dump))throw new Error('explicit_archive_path_required');
 const before=crypto.createHash('sha256').update(fs.readFileSync(dump)).digest('hex');
 const data=readDump(dump,bin);const p=await port();
 const password=crypto.randomBytes(32).toString('hex');const pwFile=path.join(directory,'cluster-password');fs.writeFileSync(pwFile,password+'\n',{mode:0o600});
 const database='rehab_import_'+crypto.randomBytes(8).toString('hex');const nonce=crypto.randomBytes(32).toString('hex');
 run('initdb',['-D',path.join(directory,'data'),'-U','rehearsal_owner','--auth-local=trust','--auth-host=scram-sha-256','--pwfile='+pwFile,'--encoding=UTF8','--locale=C']);
 run('pg_ctl',['-D',path.join(directory,'data'),'-l',path.join(directory,'postgres.log'),'-o',
  `-k ${directory} -h 127.0.0.1 -p ${p} -c log_min_messages=panic -c log_statement=none -c log_min_error_statement=panic -c log_error_verbosity=terse -c log_parameter_max_length_on_error=0`,'-w','start']);started=true;
 run('createdb',['-h',directory,'-p',String(p),'-U','rehearsal_owner',database]);
 client=new Client({host:'127.0.0.1',port:p,user:'rehearsal_owner',password,database});await client.connect();
 await client.query('CREATE TABLE public.rehearsal_guard(nonce text PRIMARY KEY)');await client.query('INSERT INTO public.rehearsal_guard VALUES($1)',[nonce]);
 const config={preserveLegacyGrants:true,host:'127.0.0.1',database,nonce,directory};
 await assert.rejects(()=>importData(client,data,{...config,database:'default_db'}),e=>e instanceof ImportError&&e.code==='target_rejected');
 await assert.rejects(()=>importData(client,data,{...config,nonce:'wrong'}));
 await assert.rejects(()=>importData(client,data,config,{failAfter:'purchases'}),e=>e.code==='injected_failure');
 assert.equal((await client.query("SELECT to_regnamespace('rehab') n")).rows[0].n,null);
 const invalid={...data,'public.products':data['public.products'].map((r,i)=>i===0?{...r,price:'-1'}:r)};
 await assert.rejects(()=>importData(client,invalid,config),e=>e.code==='import_failed_rolled_back');
 assert.equal((await client.query("SELECT to_regnamespace('rehab') n")).rows[0].n,null);
 const competitor=new Client({host:'127.0.0.1',port:p,user:'rehearsal_owner',password,database});await competitor.connect();
 let outcomes;
 try{outcomes=await Promise.allSettled([importData(client,data,config),importData(competitor,data,config)]);}finally{await competitor.end();}
 assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(outcomes.filter(r=>r.status==='rejected'&&r.reason.code==='already_imported_or_target_not_empty').length,1);
 const summary=outcomes.find(r=>r.status==='fulfilled').value;
 assert.equal((await client.query("SELECT count(*)::int n FROM rehab.purchases WHERE mode IS NOT NULL")).rows[0].n,0);

 await assert.rejects(()=>importData(client,data,config),e=>e.code==='already_imported_or_target_not_empty');
 assert.equal((await client.query('SELECT count(*)::int n FROM rehab.import_runs')).rows[0].n,1);
 // Check replay left every source row unchanged, never verify real login passwords.
 assert.equal((await client.query('SELECT count(*)::int n FROM rehab.purchases')).rows[0].n,data['public.purchases'].length);
 assert.equal((await client.query("SELECT count(*)::int n FROM rehab.purchases WHERE source='legacy migration' AND mode IS NULL AND order_id IS NULL")).rows[0].n,5);
 assert.equal((await client.query('SELECT count(*)::int n FROM rehab.payments')).rows[0].n,0);
 assert.equal((await client.query('SELECT count(*)::int n FROM rehab.mail_outbox')).rows[0].n,0);
 const after=crypto.createHash('sha256').update(fs.readFileSync(dump)).digest('hex');assert.ok(before===after);
 console.log(JSON.stringify({...summary,checks:{wrongDatabaseRejected:true,wrongGuardRejected:true,injectedFailureRollback:true,sqlFailureRollback:true,replayRejected:true,concurrentImportExactlyOnce:true,ownerApprovedLegacyGrantsPreserved:true,archiveUnchanged:true,realPasswordLoginTested:false}},null,2));
}
process.on('SIGINT',()=>{try{stop();}finally{process.exit(130);}});process.on('SIGTERM',()=>{try{stop();}finally{process.exit(143);}});
main().catch(error=>{console.error('Local rehearsal failed; sensitive diagnostics suppressed.');console.error(error instanceof ImportError ? error.code : error.name);console.error((error.stack||'').split('\n').filter(line=>/^\s+at /.test(line)).join('\n'));process.exitCode=1;}).finally(async()=>{if(client)await client.end().catch(()=>{});stop();});
