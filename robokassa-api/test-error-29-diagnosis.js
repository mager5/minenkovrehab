const crypto = require('crypto');
const { generatePaymentSignature } = require('./utils/signature');

/**
 * Диагностика ошибки 29 Robokassa
 * Проверяет все возможные причины неправильной подписи
 */

console.log('🔍 Диагностика ошибки 29 Robokassa\n');

// Загружаем переменные окружения
require('dotenv').config();

const login = process.env.ROBOKASSA_LOGIN;
const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
const password1 = isTestMode 
  ? process.env.ROBOKASSA_TEST_PASSWORD1 
  : process.env.ROBOKASSA_PASSWORD1;

console.log('📋 Текущие настройки:');
console.log(`   MerchantLogin: "${login}"`);
console.log(`   Тестовый режим: ${isTestMode}`);
console.log(`   Используемый пароль: ${isTestMode ? 'ROBOKASSA_TEST_PASSWORD1' : 'ROBOKASSA_PASSWORD1'}`);
console.log(`   Значение пароля: "${password1}"`);
console.log('');

// Проверяем, что все обязательные параметры установлены
if (!login) {
  console.log('❌ КРИТИЧЕСКАЯ ОШИБКА: ROBOKASSA_LOGIN не установлен!');
  process.exit(1);
}

if (!password1) {
  console.log(`❌ КРИТИЧЕСКАЯ ОШИБКА: ${isTestMode ? 'ROBOKASSA_TEST_PASSWORD1' : 'ROBOKASSA_PASSWORD1'} не установлен!`);
  process.exit(1);
}

// Тестовые данные (как в реальном запросе)
const testData = {
  outSum: 5000.00,
  invId: 368711776, // Реальный ID из последнего запроса
  description: 'Тестовый платеж'
};

console.log('🧪 Тестовые данные:');
console.log(`   Сумма: ${testData.outSum}`);
console.log(`   ID заказа: ${testData.invId}`);
console.log('');

// 1. Проверяем формулу подписи согласно документации Robokassa
console.log('1️⃣ Проверка формулы подписи:');
console.log('   Согласно документации Robokassa:');
console.log('   Формула: MerchantLogin:OutSum:InvId:MerchantPass1');
console.log('');

// Формируем строку для подписи точно как в коде
const signatureString = `${login}:${testData.outSum}:${testData.invId}:${password1}`;
console.log(`   Строка для подписи: "${signatureString.replace(password1, '***')}"`);

// Генерируем подпись
const signature = crypto
  .createHash('md5')
  .update(signatureString)
  .digest('hex')
  .toUpperCase();

console.log(`   Сгенерированная подпись: ${signature}`);
console.log('');

// 2. Проверяем через нашу функцию
console.log('2️⃣ Проверка через функцию generatePaymentSignature:');
const ourSignature = generatePaymentSignature(login, testData.outSum, testData.invId, password1);
console.log(`   Подпись через функцию: ${ourSignature}`);
console.log(`   Совпадают: ${signature === ourSignature ? '✅ ДА' : '❌ НЕТ'}`);
console.log('');

// 3. Проверяем возможные проблемы с форматированием
console.log('3️⃣ Проверка форматирования параметров:');

// Проверка суммы
const formattedSum = parseFloat(testData.outSum).toFixed(2);
console.log(`   Сумма как число: ${testData.outSum}`);
console.log(`   Сумма с toFixed(2): ${formattedSum}`);
console.log(`   Используется в коде: ${testData.outSum} (без toFixed)`);

// Проверка с правильным форматированием суммы
const signatureWithFormattedSum = crypto
  .createHash('md5')
  .update(`${login}:${formattedSum}:${testData.invId}:${password1}`)
  .digest('hex')
  .toUpperCase();

console.log(`   Подпись с toFixed(2): ${signatureWithFormattedSum}`);
console.log('');

// 4. Проверяем типы данных
console.log('4️⃣ Проверка типов данных:');
console.log(`   Тип login: ${typeof login}`);
console.log(`   Тип outSum: ${typeof testData.outSum}`);
console.log(`   Тип invId: ${typeof testData.invId}`);
console.log(`   Тип password1: ${typeof password1}`);
console.log('');

// 5. Проверяем возможные скрытые символы
console.log('5️⃣ Проверка скрытых символов:');
console.log(`   Длина login: ${login.length}`);
console.log(`   Длина password1: ${password1.length}`);
console.log(`   Login в hex: ${Buffer.from(login).toString('hex')}`);
console.log(`   Password1 в hex: ${Buffer.from(password1).toString('hex')}`);
console.log('');

// 6. Проверяем URL, который отправляется в Robokassa
console.log('6️⃣ Проверка URL параметров:');
const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
const paymentParams = {
  Culture: 'ru',
  Encoding: 'utf-8',
  InvId: testData.invId,
  IsTest: isTestMode ? '1' : undefined,
  MerchantLogin: login,
  OutSum: testData.outSum.toFixed(2),
  SignatureValue: signature
};

// Удаляем undefined значения
Object.keys(paymentParams).forEach(key => {
  if (paymentParams[key] === undefined) {
    delete paymentParams[key];
  }
});

const paymentParamsUrl = new URLSearchParams(paymentParams);
const paymentUrl = `${baseUrl}?${paymentParamsUrl.toString()}`;

console.log('   Параметры URL:');
Object.entries(paymentParams).forEach(([key, value]) => {
  console.log(`     ${key}=${value}`);
});
console.log('');
console.log(`   Полный URL: ${paymentUrl}`);
console.log('');

// 7. Возможные причины ошибки 29
console.log('🚨 Возможные причины ошибки 29:');
console.log('   1. Неверный MerchantLogin в настройках Robokassa');
console.log('   2. Неверный пароль #1 для текущего режима');
console.log('   3. Неправильное форматирование суммы (должно быть с .toFixed(2))');
console.log('   4. Скрытые символы в логине или пароле');
console.log('   5. Неправильный порядок параметров в формуле подписи');
console.log('   6. Использование неправильного алгоритма хеширования');
console.log('   7. Проблемы с кодировкой символов');
console.log('');

// 8. Рекомендации
console.log('💡 Рекомендации:');
console.log('   1. Проверьте в личном кабинете Robokassa:');
console.log(`      - MerchantLogin точно "${login}"`);
console.log(`      - Пароль #1 для ${isTestMode ? 'тестового' : 'боевого'} режима`);
console.log('   2. Убедитесь, что сумма передается с 2 знаками после запятой');
console.log('   3. Проверьте, что нет лишних пробелов в логине и пароле');
console.log('   4. Убедитесь, что используется MD5 хеширование');
console.log('   5. Проверьте, что все параметры передаются как строки');

console.log('\n✅ Диагностика завершена!');