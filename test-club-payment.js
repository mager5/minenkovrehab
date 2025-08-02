const https = require('https');
const http = require('http');

// Тестирование локального API
async function testLocalAPI() {
  console.log('🧪 Тестирование локального API...');

  const postData = JSON.stringify({
    email: '',
    phone: '',
    amount: 2950,
    description: 'Тест оплаты абонемента',
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/robokassa/generate-payment-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Локальный API работает!');
          console.log('📊 Ответ:', JSON.stringify(response, null, 2));
          resolve(response);
        } catch (err) {
          console.log('❌ Ошибка парсинга ответа:', err.message);
          console.log('📄 Сырой ответ:', data);
          reject(err);
        }
      });
    });

    req.on('error', err => {
      console.log('❌ Ошибка подключения к локальному API:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Тестирование Railway API
async function testRailwayAPI() {
  console.log('\n🚂 Тестирование Railway API...');

  const postData = JSON.stringify({
    email: '',
    phone: '',
    amount: 2950,
    description: 'Тест оплаты абонемента',
  });

  const options = {
    hostname: 'minenkovrehab-production-15cc.up.railway.app',
    port: 443,
    path: '/api/robokassa/generate-payment-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Railway API работает!');
          console.log('📊 Ответ:', JSON.stringify(response, null, 2));
          resolve(response);
        } catch (err) {
          console.log('❌ Ошибка парсинга ответа:', err.message);
          console.log('📄 Сырой ответ:', data);
          reject(err);
        }
      });
    });

    req.on('error', err => {
      console.log('❌ Ошибка подключения к Railway API:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('=== Тестирование кнопки "Купить абонемент" ===\n');

  try {
    await testLocalAPI();
  } catch (err) {
    console.log('⚠️ Локальный API недоступен');
  }

  try {
    await testRailwayAPI();
  } catch (err) {
    console.log('⚠️ Railway API недоступен');
  }

  console.log('\n=== Тестирование завершено ===');
}

main();
