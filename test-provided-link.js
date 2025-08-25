const crypto = require('crypto');

// Предоставленная ссылка
const providedUrl =
  'https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=3000.00&invoiceID=538896024&Description=Экспресс%20онлайн-консультация&Receipt=%7B%22sno%22%3A%22osn%22%2C%22items%22%3A%5B%7B%22name%22%3A%22Экспресс%20онлайн-консультация%22%2C%22quantity%22%3A1%2C%22sum%22%3A3000%2C%22payment_method%22%3A%22full_prepayment%22%2C%22payment_object%22%3A%22service%22%2C%22tax%22%3A%22none%22%7D%5D%2C%22payments%22%3A%7B%22electronic%22%3A3000%7D%2C%22vats%22%3A%7B%22none%22%3A3000%7D%2C%22client%22%3A%7B%22email%22%3A%22customer%40example.com%22%2C%22phone%22%3A%22%2B79001234567%22%7D%2C%22company%22%3A%7B%22email%22%3A%22info%40minenkovrehab.ru%22%2C%22sno%22%3A%22osn%22%2C%22inn%22%3A%22000000000000%22%2C%22payment_address%22%3A%22https%3A%2F%2Fminenkovrehab.ru%22%7D%2C%22total%22%3A3000%7D&SignatureValue=C96DD3E5CEC381AAE61ACB053F76320A%27';

console.log('🔍 Анализ предоставленной ссылки Robokassa\n');

// Парсим URL
const url = new URL(providedUrl);
const params = url.searchParams;

// Извлекаем параметры
const merchantLogin = params.get('MerchantLogin');
const outSum = params.get('OutSum');
const invoiceID = params.get('invoiceID');
const description = params.get('Description');
const receipt = params.get('Receipt');
const signatureValue = params.get('SignatureValue');

console.log('📋 Параметры ссылки:');
console.log(`MerchantLogin: ${merchantLogin}`);
console.log(`OutSum: ${outSum}`);
console.log(`InvoiceID: ${invoiceID}`);
console.log(`Description: ${description}`);
console.log(`SignatureValue: ${signatureValue}`);
console.log('');

// Декодируем Receipt
if (receipt) {
  try {
    const decodedReceipt = decodeURIComponent(receipt);
    console.log('📄 Декодированный Receipt:');
    console.log(decodedReceipt);
    console.log('');

    // Парсим JSON
    const receiptObj = JSON.parse(decodedReceipt);
    console.log('✅ Receipt успешно декодирован и распарсен:');
    console.log(JSON.stringify(receiptObj, null, 2));
    console.log('');

    // Проверяем структуру
    console.log('🔍 Проверка структуры Receipt:');
    console.log(`- SNO: ${receiptObj.sno}`);
    console.log(`- Количество товаров: ${receiptObj.items?.length || 0}`);
    if (receiptObj.items && receiptObj.items.length > 0) {
      console.log(`- Первый товар: ${receiptObj.items[0].name}`);
      console.log(`- Сумма: ${receiptObj.items[0].sum}`);
      console.log(`- Налог: ${receiptObj.items[0].tax}`);
    }
    console.log(`- Email клиента: ${receiptObj.client?.email}`);
    console.log(`- Телефон клиента: ${receiptObj.client?.phone}`);
    console.log(`- Общая сумма: ${receiptObj.total}`);
    console.log('');
  } catch (error) {
    console.error('❌ Ошибка при декодировании Receipt:', error.message);
  }
} else {
  console.log('⚠️ Параметр Receipt отсутствует в ссылке');
}

// Проверяем подпись
console.log('🔐 Проверка подписи:');

// Пароли из .env
const password1 = 'smt9du66JxIPmvVcv89A'; // ROBOKASSA_PASSWORD1 из .env
const password2 = 'rri7NbsU8FWEiEwvS447'; // ROBOKASSA_PASSWORD2 из .env

// Формируем строку для подписи (с Receipt)
let signatureString;
if (receipt) {
  signatureString = `${merchantLogin}:${outSum}:${invoiceID}:${receipt}:${password1}`;
} else {
  signatureString = `${merchantLogin}:${outSum}:${invoiceID}:${password1}`;
}

console.log('Строка для подписи:');
console.log(signatureString);
console.log('');

// Вычисляем MD5
const calculatedSignature = crypto
  .createHash('md5')
  .update(signatureString)
  .digest('hex')
  .toUpperCase();

console.log(`Вычисленная подпись: ${calculatedSignature}`);
console.log(`Подпись в ссылке: ${signatureValue}`);

if (calculatedSignature === signatureValue) {
  console.log('✅ Подпись корректна!');
} else {
  console.log('❌ Подпись НЕ корректна!');
  console.log('');
  console.log('🔍 Возможные причины:');
  console.log('1. Неверный пароль #1');
  console.log('2. Неправильный порядок параметров в строке подписи');
  console.log('3. Проблемы с кодировкой Receipt');
  console.log('4. Лишние символы в подписи (например, апостроф в конце)');
}

console.log('');
console.log('📝 Заключение:');
if (receipt) {
  console.log('✅ Ссылка содержит параметр Receipt для фискализации');
} else {
  console.log('❌ Ссылка НЕ содержит параметр Receipt');
}

// Проверяем наличие лишних символов в подписи
if (signatureValue && signatureValue.endsWith("'")) {
  console.log('⚠️ Обнаружен лишний апостроф в конце подписи');
  const cleanSignature = signatureValue.slice(0, -1);
  console.log(`Очищенная подпись: ${cleanSignature}`);
  if (calculatedSignature === cleanSignature) {
    console.log('✅ После удаления апострофа подпись корректна!');
  }
}
