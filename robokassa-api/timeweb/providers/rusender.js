class DeliveryError extends Error{
 constructor(code,{retryable=true,retryAfter=0}={}){super(code);this.code=code;this.retryable=retryable;this.retryAfter=retryAfter;}
}
class RuSender{
 constructor({token,keyId,from,siteOrigin,namespace,timeoutMs=8000,transport=fetch}){
  if(!token||!/^\d+$/.test(String(keyId))||!from||! /^[a-zA-Z0-9_-]{1,32}$/.test(namespace||'')||!siteOrigin)throw Error('rusender_configuration_missing');
  this.config={token,keyId,from,siteOrigin,namespace,timeoutMs};this.transport=transport;
 }
 async send(message){
  const c=this.config;
  if(!/^[a-f\d-]{36}$/i.test(message.idempotencyKey||''))throw new DeliveryError('invalid_job',{retryable:false});
  let subject,text;
  if(message.kind==='purchase_access'){subject='Покупка подтверждена';text=`Покупка сохранена. Материалы доступны в личном кабинете: ${c.siteOrigin}/dashboard`;}
  else if(['password_reset','email_confirmation'].includes(message.kind)){
   let url;try{url=new URL(message.url);}catch{throw new DeliveryError('invalid_reset',{retryable:false});}
   if(url.origin!==c.siteOrigin||url.pathname!==(message.kind==='password_reset'?'/reset-password':'/confirm-email')||!/^#token=[a-f\d]{64}$/.test(url.hash))throw new DeliveryError('invalid_reset',{retryable:false});
   subject=message.kind==='password_reset'?'Восстановление доступа':'Подтверждение email';text=`Для подтверждения запроса используйте одноразовую ссылку: ${url.toString()}\nЕсли вы не запрашивали восстановление, проигнорируйте письмо.`;
  }else throw new DeliveryError('invalid_template',{retryable:false});
  let response;
  try{response=await this.transport(`https://api.rusender.ru/api/v1/external-mails/send/${c.keyId}`,{
   method:'POST',redirect:'error',signal:AbortSignal.timeout(c.timeoutMs),headers:{Authorization:'Bearer '+c.token,'Content-Type':'application/json'},
   body:JSON.stringify({idempotencyKey:c.namespace+':'+message.kind+':'+message.idempotencyKey,mail:{to:{email:message.to},from:{email:c.from,name:'Minenkov Rehab'},subject,text}}),
  });}catch{throw new DeliveryError('transport_failed');}
  if(!response.ok){const retryable=response.status===429||response.status>=500;
   const header=response.headers.get('retry-after');const numeric=Number(header);
   const retryAfter=Math.min(86400,Math.max(0,Number.isFinite(numeric)?numeric:Math.ceil((Date.parse(header)-Date.now())/1000)||0));
   throw new DeliveryError('provider_rejected',{retryable,retryAfter});
  }
  let data;try{data=await response.json();}catch{throw new DeliveryError('invalid_response');}
  if(typeof data.uuid!=='string'||!/^[a-f\d-]{36}$/i.test(data.uuid))throw new DeliveryError('invalid_response');
  return {messageId:data.uuid};
 }
}
module.exports={RuSender,DeliveryError};
