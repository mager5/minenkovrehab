// Уведомление владельцу об оплате (admin_outbox, заполняется триггером из миграции 006).
// Получатель — MIGRATION_ADMIN_NOTIFY_EMAIL у worker. Без адреса уведомления помечаются как пропущенные.
const {failed}=require('./delivery');
const ADDRESS=/^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[^\s@<>]{2,24}$/;
function adminRecipient(env){const to=String(env.MIGRATION_ADMIN_NOTIFY_EMAIL||'').trim();return ADDRESS.test(to)?to:null;}
async function deliverAdmin(pool,sender,recipient){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const {rows:[job]}=await client.query(`SELECT * FROM rehab.admin_outbox WHERE status='pending' AND available_at<=now()
   ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1`);
  if(!job){await client.query('COMMIT');return false;}
  if(!recipient){
   await client.query("UPDATE rehab.admin_outbox SET status='sent',last_error='no_recipient' WHERE id=$1",[job.id]);
   await client.query('COMMIT');return false;
  }
  let receipt;
  try{
   receipt=await sender.send({idempotencyKey:job.id,to:recipient,kind:'admin_payment',order:{
    invoiceId:job.invoice_id,product:job.product_title,amount:job.amount,currency:job.currency,
    buyer:job.buyer_email,mode:job.mode,createdAt:job.created_at}});
  }catch(error){await failed(client,'admin_outbox',job,error);await client.query('COMMIT');return false;}
  await client.query("UPDATE rehab.admin_outbox SET status='sent',attempts=attempts+1,sent_at=now(),last_error=NULL,provider_message_id=$2 WHERE id=$1",
   [job.id,receipt?.messageId||null]);
  await client.query('COMMIT');return true;
 }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
}
module.exports={deliverAdmin,adminRecipient};
