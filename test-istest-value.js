// Тестируем различные способы формирования IsTest параметра

console.log('🔍 Тестирование формирования IsTest параметра');
console.log('=' .repeat(50));

// Тест 1: Обычное булево значение
const isTest1 = true;
const result1 = `IsTest=${isTest1 ? 1 : 0}`;
console.log('\n1️⃣ Булево значение true:');
console.log('Результат:', result1);

// Тест 2: Строковое значение "true"
const isTest2 = 'true';
const result2 = `IsTest=${isTest2 ? 1 : 0}`;
console.log('\n2️⃣ Строковое значение "true":');
console.log('Результат:', result2);

// Тест 3: Значение с кавычкой
const isTest3 = "true'";
const result3 = `IsTest=${isTest3 ? 1 : 0}`;
console.log('\n3️⃣ Значение с кавычкой "true\'":');
console.log('Результат:', result3);

// Тест 4: Проверяем что происходит если в тернарном операторе есть кавычка
const isTest4 = true;
const result4 = `IsTest=${isTest4 ? "1'" : 0}`;
console.log('\n4️⃣ Кавычка в тернарном операторе:');
console.log('Результат:', result4);

// Тест 5: Проверяем переменные окружения
console.log('\n5️⃣ Переменные окружения:');
console.log('process.env.ROBOKASSA_TEST_MODE:', JSON.stringify(process.env.ROBOKASSA_TEST_MODE));
console.log('Тип:', typeof process.env.ROBOKASSA_TEST_MODE);

// Тест 6: Симуляция проблемного случая
const problematicValue = "1'";
const result6 = `IsTest=${problematicValue}`;
console.log('\n6️⃣ Проблемное значение "1\'":');
console.log('Результат:', result6);

// Тест 7: Проверяем что происходит с URLSearchParams
console.log('\n7️⃣ Тестирование с URLSearchParams:');
const { URLSearchParams } = require('url');

const params = new URLSearchParams();
params.append('IsTest', problematicValue);
console.log('URLSearchParams с "1\'":', params.toString());

// Тест 8: Проверяем конфигурацию из файлов
console.log('\n8️⃣ Проверка конфигурации из файлов:');
try {
  const config1 = require('./generate-correct-payment-link.js');
  console.log('generate-correct-payment-link.js isTest:', config1.ROBOKASSA_CONFIG.isTest);
  console.log('Тип:', typeof config1.ROBOKASSA_CONFIG.isTest);
} catch (e) {
  console.log('Ошибка загрузки generate-correct-payment-link.js:', e.message);
}

try {
  const config2 = require('./robokassa-payment-generator.js');
  console.log('robokassa-payment-generator.js isTest:', config2.ROBOKASSA_CONFIG.isTest);
  console.log('Тип:', typeof config2.ROBOKASSA_CONFIG.isTest);
} catch (e) {
  console.log('Ошибка загрузки robokassa-payment-generator.js:', e.message);
}

console.log('\n' + '=' .repeat(50));
console.log('🎯 Заключение: Нужно найти где значение IsTest получает кавычку');