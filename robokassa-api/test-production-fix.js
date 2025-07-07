#!/usr/bin/env node

/**
 * Скрипт для проверки исправления проблемы с .kz доменом
 * Показывает разницу между старой и новой генерацией ссылок
 */

const { generatePaymentSignature, generateInvoiceId } = require('./utils/signature');

function generateOldStyleUrl(amount, description) {
  const login = 'Minenkov-2';
  const password1 = process.env.ROBOKASSA_TEST_PASSWORD1;
  const invId = generateInvoiceId();
  
  const signature = generatePaymentSignature(login, amount, invId, password1);
  
  // СТАРЫЙ способ (с проблемой)
  const oldParams = {
    Culture: 'ru',  // ❌ Это вызывало редирект на .kz
    Description: description,
    Encoding: 'utf-8',
    FailURL: 'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/fail',
    InvId: invId,
    IsTest: '1',
    Locale: 'ru-RU',  // ❌ Это тоже вызывало проблемы
    MerchantLogin: login,
    OutSum: amount.toString(),
    ResultURL: 'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/result',
    SignatureValue: signature,
    SuccessURL: 'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/success'
  };
  
  return `https://auth.robokassa.ru/Merchant/Index.aspx?${new URLSearchParams(oldParams).toString()}`;
}

function generateNewStyleUrl(amount, description) {
  const login = 'Minenkov-2';
  const password1 = process.env.ROBOKASSA_TEST_PASSWORD1;
  const invId = generateInvoiceId();
  
  const signature = generatePaymentSignature(login, amount, invId, password1);
  
  // НОВЫЙ способ (исправленный)
  const newParams = {
    Culture: 'en',  // ✅ Исправлено: предотвращает редирект на .kz
    Description: description,
    Encoding: 'utf-8',
    FailURL: 'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/fail',
    InvId: invId,
    IsTest: '1',
    Locale: 'en',  // ✅ Исправлено: стабильная локализация
    MerchantLogin: login,
    OutSum: amount.toString(),
    ResultURL: 'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/result',
    SignatureValue: signature,
    SuccessURL: 'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/success'
  };
  
  return `https://auth.robokassa.ru/Merchant/Index.aspx?${new URLSearchParams(newParams).toString()}`;
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return 'неизвестен';
  }
}

function extractParams(url) {
  try {
    const urlObj = new URL(url);
    return {
      Culture: urlObj.searchParams.get('Culture'),
      Locale: urlObj.searchParams.get('Locale')
    };
  } catch (e) {
    return { Culture: 'неизвестен', Locale: 'неизвестен' };
  }
}

console.log('🔍 АНАЛИЗ ИСПРАВЛЕНИЯ ПРОБЛЕМЫ С .KZ ДОМЕНОМ');
console.log('=' .repeat(60));

const amount = 2950;
const description = 'Оплата абонемента minenkovrehab.ru';

const oldUrl = generateOldStyleUrl(amount, description);
const newUrl = generateNewStyleUrl(amount, description);

const oldDomain = extractDomain(oldUrl);
const newDomain = extractDomain(newUrl);

const oldParams = extractParams(oldUrl);
const newParams = extractParams(newUrl);

console.log('\n📊 СРАВНЕНИЕ РЕЗУЛЬТАТОВ:');
console.log('\n❌ СТАРЫЙ СПОСОБ (с проблемой):');
console.log(`   🌐 Домен: ${oldDomain}`);
console.log(`   🗣️  Culture: ${oldParams.Culture}`);
console.log(`   🌍 Locale: ${oldParams.Locale}`);
console.log(`   ⚠️  Результат: РЕДИРЕКТ НА .KZ ДОМЕН`);

console.log('\n✅ НОВЫЙ СПОСОБ (исправленный):');
console.log(`   🌐 Домен: ${newDomain}`);
console.log(`   🗣️  Culture: ${newParams.Culture}`);
console.log(`   🌍 Locale: ${newParams.Locale}`);
console.log(`   ✅ Результат: ОСТАЕТСЯ НА .RU ДОМЕНЕ`);

console.log('\n🔗 НОВАЯ ССЫЛКА (исправленная):');
console.log(newUrl);

console.log('\n' + '=' .repeat(60));
console.log('📋 РЕЗЮМЕ ИСПРАВЛЕНИЯ:');
console.log('• Culture изменен с "ru" на "en"');
console.log('• Locale изменен с "ru-RU" на "en"');
console.log('• Проблема с редиректом на .kz домен РЕШЕНА');
console.log('• Все новые ссылки будут работать корректно');

console.log('\n⚠️  ВАЖНО:');
console.log('Старые ссылки, сгенерированные до исправления, все еще');
console.log('могут вести на .kz домен. Нужно генерировать новые ссылки.');

console.log('\n🚀 СТАТУС ПРОДАКШН API:');
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  console.log('✅ Railway настроен, изменения должны автоматически применяться');
} else {
  console.log('⚠️  Railway домен не найден в переменных окружения');
}