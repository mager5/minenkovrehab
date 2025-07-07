const { generatePaymentSignature, generateInvoiceId } = require('./utils/signature');

// Конфигурация Robokassa (тестовый режим)
const ROBOKASSA_CONFIG = {
  login: 'Minenkov-2',
  password1: 'Eld5Xljk2GBN4D6TJo3N',
  password2: 'gWtiI5Li9nqojQcc1f60',
  testMode: true,
  baseUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx'
};

// Данные для оплаты абонемента (реальная стоимость)
const paymentData = {
  amount: 2950.00, // Реальная стоимость абонемента - 2950 ₽/мес
  description: 'Абонемент клуба формула движения',
  email: 'client@example.com'
};

console.log('🧪 Генерация ссылки для оплаты абонемента...');
console.log('💰 Сумма:', paymentData.amount, 'руб.');
console.log('📝 Описание:', paymentData.description);

// Генерируем уникальный ID заказа для реального платежа
const invoiceId = generateInvoiceId();
console.log('🔢 ID заказа:', invoiceId);

// Форматируем сумму с 2 знаками после запятой
const formattedAmount = parseFloat(paymentData.amount).toFixed(2);

// Без дополнительных параметров (как в правильной ссылке)
const shpParams = {};

// Генерируем подпись
const signature = generatePaymentSignature(
  ROBOKASSA_CONFIG.login,
  formattedAmount,
  invoiceId,
  ROBOKASSA_CONFIG.password1,
  shpParams
);

console.log('🔐 Подпись:', signature);

// Формируем URL параметры (точно как в правильной ссылке)
const urlParams = new URLSearchParams({
  MerchantLogin: ROBOKASSA_CONFIG.login,
  OutSum: formattedAmount,
  invoiceID: invoiceId, // Используем invoiceID как в правильной ссылке
  Description: paymentData.description, // Добавляем описание платежа
  SignatureValue: signature,
  IsTest: ROBOKASSA_CONFIG.testMode ? '1' : '0'
});

// Формируем полную ссылку
const paymentUrl = `${ROBOKASSA_CONFIG.baseUrl}?${urlParams.toString()}`;

console.log('\n🌐 ССЫЛКА ДЛЯ ОПЛАТЫ АБОНЕМЕНТА:');
console.log('=' .repeat(80));
console.log(paymentUrl);
console.log('=' .repeat(80));

console.log('\n✅ Ссылка готова к использованию!');
console.log('💡 Это тестовая ссылка - реальные деньги списаны не будут');
console.log('📧 Email клиента:', paymentData.email);
console.log('💰 Сумма к оплате:', formattedAmount, 'руб.');