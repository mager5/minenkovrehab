const https = require('https');
const http = require('http');

// Конфигурация для тестирования Railway деплоя
const RAILWAY_URL = 'minenkovrehab-production-15cc.up.railway.app';
const TEST_EMAIL = 'test@example.com';
const TEST_PHONE = '+79001234567';
const TEST_AMOUNT = 2950;
const TEST_DESCRIPTION = 'Абонемент клуба формула движения';

// Функция для выполнения HTTP запросов
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 || options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Тест 1: Проверка health endpoint
async function testHealthEndpoint() {
  console.log('\n🏥 Тестирование health endpoint...');
  
  try {
    const options = {
      hostname: RAILWAY_URL,
      port: 443,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Health check прошел успешно');
      console.log('📊 Ответ:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log('❌ Health check не прошел');
      console.log('📊 Статус:', response.statusCode);
      console.log('📊 Ответ:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка при проверке health endpoint:', error.message);
    return false;
  }
}

// Тест 2: Проверка корневого endpoint
async function testRootEndpoint() {
  console.log('\n🏠 Тестирование корневого endpoint...');
  
  try {
    const options = {
      hostname: RAILWAY_URL,
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Корневой endpoint работает');
      console.log('📊 Доступные endpoints:', Object.keys(response.data.endpoints || {}));
      return true;
    } else {
      console.log('❌ Корневой endpoint не работает');
      console.log('📊 Статус:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка при проверке корневого endpoint:', error.message);
    return false;
  }
}

// Тест 3: Генерация ссылки оплаты
async function testPaymentGeneration() {
  console.log('\n💳 Тестирование генерации ссылки оплаты...');
  
  try {
    const postData = JSON.stringify({
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      amount: TEST_AMOUNT,
      description: TEST_DESCRIPTION
    });
    
    const options = {
      hostname: RAILWAY_URL,
      port: 443,
      path: '/api/robokassa-sdk/generate-payment-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const response = await makeRequest(options, postData);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('✅ Ссылка оплаты сгенерирована успешно');
      console.log('🔗 URL:', response.data.paymentUrl);
      console.log('💰 Сумма:', response.data.amount);
      console.log('📝 Описание:', response.data.description);
      
      // Проверяем, что ссылка содержит правильные параметры
      const url = new URL(response.data.paymentUrl);
      const params = url.searchParams;
      
      console.log('\n🔍 Параметры ссылки:');
      console.log('- MerchantLogin:', params.get('MerchantLogin'));
      console.log('- OutSum:', params.get('OutSum'));
      console.log('- Description:', params.get('Description'));
      console.log('- IsTest:', params.get('IsTest'));
      
      return true;
    } else {
      console.log('❌ Ошибка генерации ссылки оплаты');
      console.log('📊 Статус:', response.statusCode);
      console.log('📊 Ответ:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка при генерации ссылки оплаты:', error.message);
    return false;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🚀 Начинаем тестирование Railway деплоя');
  console.log('🌐 URL:', `https://${RAILWAY_URL}`);
  console.log('=' .repeat(50));
  
  const results = {
    health: false,
    root: false,
    payment: false
  };
  
  // Запускаем тесты
  results.health = await testHealthEndpoint();
  results.root = await testRootEndpoint();
  results.payment = await testPaymentGeneration();
  
  // Выводим итоги
  console.log('\n' + '=' .repeat(50));
  console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
  console.log('=' .repeat(50));
  
  console.log(`🏥 Health endpoint: ${results.health ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ'}`);
  console.log(`🏠 Root endpoint: ${results.root ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ'}`);
  console.log(`💳 Payment generation: ${results.payment ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('\n' + '=' .repeat(50));
  if (allPassed) {
    console.log('🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!');
    console.log('✅ Railway деплой работает корректно');
    console.log('🔗 API готов к использованию на:', `https://${RAILWAY_URL}`);
  } else {
    console.log('⚠️  НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ');
    console.log('🔧 Проверьте логи Railway и настройки environment variables');
  }
  console.log('=' .repeat(50));
}

// Запускаем тесты
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testHealthEndpoint, testRootEndpoint, testPaymentGeneration };