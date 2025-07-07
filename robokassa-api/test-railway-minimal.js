const https = require('https');
const http = require('http');

// Тестирование Railway API с минимальными параметрами
const testRailwayPayment = () => {
  const railwayUrl = 'https://minenkovrehab-production-15cc.up.railway.app';
  
  const paymentData = {
    amount: 5000,
    description: 'Тестовый платеж'
  };

  const postData = JSON.stringify(paymentData);
  
  const url = new URL('/api/robokassa/generate-payment-url', railwayUrl);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🚀 Отправляем запрос на Railway API...');
  console.log('📍 URL:', railwayUrl + '/api/robokassa/generate-payment-url');
  console.log('📦 Данные:', paymentData);
  console.log('');

  const req = https.request(options, (res) => {
    console.log('📊 Статус ответа:', res.statusCode);
    console.log('📋 Заголовки:', res.headers);
    console.log('');

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Ответ от сервера:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.paymentUrl) {
          console.log('');
          console.log('🔗 Сгенерированная ссылка:');
          console.log(response.paymentUrl);
          
          // Парсим параметры ссылки
          const url = new URL(response.paymentUrl);
          console.log('');
          console.log('📊 Параметры ссылки:');
          for (const [key, value] of url.searchParams) {
            console.log(`  ${key}: ${value}`);
          }
        }
      } catch (error) {
        console.log('❌ Ошибка парсинга JSON:');
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Ошибка запроса:', error.message);
  });

  req.write(postData);
  req.end();
};

// Запускаем тест
testRailwayPayment();