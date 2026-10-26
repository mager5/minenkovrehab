// Builds the Robokassa checkout URL for an order that already exists in our DB.
// Price, invoice and product come only from the stored order, never from the browser.
// Signature format kept from the working legacy integration:
//   MD5(MerchantLogin:OutSum:InvId:Receipt:Password1) — Receipt as raw JSON, URL-encoded once in the link.
const crypto = require('node:crypto');

const BASE_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx';

const FISCAL_NAMES = {
  'personal-program': 'Программа восстановления после резекции мениска',
  'formula-movement-level-1': 'Программа тренировок Формула Движения, 1 уровень',
  'formula-movement-level-2': 'Программа тренировок Формула Движения, 2 уровень',
  'formula-movement-level-3': 'Программа тренировок Формула Движения, 3 уровень',
  'formula-movement-level-4': 'Программа тренировок Формула Движения, 4 уровень',
  consultation: 'Онлайн-консультация',
  'express-consultation': 'Экспресс онлайн-консультация',
  'online-training': 'Онлайн-тренировка',
};

function robokassaConfig(env, mode) {
  const login = env.ROBOKASSA_MERCHANT_LOGIN;
  if (!login) return null; // Not configured: checkout falls back to the local status page.
  const password1 = mode === 'test' ? env.ROBOKASSA_TEST_PASSWORD1 : env.ROBOKASSA_PASSWORD1;
  if (!/^[A-Za-z0-9_.-]{1,64}$/.test(login) || !password1) throw new Error('robokassa_configuration_incomplete');
  const fiscal = {
    sno: env.ROBOKASSA_SNO || 'usn_income',
    tax: env.ROBOKASSA_TAX || 'none',
    paymentMethod: env.ROBOKASSA_PAYMENT_METHOD || 'full_payment',
    paymentObject: env.ROBOKASSA_PAYMENT_OBJECT || 'service',
    inn: env.ROBOKASSA_INN || '262703733425',
  };
  return { login, password1, mode, fiscal };
}

function receiptFor(order, productSlug, fiscal) {
  const sum = Number(order.amount);
  const receipt = {
    sno: fiscal.sno,
    items: [{ name: FISCAL_NAMES[productSlug] || 'Услуга реабилитации', quantity: 1, sum,
      payment_method: fiscal.paymentMethod, payment_object: fiscal.paymentObject, tax: fiscal.tax }],
  };
  return JSON.stringify(receipt);
}

function buildPaymentUrl(config, order, productSlug) {
  const outSum = String(order.amount);
  if (!/^\d{1,12}\.\d{2}$/.test(outSum)) throw new Error('invalid_order_amount');
  const invId = String(order.invoice_id);
  const receipt = receiptFor(order, productSlug, config.fiscal);
  const signature = crypto.createHash('md5')
    .update([config.login, outSum, invId, receipt, config.password1].join(':'), 'utf8').digest('hex');
  const params = new URLSearchParams({
    MerchantLogin: config.login,
    OutSum: outSum,
    InvId: invId,
    Description: (FISCAL_NAMES[productSlug] || 'Оплата услуги').slice(0, 100),
    Receipt: receipt,
    Email: order.buyer_email || '',
    Culture: 'ru',
    Encoding: 'utf-8',
    SignatureValue: signature,
  });
  if (!order.buyer_email) params.delete('Email');
  if (config.mode === 'test') params.set('IsTest', '1');
  return `${BASE_URL}?${params.toString()}`;
}

module.exports = { robokassaConfig, buildPaymentUrl, receiptFor, FISCAL_NAMES };
