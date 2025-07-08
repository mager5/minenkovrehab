const { URLSearchParams } = require('url');

// Тестируем различные способы добавления IsTest параметра
console.log('🔍 Диагностика проблемы с %27 в URL');
console.log('=' .repeat(50));

// Тест 1: Обычное добавление
console.log('\n1️⃣ Тест обычного добавления:');
const params1 = new URLSearchParams();
params1.append('IsTest', '1');
console.log('Результат:', params1.toString());

// Тест 2: Добавление с кавычкой
console.log('\n2️⃣ Тест добавления с одинарной кавычкой:');
const params2 = new URLSearchParams();
params2.append('IsTest', "1'");
console.log('Результат:', params2.toString());

// Тест 3: Добавление с двойной кавычкой
console.log('\n3️⃣ Тест добавления с двойной кавычкой:');
const params3 = new URLSearchParams();
params3.append('IsTest', '1"');
console.log('Результат:', params3.toString());

// Тест 4: Проверяем переменные окружения
console.log('\n4️⃣ Проверка переменных окружения:');
console.log('ROBOKASSA_TEST_MODE:', process.env.ROBOKASSA_TEST_MODE);
console.log('Тип:', typeof process.env.ROBOKASSA_TEST_MODE);
console.log('Сравнение === "true":', process.env.ROBOKASSA_TEST_MODE === 'true');

// Тест 5: Проверяем что происходит с булевыми значениями
console.log('\n5️⃣ Тест с булевыми значениями:');
const params5 = new URLSearchParams();
params5.append('IsTest', true);
console.log('Результат с true:', params5.toString());

const params6 = new URLSearchParams();
params6.append('IsTest', String(true));
console.log('Результат с String(true):', params6.toString());

// Тест 6: Проверяем что происходит с undefined/null
console.log('\n6️⃣ Тест с undefined/null:');
const params7 = new URLSearchParams();
try {
  params7.append('IsTest', undefined);
  console.log('Результат с undefined:', params7.toString());
} catch (e) {
  console.log('Ошибка с undefined:', e.message);
}

const params8 = new URLSearchParams();
try {
  params8.append('IsTest', null);
  console.log('Результат с null:', params8.toString());
} catch (e) {
  console.log('Ошибка с null:', e.message);
}

// Тест 7: Проверяем что происходит с объектами
console.log('\n7️⃣ Тест с объектами:');
const params9 = new URLSearchParams();
params9.append('IsTest', { value: '1' });
console.log('Результат с объектом:', params9.toString());

// Тест 8: Симуляция проблемного случая
console.log('\n8️⃣ Симуляция возможных проблемных случаев:');

// Возможно где-то передается строка с кавычкой
const problematicValues = [
  "1'",
  "'1'",
  '1"',
  '"1"',
  "1`",
  "`1`",
  "1\'",
  "1\""
];

problematicValues.forEach((value, index) => {
  const params = new URLSearchParams();
  params.append('IsTest', value);
  console.log(`   Значение ${index + 1} (${JSON.stringify(value)}): ${params.toString()}`);
});

// Тест 9: Проверяем что происходит при конкатенации строк
console.log('\n9️⃣ Тест конкатенации строк:');
const testValue = '1';
const params10 = new URLSearchParams();
params10.append('IsTest', testValue + "'");
console.log('Результат с конкатенацией:', params10.toString());

console.log('\n' + '=' .repeat(50));
console.log('🎯 Заключение: %27 появляется когда в значение параметра попадает одинарная кавычка');
console.log('💡 Нужно найти где в коде может добавляться кавычка к значению "1"');