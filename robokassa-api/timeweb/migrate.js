// Only own migration schema; explicit config and independent migration role required.
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const {Pool}=require('pg');const {loadConfig}=require('./config');
async function migrate(pool,privateConfirmation=null){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(72648302)');
  const {rows:[state]}=await client.query("SELECT to_regnamespace('rehab') schema,to_regclass('public.rehab_schema_versions') ledger");
  if(privateConfirmation&&!state.ledger)await require('./private-target').requireEmpty(client,privateConfirmation);
  if(state.schema&&!state.ledger)throw Error('untracked_existing_schema_refused');
  await client.query('CREATE TABLE IF NOT EXISTS public.rehab_schema_versions(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
  await client.query('REVOKE ALL ON public.rehab_schema_versions FROM PUBLIC');
  for(const name of fs.readdirSync(path.join(__dirname,'migrations')).filter(n=>/^\d{3}_[a-z_]+\.sql$/.test(n)).sort()){
   const sql=fs.readFileSync(path.join(__dirname,'migrations',name),'utf8');const hash=crypto.createHash('sha256').update(sql).digest('hex');
   const {rows:[version]}=await client.query('SELECT checksum FROM public.rehab_schema_versions WHERE name=$1',[name]);
   if(version){if(version.checksum!==hash)throw Error('migration_checksum_mismatch');continue;}
   await client.query(sql.replace(/^BEGIN;\s*|\bCOMMIT;\s*$/gm,''));
   await client.query('INSERT INTO public.rehab_schema_versions(name,checksum) VALUES($1,$2)',[name,hash]);
  }
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
}
async function main(){
 const config=loadConfig(process.env);const url=new URL(process.env.MIGRATION_MIGRATOR_DATABASE_URL||(process.env.MIGRATION_ENV==='private'?config.databaseUrl:''));const target=new URL(config.databaseUrl);
 if(['protocol','hostname','port','pathname'].some(k=>url[k]!==target[k])||(process.env.MIGRATION_ENV!=='private'&&url.username===target.username)||process.env.MIGRATION_MIGRATION_CONFIRM!=='isolated-rehab-schema')throw Error('isolated_migrator_confirmation_required');
 if(process.env.MIGRATION_ENV==='staging'&&(url.username!=='rehab_migrator'||url.search))throw Error('restricted_migrator_role_required');
 const pool=new Pool({connectionString:url.toString(),ssl:config.ssl,connectionTimeoutMillis:5000,max:1});try{if(process.env.MIGRATION_ENV==='private'&&(url.toString()!==target.toString()||process.argv.includes('--grants')||process.argv.includes('--synthetic-seed')||process.env.MIGRATION_DB_CONTENTS_CONFIRM!=='owner-verified-empty-and-unused'))throw Error('manual_private_migration_required');
  await migrate(pool,process.env.MIGRATION_ENV==='private'?process.env.MIGRATION_DB_CONTENTS_CONFIRM:null);
  if(process.argv.includes('--grants')){const packaged=path.join(__dirname,'runtime-roles.sql');await pool.query(fs.readFileSync(fs.existsSync(packaged)?packaged:path.resolve(__dirname,'../../deploy/timeweb/roles.sql'),'utf8'));}
  if(process.argv.includes('--synthetic-seed'))await require('./synthetic-seed').seedSynthetic(pool,process.env.MIGRATION_SYNTHETIC_PASSWORD);
  console.log('Own schema migrations committed.');}finally{await pool.end();}
}
if(require.main===module)main().catch(()=>{console.error('migration_refused_or_rolled_back');process.exitCode=1;});
module.exports={migrate};
