const {unseal}=require('./auth');const {failed}=require('./delivery');
async function deliverConfirmation(pool,sender,config){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const {rows:[job]}=await client.query(`SELECT m.*,c.expires_at,c.used_at FROM rehab.confirmation_mail_outbox m JOIN rehab.email_confirmations c ON c.token_hash=m.confirmation_hash WHERE m.status='pending' AND m.available_at<=now() ORDER BY m.id FOR UPDATE OF m SKIP LOCKED LIMIT 1`);
  if(!job){await client.query('COMMIT');return false;}
  if(job.used_at||new Date(job.expires_at)<=new Date()){
   await client.query("UPDATE rehab.confirmation_mail_outbox SET status='sent',ciphertext='',last_error='obsolete' WHERE id=$1",[job.id]);await client.query('COMMIT');return false;
  }
  let receipt;
  try{receipt=await sender.send({idempotencyKey:job.id,to:job.recipient,kind:'email_confirmation',url:`${config.siteOrigin}/confirm-email#token=${unseal(job.ciphertext,config.resetKey)}`});}
  catch(error){await failed(client,'confirmation_mail_outbox',job,error);await client.query('COMMIT');return false;}
  await client.query("UPDATE rehab.confirmation_mail_outbox SET status='sent',attempts=attempts+1,ciphertext='',last_error=NULL,provider_message_id=$2 WHERE id=$1",[job.id,receipt?.messageId||null]);
  await client.query('COMMIT');return true;
 }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
}
module.exports={deliverConfirmation};
