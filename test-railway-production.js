const https = require('https');

// Тест Railway API
const testData = JSON.stringify({
  amount: 3000,
  description: 'Экспресс онлайн-консультация',
  invoiceId: 'test-' + Date.now(),
});

const options = {
  hostname: 'robokassa-api-production-8b4f.up.railway.app',
  port: 443,
  path: '/api/robokassa/generate-payment-url',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData),
  },
};

console.log('🚀 Тестирование Railway API...');
console.log('URL:', `https://${options.hostname}${options.path}`);
console.log('Data:', testData);

const req = https.request(options, res => {
  console.log('\n📊 Ответ сервера:');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📝 Тело ответа:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', error => {
  console.error('❌ Ошибка запроса:', error.message);
});

req.write(testData);
req.end();

// Также тестируем health endpoint
setTimeout(() => {
  console.log('\n\n🏥 Тестирование health endpoint...');

  const healthOptions = {
    hostname: 'robokassa-api-production-8b4f.up.railway.app',
    port: 443,
    path: '/health',
    method: 'GET',
  };

  const healthReq = https.request(healthOptions, res => {
    console.log('Health Status:', res.statusCode);

    let healthData = '';
    res.on('data', chunk => {
      healthData += chunk;
    });

    res.on('end', () => {
      console.log('Health Response:', healthData);
    });
  });

  healthReq.on('error', error => {
    console.error('❌ Health check error:', error.message);
  });

  healthReq.end();
}, 2000);
