// Manual ONLY; dump must be supplied privately, never baked into an image.
const {Client}=require('pg');const {loadConfig}=require('../config');const {inspect}=require('../private-target');
async function main(){
 const config=loadConfig(process.env);if(process.env.MIGRATION_ENV!=='private')throw Error('private_only');
 const client=new Client({connectionString:config.databaseUrl,ssl:false,connectionTimeoutMillis:5000});await client.connect();
 try{
  if(process.argv[2]==='--inspect'){
   await client.query('BEGIN READ ONLY');await client.query("SET LOCAL statement_timeout='5s'");const counts=await inspect(client);
   const {rows:tables}=await client.query("SELECT n.nspname schema,c.relname name FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema' AND c.relkind IN ('r','p','m') ORDER BY 1,2");
   const quote=value=>'"'+value.replaceAll('"','""')+'"';
   for(const table of tables){const result=await client.query('SELECT count(*)::text n FROM '+quote(table.schema)+'.'+quote(table.name));table.rows=result.rows[0].n;}
   await client.query('ROLLBACK');console.log(JSON.stringify({counts,tables}));return;
  }
  if(process.argv[2]!=='--execute'||!process.env.MIGRATION_DUMP_PATH||process.env.MIGRATION_IMPORT_CONFIRM!=='import-reviewed-backup-once')throw Error('manual_import_confirmation_required');
  const {readDump}=require('./read-dump');const data=readDump(process.env.MIGRATION_DUMP_PATH,process.env.MIGRATION_PG_BIN||'/usr/bin');
  const summary=await require('./import').importData(client,data,{privateTarget:true,ownerConfirmation:process.env.MIGRATION_DB_CONTENTS_CONFIRM,preserveLegacyGrants:true});
  console.log(JSON.stringify({counts:summary.after,exactHashes:summary.exactHashes,legacyGrants:summary.ownerApprovedLegacyGrants}));
 }finally{await client.end();}
}
if(require.main===module)main().catch(()=>{console.error('private_inspection_or_import_refused');process.exitCode=1;});
module.exports={main};
