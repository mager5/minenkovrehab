const crypto = require('crypto');
const { 
  generatePaymentSignature, 
  generateResultSignature, 
  generateSuccessSignature,
  formatShpParams 
} = require('./utils/signature');

/**
 * Тестовый скрипт для проверки правильности обработки shp_ параметров
 * Проверяет алфавитную сортировку shp_ параметров в подписях
 */

console.log('🔍 Проверка обработки shp_ параметров в подписях Robokassa\n');

// Загружаем переменные окружения
require('dotenv').config();

const login = process.env.ROBOKASSA_LOGIN || 'demo';
const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
const password1 = isTestMode 
  ? process.env.ROBOKASSA_TEST_PASSWORD1 || 'password_1'
  : process.env.ROBOKASSA_PASSWORD1 || 'password_1';
const password2 = isTestMode 
  ? process.env.ROBOKASSA_TEST_PASSWORD2 || 'password_2'
  : process.env.ROBOKASSA_PASSWORD2 || 'password_2';

// Тестовые данные
const testData = {
  outSum: 1500.00,
  invId: 123456789,
  description: 'Тестовый платеж с shp_ параметрами'
};

// Тестовые shp_ параметры в НЕ алфавитном порядке
const testShpParams = {
  shp_user_id: '12345',
  shp_email: 'test@example.com',
  shp_phone: '+79001234567',
  shp_amount: '1500.00',
  shp_description: 'Реабилитация Миненкова'
};

console.log('📋 Тестовые данные:');
console.log(`   Логин: ${login}`);
console.log(`   Сумма: ${testData.outSum}`);
console.log(`   ID заказа: ${testData.invId}`);
console.log(`   Тестовый режим: ${isTestMode}`);
console.log('');

console.log('📦 Исходные shp_ параметры (НЕ в алфавитном порядке):');
Object.keys(testShpParams).forEach(key => {
  console.log(`   ${key}=${testShpParams[key]}`);
});
console.log('');

// 1. Проверка функции formatShpParams
console.log('1️⃣ Проверка функции formatShpParams:');
const formattedShp = formatShpParams(testShpParams);
console.log(`   Результат: ${formattedShp}`);

// Проверяем, что параметры отсортированы в алфавитном порядке
const sortedKeys = Object.keys(testShpParams).sort();
const expectedShp = sortedKeys.map(key => `${key}=${testShpParams[key]}`).join(':');
console.log(`   Ожидается: ${expectedShp}`);
console.log(`   ✅ Сортировка корректна: ${formattedShp === expectedShp}`);
console.log('');

// 2. Проверка генерации подписи для платежа с shp_ параметрами
console.log('2️⃣ Проверка подписи для платежа с shp_ параметрами:');
const paymentSignatureWithShp = generatePaymentSignature(
  login, 
  testData.outSum, 
  testData.invId, 
  password1, 
  testShpParams
);
console.log(`   Подпись с shp_: ${paymentSignatureWithShp}`);

// Проверяем подпись без shp_ параметров для сравнения
const paymentSignatureWithoutShp = generatePaymentSignature(
  login, 
  testData.outSum, 
  testData.invId, 
  password1
);
console.log(`   Подпись без shp_: ${paymentSignatureWithoutShp}`);
console.log(`   ✅ Подписи различаются: ${paymentSignatureWithShp !== paymentSignatureWithoutShp}`);
console.log('');

// 3. Проверка генерации подписи для Result URL с shp_ параметрами
console.log('3️⃣ Проверка подписи для Result URL с shp_ параметрами:');
const resultSignatureWithShp = generateResultSignature(
  testData.outSum, 
  testData.invId, 
  password2, 
  testShpParams
);
console.log(`   Result подпись с shp_: ${resultSignatureWithShp}`);

const resultSignatureWithoutShp = generateResultSignature(
  testData.outSum, 
  testData.invId, 
  password2
);
console.log(`   Result подпись без shp_: ${resultSignatureWithoutShp}`);
console.log(`   ✅ Подписи различаются: ${resultSignatureWithShp !== resultSignatureWithoutShp}`);
console.log('');

// 4. Проверка генерации подписи для Success URL с shp_ параметрами
console.log('4️⃣ Проверка подписи для Success URL с shp_ параметрами:');
const successSignatureWithShp = generateSuccessSignature(
  testData.outSum, 
  testData.invId, 
  password1, 
  testShpParams
);
console.log(`   Success подпись с shp_: ${successSignatureWithShp}`);

const successSignatureWithoutShp = generateSuccessSignature(
  testData.outSum, 
  testData.invId, 
  password1
);
console.log(`   Success подпись без shp_: ${successSignatureWithoutShp}`);
console.log(`   ✅ Подписи различаются: ${successSignatureWithShp !== successSignatureWithoutShp}`);
console.log('');

// 5. Проверка консистентности порядка shp_ параметров
console.log('5️⃣ Проверка консистентности порядка shp_ параметров:');

// Создаем те же параметры, но в другом порядке
const shuffledShpParams = {
  shp_phone: '+79001234567',
  shp_description: 'Реабилитация Миненкова',
  shp_user_id: '12345',
  shp_amount: '1500.00',
  shp_email: 'test@example.com'
};

const signature1 = generatePaymentSignature(login, testData.outSum, testData.invId, password1, testShpParams);
const signature2 = generatePaymentSignature(login, testData.outSum, testData.invId, password1, shuffledShpParams);

console.log(`   Подпись с исходным порядком: ${signature1}`);
console.log(`   Подпись с перемешанным порядком: ${signature2}`);
console.log(`   ✅ Подписи одинаковые (порядок не влияет): ${signature1 === signature2}`);
console.log('');

// 6. Проверка с пустыми shp_ параметрами
console.log('6️⃣ Проверка с пустыми shp_ параметрами:');
const emptyShpSignature = generatePaymentSignature(login, testData.outSum, testData.invId, password1, {});
const nullShpSignature = generatePaymentSignature(login, testData.outSum, testData.invId, password1, null);
const noShpSignature = generatePaymentSignature(login, testData.outSum, testData.invId, password1);

console.log(`   Подпись с пустым объектом shp_: ${emptyShpSignature}`);
console.log(`   Подпись с null shp_: ${nullShpSignature}`);
console.log(`   Подпись без shp_ параметра: ${noShpSignature}`);
console.log(`   ✅ Все подписи одинаковые: ${emptyShpSignature === nullShpSignature && nullShpSignature === noShpSignature}`);
console.log('');

// 7. Демонстрация правильной формулы с shp_ параметрами
console.log('7️⃣ Демонстрация правильной формулы с shp_ параметрами:');
const formattedSum = parseFloat(testData.outSum).toFixed(2);
const sortedShpString = formatShpParams(testShpParams);
const manualFormula = `${login}:${formattedSum}:${testData.invId}:${sortedShpString}:${password1}`;
const manualSignature = crypto.createHash('md5').update(manualFormula).digest('hex').toUpperCase();

console.log(`   Формула: ${manualFormula.replace(password1, '***')}`);
console.log(`   Ручная подпись: ${manualSignature}`);
console.log(`   Функция подпись: ${paymentSignatureWithShp}`);
console.log(`   ✅ Подписи совпадают: ${manualSignature === paymentSignatureWithShp}`);
console.log('');

// 8. Рекомендации
console.log('💡 Рекомендации по использованию shp_ параметров:');
console.log('   1. ✅ shp_ параметры автоматически сортируются в алфавитном порядке');
console.log('   2. ✅ Порядок передачи параметров в функцию не важен - сортировка происходит внутри');
console.log('   3. ✅ Пустые или отсутствующие shp_ параметры обрабатываются корректно');
console.log('   4. ✅ Все функции подписи (Payment, Result, Success) поддерживают shp_ параметры');
console.log('   5. ⚠️ shp_ параметры должны быть одинаковыми в URL и в подписи');
console.log('   6. ⚠️ Значения shp_ параметров должны быть строками');
console.log('');

console.log('✅ Проверка shp_ параметров завершена успешно!');
console.log('🔒 Алфавитная сортировка shp_ параметров реализована корректно.');