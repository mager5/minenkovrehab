const {test}=require('node:test');const assert=require('node:assert/strict');const {loadConfig}=require('../config');const {requireEmpty}=require('../private-target');
const env={MIGRATION_ENV:'private',MIGRATION_SITE_ORIGIN:'https://app.example.invalid',MIGRATION_DATABASE_URL:'postgresql://gen_user:synthetic@192.168.10.4:5432/default_db',MIGRATION_PG_TLS:'disabled-private',MIGRATION_PRIVATE_CONFIRM:'Friendly-Halimede-default_db-gen_user',MIGRATION_RESET_KEY:'a'.repeat(64),STAGE1_TEST_PASSWORD2:'synthetic'};
test('private mode explicit, pinned, HTTPS; cannot fall back from failed TLS config',()=>{
 assert.equal(loadConfig(env).ssl,false);assert.equal(loadConfig(env).authDatabaseUrl,loadConfig(env).databaseUrl);
 for(const change of [{MIGRATION_PG_TLS:'verify-full'},{MIGRATION_PRIVATE_CONFIRM:''},{MIGRATION_SITE_ORIGIN:'http://app.example.invalid'},{MIGRATION_DATABASE_URL:env.MIGRATION_DATABASE_URL.replace('192.168.10.4','192.168.10.5')},{MIGRATION_DATABASE_URL:env.MIGRATION_DATABASE_URL+'?sslmode=disable'},{MIGRATION_DATABASE_URL:env.MIGRATION_DATABASE_URL.replace('gen_user','other')},{MIGRATION_AUTH_DATABASE_URL:env.MIGRATION_DATABASE_URL.replace('synthetic','different')}])assert.throws(()=>loadConfig({...env,...change}));
 assert.throws(()=>loadConfig({...env,MIGRATION_ENV:'staging'}));
});
test('manual target refuses unknown objects, consumers, wrong actual server and absent owner approval',async()=>{
 const client=(counts,target={db:'default_db',role:'gen_user',address:'192.168.10.4'})=>({query:async sql=>({rows:[sql.startsWith('SELECT current_database()')?target:counts]})});
 const empty={schemas:0,objects:0,functions:0,connections:0};
 await requireEmpty(client(empty),'owner-verified-empty-and-unused');
 await assert.rejects(()=>requireEmpty(client(empty),''));
 for(const key of Object.keys(empty))await assert.rejects(()=>requireEmpty(client({...empty,[key]:1}),'owner-verified-empty-and-unused'));
 await assert.rejects(()=>requireEmpty(client(empty,{db:'other',role:'gen_user',address:'192.168.10.4'}),'owner-verified-empty-and-unused'));
});
test('private import transaction and replay ledger on isolated synthetic PG; endpoint metadata simulated',async()=>{
 const {Client,Pool}=require('pg');const options={host:process.env.STAGE1_TEST_SOCKET,port:55439,user:'stage1_owner'};
 if(!options.host)return;
 const admin=new Client({...options,database:'postgres'});await admin.connect();await admin.query('CREATE DATABASE rehab_private_unit');await admin.end();
 const client=new Client({...options,database:'rehab_private_unit'});await client.connect();
 const guarded={query:async(sql,args)=>{
  const result=await client.query(sql,args);
  if(sql.startsWith('SELECT current_database() db,current_user role,host(')){
   assert.equal(result.rows[0].db,'rehab_private_unit');return {rows:[{db:'default_db',role:'gen_user',address:'192.168.10.4'}]};
  }
  return result;
 }};
 const data=Object.fromEntries(['auth.users','auth.identities','public.profiles','public.products','public.purchases','public.videos'].map(k=>[k,[]]));
 const config={privateTarget:true,ownerConfirmation:'owner-verified-empty-and-unused'};
 try{
  const {importData}=require('../import/import');
  await assert.rejects(()=>importData(guarded,data,config,{failAfter:'users'}));
  assert.equal((await client.query("SELECT to_regnamespace('rehab') n")).rows[0].n,null);
  await importData(guarded,data,config);
  assert.equal((await client.query('SELECT count(*)::int n FROM public.rehab_schema_versions')).rows[0].n,5);
  await assert.rejects(()=>importData(guarded,data,config));
  const pool=new Pool({...options,database:'rehab_private_unit'});try{await require('../migrate').migrate(pool);}finally{await pool.end();}
  assert.equal((await client.query('SELECT count(*)::int n FROM rehab.import_runs')).rows[0].n,1);
 }finally{await client.end();}
});
test('private boot is closed before explicit operator approval',()=>{
 const {approved}=require('../private-boot');assert.equal(approved({MIGRATION_ENV:'private'}),false);assert.equal(approved({MIGRATION_ENV:'private',MIGRATION_DB_READY_CONFIRM:'wrong'}),false);assert.equal(approved({MIGRATION_ENV:'private',MIGRATION_DB_READY_CONFIRM:'verified-and-initialized-default_db'}),true);
});
