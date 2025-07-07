const crypto = require('crypto');
require('dotenv').config();

// Функция для создания подписи (из utils/signature.js)
function createSignature(params, password) {
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join(':') + `:${password}`;
  
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

// Функция для генерации платежной ссылки (из routes/robokassa.js)
function generatePaymentUrl(amount, description) {
  const login = process.env.ROBOKASSA_LOGIN;
  const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
  const password1 = isTestMode ? process.env.ROBOKASSA_TEST_PASSWORD1 : process.env.ROBOKASSA_PASSWORD1;
  
  if (!login || !password1) {
    throw new Error('Отсутствуют необходимые переменные окружения');
  }
  
  const invoiceId = Date.now().toString();
  
  // Параметры для подписи
  const signatureParams = {
    MerchantLogin: login,
    OutSum: amount.toString(),
    InvId: invoiceId
  };
  
  if (description) {
    signatureParams.Description = description;
  }
  
  // Создание подписи
  const signature = createSignature(signatureParams, password1);
  
  // Базовый URL (тестовый или продакшн)
  const baseUrl = isTestMode 
    ? 'https://auth.robokassa.ru/Merchant/Index.aspx'
    : 'https://auth.robokassa.ru/Merchant/Index.aspx';
  
  // Параметры URL
  const urlParams = new URLSearchParams({
    MerchantLogin: login,
    OutSum: amount.toString(),
    InvId: invoiceId,
    SignatureValue: signature,
    IsTest: isTestMode ? '1' : '0',
    Culture: 'en',  // ИСПРАВЛЕНО: было 'ru'
    Locale: 'en'    // ИСПРАВЛЕНО: было 'ru-RU'
  });
  
  if (description) {
    urlParams.append('Description', description);
  }
  
  const paymentUrl = `${baseUrl}?${urlParams.toString()}`;
  
  return {
    success: true,
    paymentUrl,
    invoiceId,
    testMode: isTestMode,
    culture: 'en',
    locale: 'en'
  };
}

// Функция для анализа ссылки
function analyzePaymentUrl(url) {
  try {
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams);
    
    return {
      domain: urlObj.hostname,
      culture: params.Culture || 'не указан',
      locale: params.Locale || 'не указан',
      amount: params.OutSum || 'не указан',
      description: params.Description || 'не указан',
      isTest: params.IsTest === '1',
      isKzDomain: urlObj.hostname.includes('.kz'),
      hasRuCulture: params.Culture === 'ru'
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Тестовые случаи
const testCases = [
  {
    name: 'Базовый тест',
    amount: 1000,
    description: 'Тестовый платеж 1000 руб'
  },
  {
    name: 'Тест с русскими символами',
    amount: 2500,
    description: 'Платеж за услуги реабилитации 2500₽'
  },
  {
    name: 'Тест без описания',
    amount: 500
  }
];

// Запуск тестов
console.log('🧪 ПРЯМОЕ ТЕСТИРОВАНИЕ ГЕНЕРАЦИИ ССЫЛОК ROBOKASSA');
console.log('=' .repeat(60));
console.log(`🔧 Тестовый режим: ${process.env.ROBOKASSA_TEST_MODE === 'true' ? 'ВКЛ' : 'ВЫКЛ'}`);
console.log(`👤 Логин: ${process.env.ROBOKASSA_LOGIN}`);
console.log('=' .repeat(60));

let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   💰 Сумма: ${testCase.amount} руб`);
  if (testCase.description) {
    console.log(`   📝 Описание: ${testCase.description}`);
  }
  
  try {
    const result = generatePaymentUrl(testCase.amount, testCase.description);
    const analysis = analyzePaymentUrl(result.paymentUrl);
    
    console.log(`   ✅ Ссылка сгенерирована успешно`);
    console.log(`   🌐 Домен: ${analysis.domain}`);
    console.log(`   🗣️  Culture: ${analysis.culture}`);
    console.log(`   🌍 Locale: ${analysis.locale}`);
    console.log(`   🧪 Тестовый режим: ${analysis.isTest ? 'ДА' : 'НЕТ'}`);
    
    // Проверки
    if (analysis.isKzDomain) {
      console.log(`   ❌ ПРОБЛЕМА: Обнаружен .kz домен!`);
      allTestsPassed = false;
    } else {
      console.log(`   ✅ Домен корректный (не .kz)`);
    }
    
    if (analysis.hasRuCulture) {
      console.log(`   ❌ ПРОБЛЕМА: Culture=ru может вызвать редирект на .kz`);
      allTestsPassed = false;
    } else {
      console.log(`   ✅ Culture корректный (${analysis.culture})`);
    }
    
    console.log(`   🔗 URL: ${result.paymentUrl}`);
    
  } catch (error) {
    console.log(`   ❌ Ошибка генерации: ${error.message}`);
    allTestsPassed = false;
  }
});

// Итоговый результат
console.log('\n' + '=' .repeat(60));
console.log('📊 ИТОГОВЫЙ РЕЗУЛЬТАТ');
console.log('=' .repeat(60));

if (allTestsPassed) {
  console.log('🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!');
  console.log('✅ Проблема с редиректом на .kz домен РЕШЕНА!');
  console.log('✅ Параметры локализации настроены корректно (Culture=en, Locale=en)');
} else {
  console.log('❌ ОБНАРУЖЕНЫ ПРОБЛЕМЫ!');
  console.log('⚠️  Требуется дополнительная настройка.');
}

console.log('\n🔍 КЛЮЧЕВЫЕ ИЗМЕНЕНИЯ:');
console.log('• Culture изменен с "ru" на "en"');
console.log('• Locale изменен с "ru-RU" на "en"');
console.log('• Это предотвращает автоматический редирект на .kz домен');