#!/usr/bin/env node

const {
  generatePaymentLink,
  createReceiptParameter,
} = require('./robokassa-payment-generator');

console.log('🧪 Тестирование генерации ссылки с параметром Receipt');
console.log('='.repeat(60));

// Тестируем генерацию ссылки для консультации специалиста
const testPayment = {
  amount: 1500,
  description: 'Консультация',
  receipt: {
    serviceName: 'Консультация специалиста',
  },
};

console.log('📋 Параметры тестового платежа:');
console.log(`💰 Сумма: ${testPayment.amount} руб.`);
console.log(`📝 Описание: ${testPayment.description}`);
console.log(`🏥 Услуга для фискализации: ${testPayment.receipt.serviceName}`);
console.log('');

// Генерируем ссылку с Receipt
const result = generatePaymentLink(testPayment);

console.log('✅ ССЫЛКА С ПАРАМЕТРОМ RECEIPT СГЕНЕРИРОВАНА:');
console.log('');
console.log('🔗 Полная ссылка:');
console.log(result.paymentUrl);
console.log('');

// Проверяем параметры
const url = new URL(result.paymentUrl);
console.log('🔍 Проверка параметров:');
console.log(`✅ MerchantLogin: ${url.searchParams.get('MerchantLogin')}`);
console.log(`✅ OutSum: ${url.searchParams.get('OutSum')}`);
console.log(`✅ invoiceID: ${url.searchParams.get('invoiceID')}`);
console.log(
  `✅ Description: ${decodeURIComponent(url.searchParams.get('Description'))}`
);
console.log(
  `✅ Receipt: ${url.searchParams.get('Receipt') ? 'ПРИСУТСТВУЕТ' : 'ОТСУТСТВУЕТ'}`
);
console.log(`✅ SignatureValue: ${url.searchParams.get('SignatureValue')}`);
console.log(`✅ IsTest: ${url.searchParams.get('IsTest')}`);
console.log('');

// Декодируем и показываем содержимое Receipt
if (url.searchParams.get('Receipt')) {
  const receiptParam = url.searchParams.get('Receipt');
  const decodedReceipt = decodeURIComponent(receiptParam);

  console.log('📄 Содержимое параметра Receipt:');
  console.log('Raw (URL-encoded):', receiptParam);
  console.log('Decoded JSON:', decodedReceipt);

  try {
    const receiptObj = JSON.parse(decodedReceipt);
    console.log('Parsed object:', JSON.stringify(receiptObj, null, 2));
  } catch (e) {
    console.log('❌ Ошибка парсинга JSON:', e.message);
  }
  console.log('');
}

console.log('📊 Детали генерации:');
console.log(`🔐 Строка для подписи: ${result.signatureString}`);
console.log(`🔑 Подпись: ${result.signature}`);
console.log(`🧪 Тестовый режим: ${result.isTest ? 'Да' : 'Нет'}`);
console.log('');

console.log('🎯 ГОТОВАЯ ССЫЛКА ДЛЯ КОПИРОВАНИЯ:');
console.log('='.repeat(80));
console.log(result.paymentUrl);
console.log('='.repeat(80));

// Сравниваем с примером из пользователя
console.log('');
console.log('🔄 Сравнение с ожидаемым форматом:');
const expectedReceiptJson = {
  sno: 'osn',
  items: [
    {
      name: 'Консультация специалиста',
      quantity: 1,
      sum: 1500,
      payment_method: 'full_payment',
      payment_object: 'service',
      tax: 'vat20',
    },
  ],
};

console.log('Ожидаемый Receipt JSON:');
console.log(JSON.stringify(expectedReceiptJson, null, 2));

// Тестируем отдельно функцию создания Receipt
console.log('');
console.log('🧪 Тестирование функции createReceiptParameter:');
const testReceipt = createReceiptParameter({
  name: 'Консультация специалиста',
  sum: 1500,
});
console.log('URL-encoded Receipt:', testReceipt);
console.log('Decoded Receipt:', decodeURIComponent(testReceipt));
