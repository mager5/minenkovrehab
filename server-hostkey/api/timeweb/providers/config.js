const {createKinescope}=require('./kinescope');const {RuSender}=require('./rusender');const {TestSender}=require('../mail-worker');
function videoProvider(env,config){
 if(env.MIGRATION_VIDEO_PROVIDER==='disabled')return null;
 // Free Kinescope plan: plain embed, no DRM callback. Access is still gated by our API (only buyers get the id).
 if(env.MIGRATION_VIDEO_PROVIDER==='kinescope-embed')return {async playback(providerId){
  if(!/^[A-Za-z0-9_-]{4,64}$/.test(providerId||''))throw Error('invalid_catalogue');
  return {provider:'kinescope',embedUrl:`https://kinescope.io/embed/${providerId}`};}};
 if(env.MIGRATION_VIDEO_PROVIDER!=='kinescope')throw Error('explicit_video_provider_required');
 return createKinescope({secret:env.KINESCOPE_AUTH_SECRET,basicUser:env.KINESCOPE_CALLBACK_USER,basicPassword:env.KINESCOPE_CALLBACK_PASSWORD,
  issuer:config.auth.siteOrigin,strictAcknowledged:env.KINESCOPE_STRICT_AUTH_CONFIRMED==='true'});
}
function mailProvider(env,config,transport){
 if(env.MIGRATION_MAIL_PROVIDER==='test')return new TestSender({capture:false});
 if(env.MIGRATION_MAIL_PROVIDER==='smtp'){
  if(env.MIGRATION_ENV!=='vps'||env.MIGRATION_MAIL_NETWORK_ENABLED!=='true')throw Error('mail_network_disabled_or_unconfigured');
  const {SmtpSender}=require('./smtp');const {DeliveryError}=require('./templates');
  const sender=new SmtpSender({host:env.SMTP_HOST,port:env.SMTP_PORT||465,user:env.SMTP_USER,password:env.SMTP_PASSWORD,from:env.SMTP_FROM||env.SMTP_USER,
   replyTo:env.SMTP_REPLY_TO||undefined,siteOrigin:config.auth.siteOrigin,...(transport?{transport}:{})});
  // Optional allowlist: set while testing before cutover, leave empty in production.
  const allowed=(env.MIGRATION_MAIL_ALLOWED_RECIPIENTS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  return {async send(message){
   if(allowed.length&&!allowed.includes(String(message.to).toLowerCase()))throw new DeliveryError('recipient_not_allowed',{retryable:false});
   return sender.send(message);}};
 }
 const mailboxMode=env.MIGRATION_MAIL_PROVIDER==='staging-mailbox';
 if((env.MIGRATION_MAIL_PROVIDER!=='rusender'&&!mailboxMode)||env.MIGRATION_MAIL_NETWORK_ENABLED!=='true'||env.MIGRATION_ENV!=='staging')throw Error('mail_network_disabled_or_unconfigured');
 // Live adapter requires explicit opt-in and a staging-only recipient allowlist.
 const allowed=(env.MIGRATION_MAIL_ALLOWED_RECIPIENTS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 if(!allowed.length||!env.MIGRATION_MAIL_NAMESPACE)throw Error('staging_recipient_allowlist_required');
 const mailbox=env.MIGRATION_TEST_MAILBOX;
 if(mailboxMode&&(env.MIGRATION_TEST_MAILBOX_CONFIRM!=='dedicated-synthetic-mailbox'||config.payment?.mode!=='test'||!mailbox||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailbox)||allowed.some(address=>!address.endsWith('@example.invalid'))))throw Error('synthetic_mailbox_configuration_required');
 const sender=new RuSender({token:env.RUSENDER_API_TOKEN,keyId:env.RUSENDER_KEY_ID,from:env.RUSENDER_FROM,
  namespace:env.MIGRATION_MAIL_NAMESPACE,siteOrigin:config.auth.siteOrigin,...(transport?{transport}:{})});
 return {async send(message){if(!allowed.includes(String(message.to).toLowerCase())){const {DeliveryError}=require('./rusender');throw new DeliveryError('recipient_not_allowed',{retryable:false});}
  if(mailboxMode){
   if(message.kind==='purchase_access')return new TestSender({capture:false}).send(message);
   if(!['password_reset','email_confirmation'].includes(message.kind)){const {DeliveryError}=require('./rusender');throw new DeliveryError('unsupported_mailbox_kind',{retryable:false});}
   return sender.send({...message,to:mailbox});
  }
  return sender.send(message);}};
}
module.exports={videoProvider,mailProvider};
