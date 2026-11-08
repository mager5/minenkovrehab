// Explicit synthetic-only seed, no dump/legacy input. Password never logged.
const bcrypt=require('bcryptjs');
const userId='50000000-0000-4000-8000-000000000001';
const productId='50000000-0000-4000-8000-000000000002';
async function seedSynthetic(pool,password){
 if(typeof password!=='string'||password.length<16||Buffer.byteLength(password)>72)throw Error('synthetic_password_required');
 const client=await pool.connect();
 try{
  await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(72648303)');
  const {rows:[target]}=await client.query('SELECT current_database() database');
  if(!['rehab_staging','rehab_stage1_test'].includes(target.database))throw Error('synthetic_target_required');
  const {rows:[counts]}=await client.query('SELECT (SELECT count(*)::int FROM rehab.users) users,(SELECT count(*)::int FROM rehab.products) products');
  if(counts.users||counts.products){
   const {rows:[existing]}=await client.query('SELECT u.email,c.password_hash FROM rehab.users u JOIN rehab.credentials c ON c.user_id=u.id WHERE u.id=$1',[userId]);
   const {rows:[product]}=await client.query('SELECT slug,title,price FROM rehab.products WHERE id=$1',[productId]);
   if(counts.users!==1||counts.products!==1||existing?.email!=='staging@example.invalid'||product?.slug!=='personal-program'||product?.title!=='Synthetic programme'||product?.price!=='8000.00'||!existing.password_hash.startsWith("$2"))throw Error('existing_nonmatching_seed_refused');
  }else{
   await client.query('INSERT INTO rehab.users(id,email,email_confirmed_at) VALUES($1,$2,now())',[userId,'staging@example.invalid']);
   await client.query("INSERT INTO rehab.credentials VALUES($1,$2,'bcrypt')",[userId,await bcrypt.hash(password,10)]);
   await client.query("INSERT INTO rehab.products(id,slug,title,price) VALUES($1,'personal-program','Synthetic programme',8000)",[productId]);
  }
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
}
module.exports={seedSynthetic};
