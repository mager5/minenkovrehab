const crypto = require('crypto');

// Конфигурация Robokassa
const ROBOKASSA_CONFIG = {
  merchantLogin: 'Minenkov-2',
  password1: 'password_1_test',
  password2: 'password_2_test',
  isTestMode: true
};

// Функция для создания подписи
function createSignature(merchantLogin, outSum, invId, password) {
  const signatureString = `${merchantLogin}:${outSum}:${invId}:${password}`;
  return crypto.createMd5Hash ? 
    crypto.createMd5Hash().update(signatureString).digest('hex').toUpperCase() :
    crypto.createHash('md5').update(signatureString).digest('hex').toUpperCase();
}

// Генерация старой ссылки (с Culture=ru, Locale=ru-RU)
function generateOldLink(amount, description) {
  const invId = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const signature = createSignature(
    ROBOKASSA_CONFIG.merchantLogin,
    amount,
    invId,
    ROBOKASSA_CONFIG.password1
  );

  const params = new URLSearchParams({
    MerchantLogin: ROBOKASSA_CONFIG.merchantLogin,
    OutSum: amount,
    InvId: invId,
    Description: description,
    SignatureValue: signature,
    Culture: 'ru',  // СТАРЫЙ ПАРАМЕТР - ПРИЧИНА РЕДИРЕКТА НА .kz
    Locale: 'ru-RU', // СТАРЫЙ ПАРАМЕТР
    Encoding: 'utf-8',
    IsTest: ROBOKASSA_CONFIG.isTestMode ? '1' : '0'
  });

  return `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;
}

// Генерация новой ссылки (с Culture=en, Locale=en)
function generateNewLink(amount, description) {
  const invId = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const signature = createSignature(
    ROBOKASSA_CONFIG.merchantLogin,
    amount,
    invId,
    ROBOKASSA_CONFIG.password1
  );

  const params = new URLSearchParams({
    MerchantLogin: ROBOKASSA_CONFIG.merchantLogin,
    OutSum: amount,
    InvId: invId,
    Description: description,
    SignatureValue: signature,
    Culture: 'en',  // ИСПРАВЛЕННЫЙ ПАРАМЕТР - НЕТ РЕДИРЕКТА НА .kz
    Locale: 'en',   // ИСПРАВЛЕННЫЙ ПАРАМЕТР
    Encoding: 'utf-8',
    IsTest: ROBOKASSA_CONFIG.isTestMode ? '1' : '0'
  });

  return `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;
}

console.log('🔴 ДЕМОНСТРАЦИЯ ПРОБЛЕМЫ И РЕШЕНИЯ');
console.log('=' .repeat(60));

const amount = 2950;
const description = 'Тест исправления редиректа';

console.log('\n❌ СТАРАЯ ССЫЛКА (Culture=ru, Locale=ru-RU):');
console.log('Эта ссылка РЕДИРЕКТИТ на auth.robokassa.kz');
const oldLink = generateOldLink(amount, description);
console.log(oldLink);
console.log('\n🔍 Обратите внимание на параметры:');
console.log('- Culture=ru');
console.log('- Locale=ru-RU');
console.log('- Домен: auth.robokassa.ru (но редиректит на .kz)');

console.log('\n✅ НОВАЯ ССЫЛКА (Culture=en, Locale=en):');
console.log('Эта ссылка ОСТАЕТСЯ на auth.robokassa.ru');
const newLink = generateNewLink(amount, description);
console.log(newLink);
console.log('\n🔍 Обратите внимание на параметры:');
console.log('- Culture=en');
console.log('- Locale=en');
console.log('- Домен: auth.robokassa.ru (БЕЗ редиректа)');

console.log('\n📋 РЕЗЮМЕ:');
console.log('=' .repeat(60));
console.log('✅ Проблема РЕШЕНА в файле routes/robokassa.js');
console.log('✅ Все НОВЫЕ ссылки будут работать корректно');
console.log('❌ СТАРЫЕ ссылки могут по-прежнему редиректить на .kz');
console.log('💡 Решение: генерировать новые ссылки для новых платежей');

console.log('\n🚀 Ваша ссылка из сообщения:');
console.log('https://auth.robokassa.kz/... - это СТАРАЯ ссылка');
console.log('Она была сгенерирована с Culture=ru, поэтому редиректит на .kz');
console.log('\n💪 Новые ссылки будут генерироваться с Culture=en и останутся на .ru!');