// SMTP sender (Reg.ru mail hosting). Same contract as RuSender: send(message) -> {messageId}.
const {DeliveryError,renderMessage}=require('./templates');
const ADDRESS=/^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[^\s@<>]{2,24}$/;
class SmtpSender{
 constructor({host,port=465,user,password,from,fromName='Minenkov Rehab',replyTo,siteOrigin,timeoutMs=15000,transport}){
  if(!host||!user||!password||!ADDRESS.test(from||'')||!siteOrigin)throw Error('smtp_configuration_missing');
  if(replyTo&&!ADDRESS.test(replyTo))throw Error('smtp_configuration_missing');
  this.config={from,fromName,replyTo,siteOrigin};
  this.transport=transport||require('nodemailer').createTransport({host,port:Number(port),secure:Number(port)===465,auth:{user,pass:password},
   requireTLS:true,connectionTimeout:timeoutMs,greetingTimeout:timeoutMs,socketTimeout:timeoutMs*2,tls:{minVersion:'TLSv1.2',servername:host}});
 }
 async send(message){
  const c=this.config;
  if(!ADDRESS.test(String(message.to||'')))throw new DeliveryError('invalid_recipient',{retryable:false});
  const {subject,text}=renderMessage(message,c.siteOrigin);
  let info;
  try{info=await this.transport.sendMail({from:{name:c.fromName,address:c.from},to:message.to,...(c.replyTo?{replyTo:c.replyTo}:{}),subject,text,
   headers:{'X-Entity-Ref-ID':`${message.kind}:${message.idempotencyKey}`}});}
  catch(error){
   const code=Number(error&&error.responseCode);
   // 5xx = permanent rejection (bad mailbox etc.); everything else (network, 4xx) is retried later.
   if(code>=500&&code<600)throw new DeliveryError('provider_rejected',{retryable:false});
   throw new DeliveryError('transport_failed',{retryable:true,retryAfter:60});
  }
  const id=String(info&&info.messageId||'').slice(0,250);
  return {messageId:id||null};
 }
}
module.exports={SmtpSender};
