const { generatePaymentSignature } = require('./robokassa-api/utils/signature');

// Параметры как в требуемой ссылке
const login = 'Minenkov-2';
const amount = 2950.00;
const invId = 837984789;
const description = 'Абонемент клуба формула движения';
const password1 = 'test_password'; // Заглушка для тестирования
const isTestMode = true;

// Генерируем подпись
const signature = generatePaymentSignature(login, amount, invId, password1);

// Формируем URL как в API
const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
const paymentParams = new Map();

// Обязательные параметры
paymentParams.set('MerchantLogin', login);
paymentParams.set('OutSum', amount.toFixed(2));
paymentParams.set('invoiceID', invId);
paymentParams.set('Description', description);
paymentParams.set('SignatureValue', signature);

// Тестовый режим
if (isTestMode) {
  paymentParams.set('IsTest', '1');
}

// Формируем URL
const urlParams = new URLSearchParams();
for (const [key, value] of paymentParams) {
  urlParams.append(key, value);
}

const generatedUrl = `${baseUrl}?${urlParams.toString()}`;

// Требуемая ссылка
const requiredUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950.00&invoiceID=837984789&Description=Абонемент+клуба+формула+движения&SignatureValue=8E86A9B01122AA2175F5405AE1532FAE&IsTest=1';

console.log('\n=== ТЕСТ ОБНОВЛЕННОЙ ГЕНЕРАЦИИ ПЛАТЕЖНОЙ ССЫЛКИ ===\n');
console.log('Сгенерированная ссылка:');
console.log(generatedUrl);
console.log('\nТребуемая ссылка:');
console.log(requiredUrl);

// Парсим параметры для сравнения
const generatedParams = new URLSearchParams(generatedUrl.split('?')[1]);
const requiredParams = new URLSearchParams(requiredUrl.split('?')[1]);

console.log('\n=== СРАВНЕНИЕ ПАРАМЕТРОВ ===\n');

const allKeys = new Set([...generatedParams.keys(), ...requiredParams.keys()]);
let allMatch = true;

for (const key of allKeys) {
  const generated = generatedParams.get(key);
  const required = requiredParams.get(key);
  const match = generated === required;
  
  if (!match) allMatch = false;
  
  console.log(`${key}:`);
  console.log(`  Сгенерировано: ${generated}`);
  console.log(`  Требуется: ${required}`);
  console.log(`  Совпадает: ${match ? '✅' : '❌'}`);
  console.log('');
}

console.log(`\n=== РЕЗУЛЬТАТ ===`);
console.log(`Все параметры совпадают: ${allMatch ? '✅ ДА' : '❌ НЕТ'}`);

if (!allMatch) {
  console.log('\n⚠️ ВНИМАНИЕ: Подпись может отличаться из-за разных паролей в тестовой среде.');
  console.log('Основные параметры (MerchantLogin, OutSum, invoiceID, Description, IsTest) должны совпадать.');
}