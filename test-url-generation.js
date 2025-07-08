const { generatePaymentSignature, generateInvoiceId } = require('./robokassa-api/utils/signature');

// Тестируем генерацию URL с теми же параметрами что в проблемной ссылке
const login = 'Minenkov-2';
const amount = 2950.00;
const invId = 1724896587;
const description = 'Test payment';
const password1 = process.env.ROBOKASSA_TEST_PASSWORD1 || 'test_password';
const isTestMode = true;

console.log('🔍 Тестирование генерации URL...');
console.log('Параметры:', { login, amount, invId, description, isTestMode });

// Генерируем подпись
const signature = generatePaymentSignature(login, amount, invId, password1, {});
console.log('Подпись:', signature);

// Формируем URL точно как в коде
const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
const urlParams = new URLSearchParams();
urlParams.append('MerchantLogin', login);
urlParams.append('OutSum', amount.toFixed(2));
urlParams.append('invoiceID', invId);
urlParams.append('Description', description);
urlParams.append('SignatureValue', signature);

if (isTestMode) {
  urlParams.append('IsTest', '1');
}

const paymentUrl = `${baseUrl}?${urlParams.toString()}`;

console.log('\n🔗 Сгенерированная ссылка:');
console.log(paymentUrl);

console.log('\n🔍 Проверяем наличие %27 в конце:');
const hasExtraChars = paymentUrl.includes('%27');
console.log('Содержит %27:', hasExtraChars);

if (hasExtraChars) {
  console.log('❌ НАЙДЕНА ПРОБЛЕМА: ссылка содержит лишние символы %27');
  console.log('Позиция %27:', paymentUrl.indexOf('%27'));
} else {
  console.log('✅ Ссылка корректна, лишних символов не найдено');
}

// Проверяем каждый параметр отдельно
console.log('\n🔍 Анализ параметров:');
for (const [key, value] of urlParams.entries()) {
  console.log(`${key}: ${value}`);
  if (value.includes("'")) {
    console.log(`❌ НАЙДЕНА ОДИНАРНАЯ КАВЫЧКА в параметре ${key}: ${value}`);
  }
}

// Тестируем URLSearchParams отдельно
console.log('\n🔍 Тестирование URLSearchParams:');
const testParams = new URLSearchParams();
testParams.append('IsTest', '1');
console.log('URLSearchParams для IsTest=1:', testParams.toString());

// Проверяем что происходит если добавить кавычку
const testParams2 = new URLSearchParams();
testParams2.append('IsTest', "1'");
console.log('URLSearchParams для IsTest="1\'":', testParams2.toString());