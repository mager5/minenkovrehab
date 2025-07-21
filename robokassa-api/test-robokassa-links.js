const axios = require('axios');
const crypto = require('crypto');

// Конфигурация для тестирования
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  testCases: [
    {
      name: 'Тест с базовыми параметрами',
      amount: 1000,
      description: 'Тестовый платеж 1 000 ₽',
    },
    {
      name: 'Тест с минимальной суммой',
      amount: 100,
      description: 'Минимальный платеж 100 ₽',
    },
    {
      name: 'Тест с большой суммой',
      amount: 50000,
      description: 'Крупный платеж 50 000 ₽',
    },
    {
      name: 'Тест с русскими символами в описании',
      amount: 2500,
      description: 'Платеж за услуги реабилитации 2 500 ₽',
    },
  ],
};

// Функция для анализа ссылки Robokassa
function analyzeRobokassaLink(url) {
  try {
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams);

    return {
      domain: urlObj.hostname,
      culture: params.Culture || 'не указан',
      locale: params.Locale || 'не указан',
      amount: params.OutSum || 'не указан',
      description: params.Description || 'не указан',
      isKzDomain: urlObj.hostname.includes('.kz'),
      fullUrl: url,
    };
  } catch (error) {
    return {
      error: `Ошибка парсинга URL: ${error.message}`,
      fullUrl: url,
    };
  }
}

// Функция для тестирования генерации ссылки
async function testPaymentLink(testCase) {
  try {
    console.log(`\n🧪 ${testCase.name}`);
    console.log(`   Сумма: ${testCase.amount} руб`);
    console.log(`   Описание: ${testCase.description}`);

    const response = await axios.post(
      `${TEST_CONFIG.baseUrl}/api/robokassa/create-payment`,
      {
        amount: testCase.amount,
        description: testCase.description,
      }
    );

    if (response.data.success && response.data.paymentUrl) {
      const analysis = analyzeRobokassaLink(response.data.paymentUrl);

      console.log(`   ✅ Ссылка сгенерирована успешно`);
      console.log(`   🌐 Домен: ${analysis.domain}`);
      console.log(`   🗣️  Culture: ${analysis.culture}`);
      console.log(`   🌍 Locale: ${analysis.locale}`);
      console.log(`   💰 Сумма в ссылке: ${analysis.amount}`);

      if (analysis.isKzDomain) {
        console.log(`   ❌ ПРОБЛЕМА: Обнаружен .kz домен!`);
        return { success: false, issue: 'kz_domain', analysis };
      } else {
        console.log(`   ✅ Домен корректный (не .kz)`);
      }

      if (analysis.culture === 'ru') {
        console.log(
          `   ⚠️  ВНИМАНИЕ: Culture=ru может вызвать редирект на .kz`
        );
        return { success: false, issue: 'ru_culture', analysis };
      } else {
        console.log(`   ✅ Culture корректный (не ru)`);
      }

      return { success: true, analysis };
    } else {
      console.log(
        `   ❌ Ошибка генерации ссылки: ${response.data.error || 'Неизвестная ошибка'}`
      );
      return {
        success: false,
        issue: 'generation_error',
        error: response.data.error,
      };
    }
  } catch (error) {
    console.log(`   ❌ Ошибка запроса: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Статус ответа: ${error.response.status}`);
      console.log(`   📝 Данные ответа:`, error.response.data);
    } else if (error.request) {
      console.log(`   📡 Запрос был отправлен, но ответ не получен`);
      console.log(`   🔗 URL запроса: ${error.config?.url}`);
    } else {
      console.log(`   ⚙️  Ошибка настройки запроса: ${error.message}`);
    }
    return {
      success: false,
      issue: 'request_error',
      error: error.message,
      details: error.response?.data,
    };
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🚀 Запуск тестирования генерации ссылок Robokassa');
  console.log(`📡 API сервер: ${TEST_CONFIG.baseUrl}`);
  console.log('='.repeat(60));

  const results = [];

  for (const testCase of TEST_CONFIG.testCases) {
    const result = await testPaymentLink(testCase);
    results.push({ testCase, result });

    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Итоговый отчет
  console.log('\n' + '='.repeat(60));
  console.log('📊 ИТОГОВЫЙ ОТЧЕТ');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);

  console.log(`✅ Успешных тестов: ${successful.length}/${results.length}`);
  console.log(`❌ Неудачных тестов: ${failed.length}/${results.length}`);

  if (failed.length > 0) {
    console.log('\n🔍 ПРОБЛЕМЫ:');
    failed.forEach((item, index) => {
      console.log(`${index + 1}. ${item.testCase.name}`);
      console.log(`   Проблема: ${item.result.issue}`);
      if (item.result.error) {
        console.log(`   Ошибка: ${item.result.error}`);
      }
    });
  }

  if (successful.length > 0) {
    console.log('\n🎯 ПРИМЕРЫ УСПЕШНЫХ ССЫЛОК:');
    successful.slice(0, 2).forEach((item, index) => {
      console.log(`${index + 1}. ${item.testCase.name}`);
      console.log(`   URL: ${item.result.analysis.fullUrl}`);
    });
  }

  // Финальная оценка
  if (failed.length === 0) {
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!');
    console.log('✅ Проблема с редиректом на .kz домен решена!');
  } else {
    console.log('\n⚠️  ОБНАРУЖЕНЫ ПРОБЛЕМЫ!');
    console.log('❌ Требуется дополнительная настройка API.');
  }
}

// Запуск тестов
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Критическая ошибка при запуске тестов:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, testPaymentLink, analyzeRobokassaLink };
