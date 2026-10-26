// Fixed mail templates shared by every sender. Only whitelisted kinds and same-origin one-time links.
class DeliveryError extends Error{
 constructor(code,{retryable=true,retryAfter=0}={}){super(code);this.code=code;this.retryable=retryable;this.retryAfter=retryAfter;}
}
function renderMessage(message,siteOrigin){
 if(!/^[a-f\d-]{36}$/i.test(String(message.idempotencyKey||''))&&!/^\d+$/.test(String(message.idempotencyKey||'')))throw new DeliveryError('invalid_job',{retryable:false});
 if(message.kind==='purchase_access'){
  return {subject:'Покупка подтверждена — Minenkov Rehab',
   text:`Здравствуйте!\n\nОплата прошла, покупка сохранена. Материалы доступны в личном кабинете: ${siteOrigin}/dashboard\n\n`+
    `Вход — по адресу почты, на который оформлен заказ. Если вы ещё не задавали пароль, откройте ${siteOrigin}/forgot-password и укажите этот адрес: придёт ссылка для создания пароля.\n\n`+
    `Вопросы — просто ответьте на это письмо.\n\nMinenkov Rehab`};
 }
 if(['password_reset','email_confirmation'].includes(message.kind)){
  let url;try{url=new URL(message.url);}catch{throw new DeliveryError('invalid_reset',{retryable:false});}
  if(url.origin!==siteOrigin||url.pathname!==(message.kind==='password_reset'?'/reset-password':'/confirm-email')||!/^#token=[a-f\d]{64}$/.test(url.hash))throw new DeliveryError('invalid_reset',{retryable:false});
  return message.kind==='password_reset'
   ?{subject:'Восстановление доступа — Minenkov Rehab',text:`Чтобы задать новый пароль, откройте одноразовую ссылку:\n${url.toString()}\n\nЕсли вы не запрашивали восстановление, просто проигнорируйте письмо.\n\nMinenkov Rehab`}
   :{subject:'Подтверждение email — Minenkov Rehab',text:`Чтобы подтвердить адрес почты, откройте одноразовую ссылку:\n${url.toString()}\n\nЕсли вы не регистрировались на сайте, просто проигнорируйте письмо.\n\nMinenkov Rehab`};
 }
 if(message.kind==='admin_payment'){
  const o=message.order||{};const one=v=>String(v==null?'':v).replace(/[\r\n]+/g,' ').trim();
  const amount=Number(o.amount);if(!Number.isFinite(amount)||!o.product||!o.buyer)throw new DeliveryError('invalid_admin_notice',{retryable:false});
  const sum=amount.toLocaleString('ru-RU',{minimumFractionDigits:0,maximumFractionDigits:2})+(o.currency&&o.currency!=='RUB'?' '+one(o.currency):' ₽');
  const test=o.mode==='test'?'[ТЕСТ] ':'';
  const when=o.createdAt?new Date(o.createdAt).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})+' МСК':'';
  return {subject:one(`${test}Оплата ${sum}: ${o.product}`).slice(0,200),
   text:`Новая оплата на сайте${o.mode==='test'?' (тестовый режим Робокассы)':''}.\n\n`+
    `Товар: ${one(o.product)}\nСумма: ${sum}\nПокупатель: ${one(o.buyer)}\nЗаказ Робокассы №: ${one(o.invoiceId)}\n${when?`Время: ${when}\n`:''}\n`+
    `Покупателю автоматически ушло письмо с доступом в личный кабинет (${siteOrigin}/dashboard).\n\nMinenkov Rehab`};
 }
 throw new DeliveryError('invalid_template',{retryable:false});
}
module.exports={DeliveryError,renderMessage};
