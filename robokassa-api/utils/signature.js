const crypto = require('crypto');

/**
 * Генерация MD5 подписи для инициализации платежа
 * Формула: MD5(MerchantLogin:OutSum:InvId:MerchantPass)
 * 
 * @param {string} login - ID магазина (Shop ID)
 * @param {number} outSum - Сумма платежа
 * @param {number} invId - ID заказа (числовой)
 * @param {string} password - Пароль #1
 * @returns {string} MD5 подпись в верхнем регистре
 */
function generatePaymentSignature(login, outSum, invId, password) {
  const signatureString = `${login}:${outSum}:${invId}:${password}`;
  console.log('Генерация подписи для платежа:', signatureString.replace(password, '***'));
  
  return crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Проверка подписи Result URL от Robokassa
 * Формула: MD5(OutSum:InvId:MerchantPass2)
 * 
 * @param {number} outSum - Сумма платежа
 * @param {number} invId - ID заказа (числовой)
 * @param {string} password2 - Пароль #2
 * @returns {string} MD5 подпись в верхнем регистре
 */
function generateResultSignature(outSum, invId, password2) {
  const signatureString = `${outSum}:${invId}:${password2}`;
  console.log('Генерация подписи для Result URL:', signatureString.replace(password2, '***'));
  
  return crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Проверка подписи Success URL от Robokassa
 * Формула: MD5(OutSum:InvId:MerchantPass1)
 * 
 * @param {number} outSum - Сумма платежа
 * @param {number} invId - ID заказа (числовой)
 * @param {string} password1 - Пароль #1
 * @returns {string} MD5 подпись в верхнем регистре
 */
function generateSuccessSignature(outSum, invId, password1) {
  const signatureString = `${outSum}:${invId}:${password1}`;
  console.log('Генерация подписи для Success URL:', signatureString.replace(password1, '***'));
  
  return crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Проверка валидности подписи
 * 
 * @param {string} receivedSignature - Полученная подпись
 * @param {string} expectedSignature - Ожидаемая подпись
 * @returns {boolean} Результат проверки
 */
function verifySignature(receivedSignature, expectedSignature) {
  const received = receivedSignature.toUpperCase();
  const expected = expectedSignature.toUpperCase();
  
  console.log('Проверка подписи:');
  console.log('Получена:', received);
  console.log('Ожидается:', expected);
  console.log('Совпадает:', received === expected);
  
  return received === expected;
}

/**
 * Генерирует уникальный ID заказа (числовой, требование Robokassa)
 * @returns {number} Уникальный ID заказа в диапазоне от 1 до 2147483647
 */
function generateInvoiceId() {
  // Старый код с строковым ID (закомментирован)
  // const timestamp = Date.now();
  // const random = Math.random().toString(36).substring(2, 8);
  // return `${timestamp}_${random}`;
  
  // Новый код: генерируем числовой ID в допустимом диапазоне Robokassa (1-2147483647)
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000); // добавляем случайность
  
  // Комбинируем timestamp и случайное число, обрезаем до допустимого диапазона
  let invoiceId = parseInt(`${timestamp}${random}`);
  
  // Убеждаемся, что ID в допустимом диапазоне (1-2147483647)
  if (invoiceId > 2147483647) {
    // Если слишком большой, берем остаток от деления на максимальное значение
    invoiceId = (invoiceId % 2147483647) + 1;
  }
  
  // Убеждаемся, что ID больше 0
  if (invoiceId <= 0) {
    invoiceId = Math.floor(Math.random() * 2147483647) + 1;
  }
  
  console.log('Сгенерирован числовой InvId для Robokassa:', invoiceId);
  return invoiceId;
}

module.exports = {
  generatePaymentSignature,
  generateResultSignature,
  generateSuccessSignature,
  verifySignature,
  generateInvoiceId
};