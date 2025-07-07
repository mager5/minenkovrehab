const crypto = require('crypto');
const { generatePaymentSignature } = require('./utils/signature');

/**
 * Тестовый скрипт для проверки формирования подписи Robokassa
 * Проверяет возможные ошибки в MerchantLogin, MerchantPass1 и shp_ параметрах
 */

console.log('🔍 Проверка формирования подписи Robokassa\n');

// Загружаем переменные окружения
require('dotenv').config();

const login = process.env.ROBOKASSA_LOGIN;
const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
const password1 = isTestMode 
  ? process.env.ROBOKASSA_TEST_PASSWORD1 
  : process.env.ROBOKASSA_PASSWORD1;

console.log('📋 Текущие настройки:');
console.log(`   MerchantLogin: ${login}`);
console.log(`   Тестовый режим: ${isTestMode}`);
console.log(`   Пароль #1: ${password1 ? '***установлен***' : '❌ НЕ УСТАНОВЛЕН'}`);
console.log('');

// Тестовые данные
const testData = {
  outSum: 5000.00,
  invId: 123456789,
  description: 'Тестовый платеж'
};

console.log('🧪 Тестовые данные:');
console.log(`   Сумма: ${testData.outSum}`);
console.log(`   ID заказа: ${testData.invId}`);
console.log(`   Описание: ${testData.description}`);
console.log('');

// 1. Проверка базовой подписи без shp_ параметров
console.log('1️⃣ Проверка базовой подписи (без shp_ параметров):');
if (login && password1) {
  const signature = generatePaymentSignature(login, testData.outSum, testData.invId, password1);
  console.log(`   Формула: ${login}:${testData.outSum}:${testData.invId}:***`);
  console.log(`   Подпись: ${signature}`);
} else {
  console.log('   ❌ Невозможно сгенерировать - отсутствуют обязательные параметры');
}
console.log('');

// 2. Проверка с shp_ параметрами (если они используются)
console.log('2️⃣ Проверка подписи с shp_ параметрами:');

// Пример shp_ параметров в алфавитном порядке
const shpParams = {
  shp_email: 'test@example.com',
  shp_phone: '+79001234567',
  shp_user_id: '12345'
};

// Сортируем shp_ параметры по алфавиту (обязательно для Robokassa)
const sortedShpKeys = Object.keys(shpParams).sort();
const shpString = sortedShpKeys.map(key => `${key}=${shpParams[key]}`).join(':');

console.log('   shp_ параметры (в алфавитном порядке):');
sortedShpKeys.forEach(key => {
  console.log(`     ${key}=${shpParams[key]}`);
});

if (login && password1) {
  // Формула с shp_ параметрами: MerchantLogin:OutSum:InvId:shp_param1=value1:shp_param2=value2:MerchantPass1
  const signatureStringWithShp = `${login}:${testData.outSum}:${testData.invId}:${shpString}:${password1}`;
  const signatureWithShp = crypto
    .createHash('md5')
    .update(signatureStringWithShp)
    .digest('hex')
    .toUpperCase();
  
  console.log(`   Формула с shp_: ${login}:${testData.outSum}:${testData.invId}:${shpString}:***`);
  console.log(`   Подпись с shp_: ${signatureWithShp}`);
} else {
  console.log('   ❌ Невозможно сгенерировать - отсутствуют обязательные параметры');
}
console.log('');

// 3. Проверка возможных ошибок
console.log('3️⃣ Проверка возможных ошибок:');

// Проверка 1: Некорректный MerchantLogin
const wrongLogin = 'WrongLogin';
if (password1) {
  const wrongSignature = generatePaymentSignature(wrongLogin, testData.outSum, testData.invId, password1);
  console.log(`   ❌ С неверным логином (${wrongLogin}): ${wrongSignature}`);
}

// Проверка 2: Некорректный пароль
const wrongPassword = 'wrong_password';
if (login) {
  const wrongSignature = generatePaymentSignature(login, testData.outSum, testData.invId, wrongPassword);
  console.log(`   ❌ С неверным паролем: ${wrongSignature}`);
}

// Проверка 3: Неправильный порядок shp_ параметров
if (login && password1) {
  const wrongOrderShp = 'shp_user_id=12345:shp_email=test@example.com:shp_phone=+79001234567';
  const signatureWrongOrder = crypto
    .createHash('md5')
    .update(`${login}:${testData.outSum}:${testData.invId}:${wrongOrderShp}:${password1}`)
    .digest('hex')
    .toUpperCase();
  
  console.log(`   ❌ С неверным порядком shp_: ${signatureWrongOrder}`);
}
console.log('');

// 4. Рекомендации
console.log('💡 Рекомендации для исправления ошибки 29:');
console.log('   1. Убедитесь, что MerchantLogin точно соответствует настройкам в Robokassa');
console.log('   2. Проверьте правильность Пароля #1 для текущего режима (тестовый/боевой)');
console.log('   3. Если используются shp_ параметры:');
console.log('      - Они должны быть в алфавитном порядке');
console.log('      - Одинаковые параметры в URL и в формуле подписи');
console.log('   4. Проверьте, что все параметры передаются в правильном формате');
console.log('   5. Убедитесь, что сумма передается с 2 знаками после запятой');
console.log('');

// 5. Проверка текущей конфигурации
console.log('🔧 Текущая конфигурация:');
console.log(`   ROBOKASSA_LOGIN: ${process.env.ROBOKASSA_LOGIN || '❌ НЕ УСТАНОВЛЕН'}`);
console.log(`   ROBOKASSA_TEST_MODE: ${process.env.ROBOKASSA_TEST_MODE || '❌ НЕ УСТАНОВЛЕН'}`);
console.log(`   ROBOKASSA_PASSWORD1: ${process.env.ROBOKASSA_PASSWORD1 ? '✅ установлен' : '❌ НЕ УСТАНОВЛЕН'}`);
console.log(`   ROBOKASSA_TEST_PASSWORD1: ${process.env.ROBOKASSA_TEST_PASSWORD1 ? '✅ установлен' : '❌ НЕ УСТАНОВЛЕН'}`);
console.log(`   ROBOKASSA_PASSWORD2: ${process.env.ROBOKASSA_PASSWORD2 ? '✅ установлен' : '❌ НЕ УСТАНОВЛЕН'}`);
console.log(`   ROBOKASSA_TEST_PASSWORD2: ${process.env.ROBOKASSA_TEST_PASSWORD2 ? '✅ установлен' : '❌ НЕ УСТАНОВЛЕН'}`);

console.log('\n✅ Проверка завершена!');