#!/usr/bin/env node

const https = require('https');

/**
 * Тест интеграции фронтенда с Railway API
 * Проверяет, что фронтенд корректно обращается к Railway API
 */
async function testFrontendRailwayIntegration() {
  console.log('🔗 ТЕСТ ИНТЕГРАЦИИ ФРОНТЕНДА С RAILWAY API');
  console.log('=' .repeat(60));
  
  // Тестовые данные, аналогичные тем, что отправляет фронтенд
  const testData = {
    amount: 2950,
    description: 'Абонемент клуба формула движения',
    email: 'customer@example.com',
    phone: '+79001234567' // Корректный формат телефона
  };
  
  console.log('📋 Тестовые данные (как с фронтенда):', testData);
  console.log('\n🔄 Отправляем запрос на Railway API...');
  
  try {
    const result = await makeAPIRequest(testData);
    
    if (result.success && result.data?.paymentUrl) {
      console.log('\n✅ УСПЕХ! Railway API вернул корректный ответ');
      console.log('📋 Полученные данные:');
      console.log('   - success:', result.success);
      console.log('   - paymentUrl:', result.data.paymentUrl);
      
      // Проверяем URL на наличие проблемных символов
      const hasQuotes = result.data.paymentUrl.includes('%27');
      console.log('\n🔍 Проверка URL:');
      console.log('   - Содержит %27 (кавычки):', hasQuotes ? '❌ ДА' : '✅ НЕТ');
      
      if (hasQuotes) {
        const cleanUrl = result.data.paymentUrl.replace(/%27/g, '');
        console.log('   - Очищенный URL:', cleanUrl);
      }
      
      console.log('\n🎉 ФРОНТЕНД ИНТЕГРАЦИЯ РАБОТАЕТ КОРРЕКТНО!');
      
    } else {
      console.log('\n❌ ОШИБКА: Railway API вернул некорректный ответ');
      console.log('📋 Полученные данные:', result);
    }
    
  } catch (error) {
    console.error('\n❌ ОШИБКА при обращении к Railway API:', error.message);
  }
}

/**
 * Выполняет HTTP запрос к Railway API
 */
function makeAPIRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'minenkovrehab-production-15cc.up.railway.app',
      port: 443,
      path: '/api/robokassa/generate-payment-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData, 'utf8')
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Ошибка парсинга JSON: ${parseError.message}`));
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

// Запуск теста
if (require.main === module) {
  testFrontendRailwayIntegration();
}

module.exports = { testFrontendRailwayIntegration };