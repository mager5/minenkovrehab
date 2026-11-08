// Never connects on import. Called only by explicit manual setup/import commands.
async function inspect(client){
 const {rows:[target]}=await client.query('SELECT current_database() db,current_user role,host(inet_server_addr()) address');
 if(target.db!=='default_db'||target.role!=='gen_user'||target.address!=='192.168.10.4')throw Error('private_server_target_rejected');
 const {rows:[counts]}=await client.query(`SELECT
 (SELECT count(*)::int FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname NOT IN ('public','information_schema')) schemas,
 (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema') objects,
 (SELECT count(*)::int FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema' AND NOT EXISTS(SELECT 1 FROM pg_depend d WHERE d.classid='pg_proc'::regclass AND d.objid=p.oid AND d.deptype='e')) functions,
 (SELECT count(*)::int FROM pg_stat_activity WHERE datname=current_database() AND pid<>pg_backend_pid() AND backend_type='client backend') connections`);
 return counts;
}
async function requireEmpty(client,confirmation){
 if(confirmation!=='owner-verified-empty-and-unused')throw Error('owner_inventory_required');
 const counts=await inspect(client);
 if(Object.values(counts).some(n=>n!==0))throw Error('nonempty_or_busy_target_refused');
 return counts;
}
module.exports={inspect,requireEmpty};
