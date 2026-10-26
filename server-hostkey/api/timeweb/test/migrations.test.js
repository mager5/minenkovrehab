const {test}=require('node:test');const assert=require('node:assert/strict');const {Pool}=require('pg');const {migrate}=require('../migrate');
test('migration ledger replay is safe and modified applied SQL is refused',async()=>{
 const socket=process.env.STAGE1_TEST_SOCKET;if(!socket?.includes('rehab-stage1-'))throw Error('isolated_runner_required');
 const pool=new Pool({host:socket,port:55439,database:'rehab_stage4_test',user:'stage1_owner'});
 try{await migrate(pool);await migrate(pool);assert.equal((await pool.query('SELECT count(*)::int n FROM public.rehab_schema_versions')).rows[0].n,5);
 await pool.query("UPDATE public.rehab_schema_versions SET checksum='changed' WHERE name='001_payment_core.sql'");
 await assert.rejects(()=>migrate(pool),e=>e.message==='migration_checksum_mismatch');assert.equal((await pool.query('SELECT count(*)::int n FROM rehab.users')).rows[0].n,0);
 }finally{await pool.end();}
});
