const { generateInvoiceId, generatePaymentSignature } = require('./utils/signature');

console.log('🧪 Тестирование локального создания платежной ссылки с числовым InvId');
console.log('=' .repeat(70));

// Генерируем числовой InvId
const invoiceId = generateInvoiceId();
console.log(`📋 Сгенерированный InvId: ${invoiceId} (тип: ${typeof invoiceId})`);

// Параметры платежа
const amount = 2950;
const description = 'Club membership payment';
const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
const merchantLogin = process.env.ROBOKASSA_LOGIN || 'Minenkov-2';
const password1 = isTestMode 
  ? process.env.ROBOKASSA_TEST_PASSWORD1 || 'Eld5Xljk2GBN4D6TJo3N'
  : process.env.ROBOKASSA_PASSWORD1 || 'password_1';

// Генерируем подпись
const signature = generatePaymentSignature(merchantLogin, amount, invoiceId, password1);
console.log(`🔐 Подпись: ${signature}`);

// Формируем URL
const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
const params = new URLSearchParams({
  MerchantLogin: merchantLogin,
  OutSum: amount,
  InvId: invoiceId, // Теперь это число
  Description: description,
  SignatureValue: signature,
  IsTest: '1',
  Culture: 'en',
  Encoding: 'utf-8'
});

const paymentUrl = `${baseUrl}?${params.toString()}`;

console.log('\n🔗 Сформированная платежная ссылка:');
console.log(paymentUrl);

console.log('\n📊 Анализ параметров:');
console.log(`- InvId: ${invoiceId} (${typeof invoiceId})`);
console.log(`- OutSum: ${amount}`);
console.log(`- Description: ${description}`);
console.log(`- IsTest: 1`);
console.log(`- SignatureValue: ${signature}`);

// Проверяем, что InvId в допустимом диапазоне
if (typeof invoiceId === 'number' && invoiceId >= 1 && invoiceId <= 2147483647) {
  console.log('\n✅ InvId соответствует требованиям Robokassa (число от 1 до 2147483647)');
} else {
  console.log('\n❌ InvId НЕ соответствует требованиям Robokassa');
}

console.log('\n🏁 Тестирование завершено');