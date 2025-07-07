const https = require('https');

// URL Railway приложения
const RAILWAY_URL = 'https://minenkovrehab-production.up.railway.app';

/**
 * Тестирование исправления переменных окружения на Railway
 */
async function testRailwayFix() {
  console.log('🔧 Тестирование исправления переменных окружения на Railway...');
  console.log('=' .repeat(60));
  
  try {
    // Тест 1: Проверка SDK endpoint
    console.log('\n📋 Тест 1: Проверка SDK endpoint');
    const sdkResponse = await makeRequest('/api/robokassa-sdk/test');
    
    if (sdkResponse.success) {
      const merchantLogin = sdkResponse.config?.merchantLogin;
      console.log(`✅ SDK endpoint работает`);
      console.log(`👤 MerchantLogin: ${merchantLogin || '❌ ПУСТОЙ'}`);
      
      if (merchantLogin && merchantLogin !== '') {
        console.log('✅ MerchantLogin корректно заполнен!');
      } else {
        console.log('❌ MerchantLogin все еще пустой');
      }
      
      // Проверяем URL платежа
      const paymentUrl = sdkResponse.testData?.paymentUrl;
      if (paymentUrl) {
        console.log(`🔗 Payment URL: ${paymentUrl}`);
        
        // Проверяем наличие MerchantLogin в URL
        const urlParams = new URLSearchParams(paymentUrl.split('?')[1]);
        const urlMerchantLogin = urlParams.get('MerchantLogin');
        
        if (urlMerchantLogin && urlMerchantLogin !== '') {
          console.log(`✅ MerchantLogin в URL: ${urlMerchantLogin}`);
        } else {
          console.log('❌ MerchantLogin в URL пустой или отсутствует');
        }
      }
    } else {
      console.log('❌ SDK endpoint не работает:', sdkResponse.error);
    }
    
    // Тест 2: Проверка основного API endpoint
    console.log('\n📋 Тест 2: Проверка основного API endpoint');
    const apiResponse = await makeRequest('/api/robokassa/test');
    
    if (apiResponse.success) {
      console.log('✅ Основной API endpoint работает');
      
      const config = apiResponse.config;
      if (config) {
        console.log(`👤 Login: ${config.login || '❌ ПУСТОЙ'}`);
        console.log(`🔐 Test Mode: ${config.testMode}`);
        console.log(`🏷️ Environment: ${config.environment}`);
      }
    } else {
      console.log('❌ Основной API endpoint не работает:', apiResponse.error);
    }
    
    // Тест 3: Генерация реального платежа
    console.log('\n📋 Тест 3: Генерация тестового платежа');
    const paymentData = {
      amount: 2950,
      description: 'Тест после исправления переменных окружения',
      orderId: 'TEST_FIX_' + Date.now(),
      email: 'test@example.com',
      currency: 'RUB'
    };
    
    const paymentResponse = await makePostRequest('/api/robokassa-sdk/generate-payment-url', paymentData);
    
    if (paymentResponse.success) {
      console.log('✅ Генерация платежа успешна');
      const paymentUrl = paymentResponse.data?.paymentUrl;
      
      if (paymentUrl) {
        console.log(`🔗 Сгенерированный URL: ${paymentUrl}`);
        
        // Анализ URL
        const urlParams = new URLSearchParams(paymentUrl.split('?')[1]);
        const merchantLogin = urlParams.get('MerchantLogin');
        const outSum = urlParams.get('OutSum');
        const description = urlParams.get('Description');
        
        console.log('\n📊 Анализ сгенерированного URL:');
        console.log(`   MerchantLogin: ${merchantLogin || '❌ ОТСУТСТВУЕТ'}`);
        console.log(`   OutSum: ${outSum}`);
        console.log(`   Description: ${decodeURIComponent(description || '')}`);
        
        if (merchantLogin === 'Minenkov-2') {
          console.log('\n🎉 УСПЕХ! MerchantLogin корректно установлен!');
        } else {
          console.log('\n❌ ПРОБЛЕМА: MerchantLogin не соответствует ожидаемому значению');
        }
      }
    } else {
      console.log('❌ Ошибка генерации платежа:', paymentResponse.error);
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка при тестировании:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Тестирование завершено');
}

/**
 * Выполнение GET запроса
 */
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'minenkovrehab-production.up.railway.app',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON response', raw: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

/**
 * Выполнение POST запроса
 */
function makePostRequest(path, postData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(postData);
    
    const options = {
      hostname: 'minenkovrehab-production.up.railway.app',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve(jsonData);
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON response', raw: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Запуск тестирования
testRailwayFix();