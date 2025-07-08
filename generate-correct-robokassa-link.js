const crypto = require('crypto');

// Параметры для генерации ссылки (как в образце)
const merchantLogin = 'Minenkov-2';
const outSum = '2950.00';
const invoiceID = '837984789';
const description = 'Абонемент клуба формула движения';
const password1 = process.env.ROBOKASSA_TEST_PASSWORD1 || 'your_test_password_1';
const isTest = 1;

// Генерация подписи согласно документации Robokassa
// Формула: MD5(MerchantLogin:OutSum:InvoiceID:Password1)
const signatureString = `${merchantLogin}:${outSum}:${invoiceID}:${password1}`;
console.log('Строка для подписи:', signatureString.replace(password1, '***'));

const signature = crypto
  .createHash('md5')
  .update(signatureString)
  .digest('hex')
  .toUpperCase();

console.log('Сгенерированная подпись:', signature);

// Формирование URL точно как в образце
const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
const urlParams = new URLSearchParams();
urlParams.append('MerchantLogin', merchantLogin);
urlParams.append('OutSum', outSum);
urlParams.append('invoiceID', invoiceID);
urlParams.append('Description', description);
urlParams.append('SignatureValue', signature);
urlParams.append('IsTest', isTest);

const paymentUrl = `${baseUrl}?${urlParams.toString()}`;

console.log('\n=== СГЕНЕРИРОВАННАЯ ССЫЛКА ===');
console.log(paymentUrl);

console.log('\n=== ОБРАЗЕЦ ССЫЛКИ ===');
console.log('https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950.00&invoiceID=837984789&Description=Абонемент+клуба+формула+движения&SignatureValue=8E86A9B01122AA2175F5405AE1532FAE&IsTest=1');

console.log('\n=== СРАВНЕНИЕ ПОДПИСЕЙ ===');
console.log('Образец подписи:', '8E86A9B01122AA2175F5405AE1532FAE');
console.log('Наша подпись:  ', signature);
console.log('Совпадают:', signature === '8E86A9B01122AA2175F5405AE1532FAE');

// Тест с правильным API эндпоинтом
const testPayload = {
  amount: 2950.00,
  description: 'Абонемент клуба формула движения',
  invoiceId: 837984789
};

console.log('\n=== ТЕСТОВЫЙ ЗАПРОС К API ===');
console.log('curl -X POST https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url \\');
console.log('  -H "Content-Type: application/json" \\');
console.log(`  -d '${JSON.stringify(testPayload)}'`);