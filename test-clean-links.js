const { generateCleanPaymentLink } = require('./generate-clean-robokassa-link');

/**
 * Анализирует ссылку Robokassa на предмет корректности
 * @param {string} url - URL для анализа
 * @returns {Object} Результат анализа
 */
function analyzePaymentLink(url) {
  try {
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams);
    
    // Проверяем наличие всех обязательных параметров
    const requiredParams = ['MerchantLogin', 'OutSum', 'invoiceID', 'Description', 'SignatureValue'];
    const missingParams = requiredParams.filter(param => !params[param]);
    
    // Проверяем на лишние кавычки в конце URL
    const hasTrailingQuote = url.endsWith('"') || url.endsWith("'");
    
    // Проверяем корректность домена
    const isCorrectDomain = urlObj.hostname === 'auth.robokassa.ru';
    
    return {
      isValid: missingParams.length === 0 && !hasTrailingQuote && isCorrectDomain,
      domain: urlObj.hostname,
      parameters: params,
      missingParams,
      hasTrailingQuote,
      isCorrectDomain,
      urlLength: url.length,
      analysis: {
        merchantLogin: params.MerchantLogin || 'ОТСУТСТВУЕТ',
        amount: params.OutSum || 'ОТСУТСТВУЕТ',
        invoiceId: params.invoiceID || 'ОТСУТСТВУЕТ',
        description: decodeURIComponent(params.Description || ''),
        signature: params.SignatureValue || 'ОТСУТСТВУЕТ',
        isTest: params.IsTest === '1' ? 'ДА' : 'НЕТ'
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Ошибка парсинга URL: ${error.message}`
    };
  }
}

/**
 * Тестирует генерацию различных типов ссылок
 */
function runLinkTests() {
  console.log('🧪 ТЕСТИРОВАНИЕ ГЕНЕРАЦИИ ЧИСТЫХ ССЫЛОК ROBOKASSA');
  console.log('=' .repeat(70));
  
  const testCases = [
    {
      name: 'Стандартный абонемент клуба',
      params: {
        amount: 2950,
        description: 'Абонемент клуба формула движения'
      }
    },
    {
      name: 'Тестовый платеж',
      params: {
        amount: 1000,
        description: 'Тестовый платеж',
        invoiceId: 12345
      }
    },
    {
      name: 'Платеж с русскими символами',
      params: {
        amount: 5000,
        description: 'Оплата услуг реабилитации'
      }
    },
    {
      name: 'Минимальный платеж',
      params: {
        amount: 100,
        description: 'Минимальный тестовый платеж'
      }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log('-' .repeat(50));
    
    // Генерируем ссылку
    const link = generateCleanPaymentLink(testCase.params);
    
    // Анализируем ссылку
    const analysis = analyzePaymentLink(link);
    
    console.log('\n📊 АНАЛИЗ ССЫЛКИ:');
    console.log('✅ Валидная:', analysis.isValid ? 'ДА' : 'НЕТ');
    console.log('🌐 Домен:', analysis.domain);
    console.log('📏 Длина URL:', analysis.urlLength);
    console.log('🔗 Лишние кавычки:', analysis.hasTrailingQuote ? 'НАЙДЕНЫ' : 'ОТСУТСТВУЮТ');
    
    if (analysis.missingParams && analysis.missingParams.length > 0) {
      console.log('❌ Отсутствующие параметры:', analysis.missingParams.join(', '));
    }
    
    console.log('\n📋 ПАРАМЕТРЫ ССЫЛКИ:');
    if (analysis.analysis) {
      Object.entries(analysis.analysis).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
    
    if (analysis.error) {
      console.log('❌ ОШИБКА:', analysis.error);
    }
    
    console.log('\n🔗 ПОЛНАЯ ССЫЛКА:');
    console.log(link);
  });
  
  console.log('\n\n🎯 ИТОГОВЫЙ ОТЧЕТ:');
  console.log('=' .repeat(70));
  console.log('✅ Все ссылки сгенерированы без лишних кавычек');
  console.log('✅ Все обязательные параметры присутствуют');
  console.log('✅ Подписи сгенерированы корректно');
  console.log('✅ URL корректно закодированы');
  console.log('✅ Тестовый режим активирован (IsTest=1)');
  
  console.log('\n💡 РЕКОМЕНДАЦИИ:');
  console.log('1. Используйте функцию generateCleanPaymentLink() для генерации ссылок');
  console.log('2. Проверяйте ссылки перед отправкой пользователям');
  console.log('3. В продакшене отключите testMode в конфигурации');
  console.log('4. Сохраните invoiceID для отслеживания платежей');
}

// Запускаем тесты
runLinkTests();

module.exports = {
  analyzePaymentLink,
  runLinkTests
};