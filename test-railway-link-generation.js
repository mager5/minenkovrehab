#!/usr/bin/env node

/**
 * 🔗 Тестирование генерации ссылок Railway API
 * Проверяет корректность формирования платежных ссылок
 */

const https = require('https');

// Конфигурация для тестирования
const RAILWAY_API_URL = 'https://minenkovrehab-production-15cc.up.railway.app';
const TEST_ENDPOINT = '/api/robokassa/generate-payment-url';

// Тестовые данные для разных сценариев
const testCases = [
  {
    name: 'Стандартный продукт',
    data: {
      amount: 2500,
      description: 'Консультация специалиста',
      email: 'test@example.com',
      phone: '+79001234567'
    }
  },
  {
    name: 'Продукт с русскими символами',
    data: {
      amount: 5000,
      description: 'Программа реабилитации "Новая жизнь"',
      email: 'customer@minenkovrehab.ru',
      phone: '+79991234567'
    }
  },
  {
    name: 'Дорогой продукт',
    data: {
      amount: 15000,
      description: 'Полный курс восстановления',
      email: 'vip@client.com',
      phone: '+79123456789'
    }
  }
];

/**
 * Отправляет запрос к Railway API
 */
function makeRequest(testData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'minenkovrehab-production-15cc.up.railway.app',
      port: 443,
      path: TEST_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Railway-Link-Tester/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          reject(new Error(`Ошибка парсинга JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Ошибка запроса: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Проверяет качество сгенерированной ссылки
 */
function validatePaymentUrl(url) {
  const checks = {
    isValidUrl: false,
    hasQuotes: false,
    hasRobokassa: false,
    hasRequiredParams: false,
    hasSignature: false,
    isTestMode: false
  };

  try {
    // Проверка валидности URL
    new URL(url);
    checks.isValidUrl = true;

    // Проверка на наличие проблемных кавычек
    checks.hasQuotes = url.includes('%27');

    // Проверка домена Robokassa
    checks.hasRobokassa = url.includes('robokassa.ru');

    // Проверка обязательных параметров
    const requiredParams = ['MerchantLogin', 'OutSum', 'Description', 'SignatureValue'];
    checks.hasRequiredParams = requiredParams.every(param => url.includes(param));

    // Проверка подписи
    checks.hasSignature = url.includes('SignatureValue=') && 
                         url.match(/SignatureValue=([A-F0-9]{32})/i);

    // Проверка тестового режима
    checks.isTestMode = url.includes('IsTest=1');

  } catch (error) {
    console.error(`❌ Ошибка валидации URL: ${error.message}`);
  }

  return checks;
}

/**
 * Выводит результаты проверки
 */
function printValidationResults(checks, url) {
  console.log('\n🔍 Результаты проверки ссылки:');
  console.log(`   ✅ Валидный URL: ${checks.isValidUrl ? '✅ ДА' : '❌ НЕТ'}`);
  console.log(`   ✅ Без кавычек %27: ${!checks.hasQuotes ? '✅ ДА' : '❌ НЕТ'}`);
  console.log(`   ✅ Домен Robokassa: ${checks.hasRobokassa ? '✅ ДА' : '❌ НЕТ'}`);
  console.log(`   ✅ Обязательные параметры: ${checks.hasRequiredParams ? '✅ ДА' : '❌ НЕТ'}`);
  console.log(`   ✅ Корректная подпись: ${checks.hasSignature ? '✅ ДА' : '❌ НЕТ'}`);
  console.log(`   ✅ Тестовый режим: ${checks.isTestMode ? '✅ ДА' : '❌ НЕТ'}`);
  
  // Показываем полную ссылку для проверки
  console.log('\n🔗 Сгенерированная ссылка:');
  console.log(url);
  
  // Общая оценка
  const allGood = checks.isValidUrl && !checks.hasQuotes && checks.hasRobokassa && 
                  checks.hasRequiredParams && checks.hasSignature;
  
  console.log(`\n${allGood ? '🎉' : '⚠️'} Общая оценка: ${allGood ? 'ОТЛИЧНО' : 'ТРЕБУЕТ ВНИМАНИЯ'}`);
}

/**
 * Основная функция тестирования
 */
async function runTests() {
  console.log('🚀 Запуск тестирования генерации ссылок Railway API\n');
  console.log(`🌐 Тестируемый сервер: ${RAILWAY_API_URL}${TEST_ENDPOINT}\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 Тест ${i + 1}: ${testCase.name}`);
    console.log('📊 Данные запроса:', JSON.stringify(testCase.data, null, 2));

    try {
      console.log('⏳ Отправка запроса...');
      const response = await makeRequest(testCase.data);
      
      console.log(`📡 Статус ответа: ${response.statusCode}`);
      
      if (response.statusCode === 200 && response.data.success) {
        const paymentUrl = response.data.data.paymentUrl;
        console.log('✅ Ссылка успешно сгенерирована');
        
        // Проверяем качество ссылки
        const checks = validatePaymentUrl(paymentUrl);
        printValidationResults(checks, paymentUrl);
        
      } else {
        console.log('❌ Ошибка генерации ссылки:');
        console.log(JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log(`❌ Ошибка выполнения теста: ${error.message}`);
    }
    
    // Пауза между тестами
    if (i < testCases.length - 1) {
      console.log('\n⏸️  Пауза 1 секунда...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n🏁 Тестирование завершено!');
  console.log('\n💡 Рекомендации:');
  console.log('   • Проверьте сгенерированные ссылки в браузере');
  console.log('   • Убедитесь, что все ссылки ведут на страницу оплаты Robokassa');
  console.log('   • Проверьте корректность отображения описания товара');
  console.log('   • Убедитесь, что тестовый режим активен (IsTest=1)');
}

// Запуск тестирования
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Критическая ошибка:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, validatePaymentUrl };