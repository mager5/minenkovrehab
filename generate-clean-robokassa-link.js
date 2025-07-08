const crypto = require('crypto');

// Конфигурация Robokassa
const ROBOKASSA_CONFIG = {
  login: 'Minenkov-2',
  password1: 'Eld5Xljk2GBN4D6TJo3N',
  testMode: true,
  baseUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx'
};

/**
 * Генерация MD5 подписи для платежа
 * @param {string} login - ID магазина
 * @param {number} outSum - Сумма платежа
 * @param {number} invId - ID заказа
 * @param {string} password - Пароль #1
 * @returns {string} MD5 подпись в верхнем регистре
 */
function generatePaymentSignature(login, outSum, invId, password) {
  const formattedSum = parseFloat(outSum).toFixed(2);
  const signatureString = `${login}:${formattedSum}:${invId}:${password}`;
  
  console.log('Строка для подписи:', signatureString.replace(password, '***'));
  
  return crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Генерирует уникальный ID заказа
 * @returns {number} Уникальный числовой ID
 */
function generateInvoiceId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  let invoiceId = parseInt(`${timestamp}${random}`);
  
  // Убеждаемся, что ID в допустимом диапазоне (1-2147483647)
  if (invoiceId > 2147483647) {
    invoiceId = (invoiceId % 2147483647) + 1;
  }
  
  if (invoiceId <= 0) {
    invoiceId = Math.floor(Math.random() * 2147483647) + 1;
  }
  
  return invoiceId;
}

/**
 * Генерирует чистую ссылку для оплаты Robokassa
 * @param {Object} options - Параметры платежа
 * @returns {string} Готовая ссылка для оплаты
 */
function generateCleanPaymentLink(options = {}) {
  const {
    amount = 2950,
    description = 'Абонемент клуба формула движения',
    invoiceId = null
  } = options;
  
  // Генерируем уникальный ID заказа, если не передан
  const invId = invoiceId || generateInvoiceId();
  
  // Генерируем подпись
  const signature = generatePaymentSignature(
    ROBOKASSA_CONFIG.login,
    amount,
    invId,
    ROBOKASSA_CONFIG.password1
  );
  
  // Формируем параметры URL
  const urlParams = new URLSearchParams();
  urlParams.append('MerchantLogin', ROBOKASSA_CONFIG.login);
  urlParams.append('OutSum', amount.toFixed(2));
  urlParams.append('invoiceID', invId);
  urlParams.append('Description', description);
  urlParams.append('SignatureValue', signature);
  
  // Добавляем IsTest только в тестовом режиме
  if (ROBOKASSA_CONFIG.testMode) {
    urlParams.append('IsTest', '1');
  }
  
  // Формируем финальную ссылку
  const paymentUrl = `${ROBOKASSA_CONFIG.baseUrl}?${urlParams.toString()}`;
  
  console.log('\n🔗 СГЕНЕРИРОВАННАЯ ССЫЛКА:');
  console.log('=' .repeat(80));
  console.log(paymentUrl);
  console.log('=' .repeat(80));
  
  console.log('\n📋 ПАРАМЕТРЫ:');
  console.log('- MerchantLogin:', ROBOKASSA_CONFIG.login);
  console.log('- OutSum:', amount.toFixed(2));
  console.log('- invoiceID:', invId);
  console.log('- Description:', description);
  console.log('- SignatureValue:', signature);
  console.log('- IsTest:', ROBOKASSA_CONFIG.testMode ? '1' : 'не установлен');
  
  return paymentUrl;
}

// Тестируем генерацию ссылки
console.log('🚀 ГЕНЕРАЦИЯ ЧИСТОЙ ССЫЛКИ ROBOKASSA');
console.log('=' .repeat(50));

// Генерируем ссылку с параметрами по умолчанию
const link1 = generateCleanPaymentLink();

console.log('\n\n🔄 ГЕНЕРАЦИЯ ССЫЛКИ С КАСТОМНЫМИ ПАРАМЕТРАМИ:');
console.log('=' .repeat(50));

// Генерируем ссылку с кастомными параметрами
const link2 = generateCleanPaymentLink({
  amount: 1500,
  description: 'Тестовый платеж',
  invoiceId: 12345
});

console.log('\n✅ ГОТОВО! Ссылки сгенерированы без лишних кавычек.');
console.log('\n💡 ПРОВЕРЬТЕ:');
console.log('1. Ссылка не содержит лишних кавычек в конце');
console.log('2. Все параметры корректно закодированы');
console.log('3. Подпись сгенерирована правильно');
console.log('4. IsTest=1 добавлен для тестового режима');

module.exports = {
  generateCleanPaymentLink,
  generatePaymentSignature,
  generateInvoiceId
};