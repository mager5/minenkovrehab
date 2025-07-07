#!/usr/bin/env node

/**
 * Тестирование локального API Robokassa
 * Проверяем генерацию платежных ссылок на локальном сервере
 */

const http = require('http');

// Конфигурация для локального тестирования
const LOCAL_API_URL = 'http://localhost:3001';

/**
 * Функция для выполнения HTTP POST запроса
 */
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: result });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * Основная функция тестирования
 */
async function testLocalRobokassaAPI() {
  console.log('🧪 Тестирование локального API Robokassa');
  console.log('🌐 URL сервера:', LOCAL_API_URL);
  console.log('=' .repeat(70));

  // Тестовые данные для платежа
  const testPaymentData = {
    amount: 2950,
    description: 'Club membership payment',
    userId: 'test-user-123'
  };

  console.log('\n📋 Тестовые данные платежа:');
  console.log(JSON.stringify(testPaymentData, null, 2));

  try {
    console.log('\n🔄 Отправка запроса на генерацию платежной ссылки...');
    
    const response = await makeRequest(
      `${LOCAL_API_URL}/api/robokassa/generate-payment-url`,
      testPaymentData
    );

    console.log('\n📡 Ответ сервера:');
    console.log(`Статус: ${response.statusCode}`);
    console.log('Данные:', JSON.stringify(response.data, null, 2));

    if (response.statusCode === 200 && response.data.success) {
      console.log('\n✅ Платежная ссылка успешно сгенерирована!');
      console.log('🔗 URL:', response.data.paymentUrl);
      
      if (response.data.invoiceId) {
        console.log(`📋 Invoice ID: ${response.data.invoiceId}`);
      }
    } else {
      console.log('\n❌ Ошибка при генерации платежной ссылки');
      if (response.data.error) {
        console.log('Ошибка:', response.data.error);
      }
    }

  } catch (error) {
    console.log('\n❌ Ошибка подключения к серверу:');
    console.log(error.message);
    console.log('💡 Убедитесь, что локальный сервер запущен на порту 3001');
    console.log('🔧 Команда для запуска: node server.js');
  }

  // Дополнительная проверка здоровья API
  console.log('\n🏥 Проверка здоровья API...');
  try {
    const response = await makeRequest(`${LOCAL_API_URL}/health`, {});
    console.log(`Статус health check: ${response.statusCode}`);
    if (response.data) {
      console.log('Health data:', response.data);
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  console.log('\n🏁 Тестирование завершено');
}

// Запуск тестирования
if (require.main === module) {
  console.log('🚀 Запуск локального тестирования Robokassa API');
  testLocalRobokassaAPI().catch(console.error);
}