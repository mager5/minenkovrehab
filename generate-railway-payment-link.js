/**
 * Генератор ссылок на оплату через Railway API
 * Создает корректную ссылку на оплату Robokassa используя Railway endpoint
 */

const crypto = require('crypto');

// Конфигурация Railway API
const RAILWAY_API_URL = 'https://robokassa-api-production.up.railway.app';

// Параметры оплаты
const paymentConfig = {
  merchantLogin: 'minenkovrehab',
  password1: 'password_1_here', // Замените на реальный пароль #1
  isTest: 1 // 1 для тестового режима, 0 для продакшена
};

/**
 * Генерирует ссылку на оплату через Railway API
 * @param {Object} params - Параметры платежа
 * @param {number} params.amount - Сумма к оплате в рублях
 * @param {string} params.description - Описание платежа
 * @param {string} params.email - Email клиента
 * @param {string} params.phone - Телефон клиента
 * @param {string} [params.invoiceId] - Уникальный номер заказа
 * @returns {string} URL для оплаты
 */
function generateRailwayPaymentLink(params) {
  const {
    amount,
    description,
    email,
    phone,
    invoiceId = Date.now().toString()
  } = params;

  // Создаем параметры для Railway API
  const paymentData = {
    amount: amount,
    description: description,
    email: email,
    phone: phone,
    invoiceId: invoiceId,
    isTest: paymentConfig.isTest
  };

  // Формируем URL с параметрами
  const queryParams = new URLSearchParams(paymentData);
  const paymentUrl = `${RAILWAY_API_URL}/api/payment/create?${queryParams.toString()}`;

  return paymentUrl;
}

/**
 * Генерирует прямую ссылку на Robokassa (альтернативный способ)
 * @param {Object} params - Параметры платежа
 * @returns {string} Прямая ссылка на Robokassa
 */
function generateDirectRobokassaLink(params) {
  const {
    amount,
    description,
    invoiceId = Date.now().toString()
  } = params;

  // Формируем строку для подписи
  const signatureString = `${paymentConfig.merchantLogin}:${amount}:${invoiceId}:${paymentConfig.password1}`;
  
  // Вычисляем MD5 хеш
  const signature = crypto.createHash('md5').update(signatureString).digest('hex');

  // Формируем URL
  const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
  const params_obj = {
    MerchantLogin: paymentConfig.merchantLogin,
    OutSum: amount,
    InvoiceID: invoiceId,
    Description: description,
    SignatureValue: signature,
    IsTest: paymentConfig.isTest
  };

  const queryString = new URLSearchParams(params_obj).toString();
  return `${baseUrl}?${queryString}`;
}

// Примеры использования
const testPayment = {
  amount: 1000,
  description: 'Оплата услуг реабилитации',
  email: 'test@example.com',
  phone: '+7(999)123-45-67'
};

console.log('=== ГЕНЕРАЦИЯ ССЫЛОК НА ОПЛАТУ ===\n');

// Способ 1: Через Railway API
const railwayLink = generateRailwayPaymentLink(testPayment);
console.log('1. Ссылка через Railway API:');
console.log(railwayLink);
console.log();

// Способ 2: Прямая ссылка на Robokassa
const directLink = generateDirectRobokassaLink(testPayment);
console.log('2. Прямая ссылка на Robokassa:');
console.log(directLink);
console.log();

// Способ 3: Короткая ссылка через Railway (рекомендуемый)
const shortRailwayLink = `${RAILWAY_API_URL}/payment?amount=${testPayment.amount}&desc=${encodeURIComponent(testPayment.description)}&email=${testPayment.email}`;
console.log('3. Короткая ссылка через Railway (рекомендуемая):');
console.log(shortRailwayLink);
console.log();

console.log('=== ИНСТРУКЦИИ ===');
console.log('1. Замените password_1_here на реальный пароль #1 из настроек Robokassa');
console.log('2. Для продакшена установите isTest: 0');
console.log('3. Используйте короткую ссылку для интеграции в сайт');
console.log('4. Railway API автоматически обработает создание платежа');

// Экспорт функций для использования в других модулях
module.exports = {
  generateRailwayPaymentLink,
  generateDirectRobokassaLink,
  RAILWAY_API_URL
};