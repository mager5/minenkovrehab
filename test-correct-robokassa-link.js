const crypto = require('crypto');

// Параметры из правильной ссылки пользователя
const login = 'Minenkov-2';
const outSum = 2950.00;
const invoiceID = 837984789;
const description = 'Абонемент клуба формула движения';
const expectedSignature = '8E86A9B01122AA2175F5405AE1532FAE';
const isTest = true;

// Тестовый пароль #1 из .env
const testPassword1 = 'Eld5Xljk2GBN4D6TJo3N';

// Генерация подписи согласно документации Robokassa
// Формула: MD5(MerchantLogin:OutSum:InvId:Password#1)
function generateCorrectSignature(login, outSum, invId, password1) {
  const formattedSum = parseFloat(outSum).toFixed(2);
  const signatureString = `${login}:${formattedSum}:${invId}:${password1}`;
  
  console.log('Строка для подписи:', signatureString.replace(password1, '***'));
  
  return crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
    .toUpperCase();
}

// Генерируем подпись
const generatedSignature = generateCorrectSignature(login, outSum, invoiceID, testPassword1);

console.log('\n=== АНАЛИЗ ПРАВИЛЬНОЙ ССЫЛКИ ROBOKASSA ===');
console.log('Параметры из правильной ссылки:');
console.log('- MerchantLogin:', login);
console.log('- OutSum:', outSum);
console.log('- invoiceID:', invoiceID);
console.log('- Description:', description);
console.log('- SignatureValue (ожидаемая):', expectedSignature);
console.log('- IsTest:', isTest);

console.log('\nГенерация подписи:');
console.log('- Тестовый пароль #1:', testPassword1);
console.log('- Сгенерированная подпись:', generatedSignature);
console.log('- Подписи совпадают:', generatedSignature === expectedSignature);

// Формируем правильную ссылку
const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
const urlParams = new URLSearchParams();
urlParams.append('MerchantLogin', login);
urlParams.append('OutSum', outSum.toFixed(2));
urlParams.append('invoiceID', invoiceID);
urlParams.append('Description', description);
urlParams.append('SignatureValue', generatedSignature);
if (isTest) {
  urlParams.append('IsTest', '1');
}

const correctUrl = `${baseUrl}?${urlParams.toString()}`;

console.log('\nПравильная ссылка:');
console.log(correctUrl);

console.log('\nОригинальная ссылка пользователя:');
console.log('https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950.00&invoiceID=837984789&Description=Абонемент+клуба+формула+движения&SignatureValue=8E86A9B01122AA2175F5405AE1532FAE&IsTest=1');

if (generatedSignature !== expectedSignature) {
  console.log('\n❌ ПРОБЛЕМА: Подписи не совпадают!');
  console.log('Возможные причины:');
  console.log('1. Неправильный пароль #1');
  console.log('2. Неправильный формат строки для подписи');
  console.log('3. Неправильное форматирование суммы');
} else {
  console.log('\n✅ Подписи совпадают! Генерация работает правильно.');
}