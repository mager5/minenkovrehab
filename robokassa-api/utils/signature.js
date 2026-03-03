const crypto = require('crypto');

/**
 * Сортировка shp_ параметров в алфавитном порядке (обязательно для Robokassa)
 * @param {Object} shpParams - Объект с shp_ параметрами
 * @returns {string} Строка с отсортированными shp_ параметрами в формате key=value:key=value
 */
function formatShpParams(shpParams) {
  if (!shpParams || Object.keys(shpParams).length === 0) {
    return '';
  }

  // Сортируем ключи в алфавитном порядке
  const sortedKeys = Object.keys(shpParams).sort();
  return sortedKeys.map(key => `${key}=${shpParams[key]}`).join(':');
}

/**
 * Генерация MD5 подписи для инициализации платежа
 * Формула: MD5(MerchantLogin:OutSum:InvId[:Receipt][:shp_params]:MerchantPass)
 *
 * @param {string} login - ID магазина (Shop ID)
 * @param {number} outSum - Сумма платежа
 * @param {number} invId - ID заказа (числовой)
 * @param {string} password - Пароль #1
 * @param {Object} [shpParams] - Дополнительные shp_ параметры
 * @param {string} [receipt] - JSON строка с данными чека для фискализации
 * @returns {string} MD5 подпись в верхнем регистре
 */
function generatePaymentSignature(
  login,
  outSum,
  invId,
  password,
  shpParams = null,
  receipt = null
) {
  // КРИТИЧЕСКИ ВАЖНО: сумма должна быть отформатирована с 2 знаками после запятой
  // как в URL параметрах, так и в подписи для избежания ошибки 29
  const formattedSum = parseFloat(outSum).toFixed(2);

  let signatureString = `${login}:${formattedSum}:${invId}`;

  // Добавляем Receipt параметр, если он есть (для фискализации)
  if (receipt) {
    signatureString += `:${receipt}`;
  }

  // Добавляем shp_ параметры в алфавитном порядке, если они есть
  if (shpParams && Object.keys(shpParams).length > 0) {
    const shpString = formatShpParams(shpParams);
    signatureString += `:${shpString}`;
  }

  signatureString += `:${password}`;

  console.log(
    'Генерация подписи для платежа:',
    signatureString
      .replace(password, '***')
      .replace(receipt || '', receipt ? '[RECEIPT_DATA]' : '')
  );

  return crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Проверка подписи Result URL от Robokassa
 * Формула: MD5(OutSum:InvId[:shp_params]:MerchantPass2)
 *
 * @param {number} outSum - Сумма платежа
 * @param {number} invId - ID заказа (числовой)
 * @param {string} password2 - Пароль #2
 * @param {Object} [shpParams] - Дополнительные shp_ параметры
 * @returns {string} MD5 подпись в верхнем регистре
 */
function generateResultSignature(outSum, invId, password2, shpParams = null) {
  // Форматируем сумму с 2 знаками после запятой для консистентности
  const formattedSum = parseFloat(outSum).toFixed(2);

  let signatureString = `${formattedSum}:${invId}`;

  // Добавляем shp_ параметры в алфавитном порядке, если они есть
  if (shpParams && Object.keys(shpParams).length > 0) {
    const shpString = formatShpParams(shpParams);
    signatureString += `:${shpString}`;
  }

  signatureString += `:${password2}`;

  console.log(
    'Генерация подписи для Result URL:',
    signatureString.replace(password2, '***')
  );

  return crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Проверка подписи Success URL от Robokassa
 * Формула: MD5(OutSum:InvId[:shp_params]:MerchantPass1)
 *
 * @param {number} outSum - Сумма платежа
 * @param {number} invId - ID заказа (числовой)
 * @param {string} password1 - Пароль #1
 * @param {Object} [shpParams] - Дополнительные shp_ параметры
 * @returns {string} MD5 подпись в верхнем регистре
 */
function generateSuccessSignature(outSum, invId, password1, shpParams = null) {
  // Форматируем сумму с 2 знаками после запятой для консистентности
  const formattedSum = parseFloat(outSum).toFixed(2);

  let signatureString = `${formattedSum}:${invId}`;

  // Добавляем shp_ параметры в алфавитном порядке, если они есть
  if (shpParams && Object.keys(shpParams).length > 0) {
    const shpString = formatShpParams(shpParams);
    signatureString += `:${shpString}`;
  }

  signatureString += `:${password1}`;

  console.log(
    'Генерация подписи для Success URL:',
    signatureString.replace(password1, '***')
  );

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
 * Создает JSON параметр Receipt для фискализации согласно 54-ФЗ
 * @param {string} serviceName - Название услуги
 * @param {number} price - Цена услуги в рублях
 * @param {string} email - Email покупателя
 * @param {string} phone - Телефон покупателя
 * @returns {string} JSON строка с параметрами чека
 */
function createReceiptParameter(serviceName, price, email, phone) {
  // Получаем настройки фискализации из переменных окружения или используем значения по умолчанию
  const sno = process.env.ROBOKASSA_SNO || 'usn_income'; // УСН Доходы
  const tax = process.env.ROBOKASSA_TAX || 'none'; // Без НДС
  const paymentMethod = process.env.ROBOKASSA_PAYMENT_METHOD || 'full_payment'; // Полный расчет
  const paymentObject = process.env.ROBOKASSA_PAYMENT_OBJECT || 'service'; // Услуга
  const inn = process.env.ROBOKASSA_INN || '262703733425'; // ИНН ИП Миненков В.В.

  if (inn === '000000000000') {
    console.warn(
      '⚠️ ПРЕДУПРЕЖДЕНИЕ: Используется тестовый ИНН 000000000000. Установите ROBOKASSA_INN в переменных окружения!'
    );
  }

  const receipt = {
    sno: sno,
    items: [
      {
        name: serviceName,
        quantity: 1,
        sum: price,
        payment_method: paymentMethod,
        payment_object: paymentObject,
        tax: tax,
      },
    ],
    payments: {
      electronic: price, // Электронными
    },
    vats: {
      none: price, // Без НДС (сумма) - нужно корректировать если tax != none
    },
    client: {
      email: email,
      phone: phone,
    },
    company: {
      email: 'info@minenkovrehab.ru',
      sno: sno,
      inn: inn,
      payment_address: 'https://minenkovrehab.ru',
    },
    total: price,
  };

  // Если ставка налога не "none", объект vats должен быть другим
  // Для простоты, если используется НДС, нужно более сложная логика расчета
  // Но для текущей задачи (без НДС) это подходит.
  if (tax !== 'none') {
    // Очищаем vats.none если налог есть
    delete receipt.vats.none;
    // Добавляем соответствующую ставку (примерная логика, требует уточнения если клиент перейдет на НДС)
    receipt.vats[tax] = price;
  }

  return JSON.stringify(receipt);
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
  generateInvoiceId,
  createReceiptParameter,
  formatShpParams,
};
