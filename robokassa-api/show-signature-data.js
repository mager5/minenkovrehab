const crypto = require('crypto');
require('dotenv').config();

// Данные для тестирования
const testData = {
  merchantLogin: process.env.ROBOKASSA_LOGIN,
  outSum: '100.00',
  invId: '12345',
  description: 'Тестовый платеж',
  password1: process.env.ROBOKASSA_TEST_MODE === 'true' ? process.env.ROBOKASSA_TEST_PASSWORD1 : process.env.ROBOKASSA_PASSWORD1,
  password2: process.env.ROBOKASSA_TEST_MODE === 'true' ? process.env.ROBOKASSA_TEST_PASSWORD2 : process.env.ROBOKASSA_PASSWORD2
};

console.log('🔍 ДЕМОНСТРАЦИЯ ДАННЫХ ДЛЯ ROBOKASSA');
console.log('=' .repeat(50));

// 1. Данные для создания платежа (SignatureValue)
console.log('\n📤 1. ДАННЫЕ ДЛЯ СОЗДАНИЯ ПЛАТЕЖА:');
console.log('MerchantLogin:', testData.merchantLogin);
console.log('OutSum:', testData.outSum);
console.log('InvId:', testData.invId);
console.log('Description:', testData.description);
console.log('Password#1:', testData.password1);

// Строка до хеширования для SignatureValue
const signatureString = `${testData.merchantLogin}:${testData.outSum}:${testData.invId}:${testData.password1}`;
console.log('\n🔗 СТРОКА ДО ХЕШИРОВАНИЯ (SignatureValue):');
console.log(signatureString);

// Хеш MD5
const signatureValue = crypto.createHash('md5').update(signatureString).digest('hex');
console.log('\n🔐 ПОСЛЕ MD5 ХЕШИРОВАНИЯ:');
console.log(signatureValue);

// 2. Данные для проверки результата (при получении уведомления)
console.log('\n\n📥 2. ДАННЫЕ ДЛЯ ПРОВЕРКИ РЕЗУЛЬТАТА:');
const resultString = `${testData.outSum}:${testData.invId}:${testData.password2}`;
console.log('\n🔗 СТРОКА ДО ХЕШИРОВАНИЯ (для проверки результата):');
console.log(resultString);

const resultHash = crypto.createHash('md5').update(resultString).digest('hex');
console.log('\n🔐 ПОСЛЕ MD5 ХЕШИРОВАНИЯ:');
console.log(resultHash);

// 3. Полная ссылка для оплаты
console.log('\n\n🌐 3. ПОЛНАЯ ССЫЛКА ДЛЯ ОПЛАТЫ:');
const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${testData.merchantLogin}&OutSum=${testData.outSum}&InvoiceID=${testData.invId}&Description=${encodeURIComponent(testData.description)}&SignatureValue=${signatureValue}`;
console.log(paymentUrl);

console.log('\n' + '='.repeat(50));
console.log('✅ Данные готовы для отправки в Robokassa');
console.log('📧 Отправьте строку до хеширования для проверки:');
console.log('📤 Для создания:', signatureString);
console.log('📥 Для результата:', resultString);