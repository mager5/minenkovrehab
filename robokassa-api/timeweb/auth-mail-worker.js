const {failed}=require('./delivery');
const { unseal }=require('./auth');
async function deliverReset(pool,sender,config) {
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const {rows:[job]}=await client.query(`SELECT m.*,r.expires_at,r.used_at FROM rehab.auth_mail_outbox m
      JOIN rehab.password_resets r ON r.token_hash=m.reset_hash WHERE m.status='pending' AND m.available_at<=now()
      ORDER BY m.id FOR UPDATE OF m SKIP LOCKED LIMIT 1`);
    if(!job){await client.query('COMMIT');return false;}
    if(job.used_at||new Date(job.expires_at)<=new Date()) {
      await client.query("UPDATE rehab.auth_mail_outbox SET status='sent',ciphertext='',last_error='obsolete' WHERE id=$1",[job.id]);
      await client.query('COMMIT');return false;
    }
    let receipt;
    try {
      const url=`${config.siteOrigin}/reset-password#token=${unseal(job.ciphertext,config.resetKey)}`;
      receipt=await sender.send({idempotencyKey:job.id,to:job.recipient,kind:'password_reset',url});
    } catch(error) {
      await failed(client,'auth_mail_outbox',job,error);
      await client.query('COMMIT');return false;
    }
    await client.query("UPDATE rehab.auth_mail_outbox SET status='sent',attempts=attempts+1,ciphertext='',last_error=NULL,provider_message_id=$2 WHERE id=$1",[job.id,receipt?.messageId||null]);
    await client.query('COMMIT');return true;
  }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
}
module.exports={deliverReset};
