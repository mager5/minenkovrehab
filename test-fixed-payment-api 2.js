const https = require('https');

// Тестирование исправленного API
const testData = JSON.stringify({
  amount: 2950,
  description: 'Абонемент клуба формула движения',
});

const options = {
  hostname: 'minenkovrehab-production-15cc.up.railway.app',
  port: 443,
  path: '/api/robokassa-sdk/generate-payment-url',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData),
  },
};

console.log('🔄 Тестирование исправленного API...');
console.log('📊 Данные запроса:', testData);

const req = https.request(options, res => {
  console.log('📈 Статус ответа:', res.statusCode);
  console.log('📋 Заголовки:', res.headers);

  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n✅ Ответ от API:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));

      if (response.success && response.data && response.data.paymentUrl) {
        console.log('\n🔗 Сгенерированная ссылка:');
        console.log(response.data.paymentUrl);

        // Проверим, содержит ли ссылка правильные параметры
        const url = new URL(response.data.paymentUrl);
        console.log('\n📋 Параметры ссылки:');
        for (const [key, value] of url.searchParams) {
          console.log(`  ${key}: ${value}`);
        }
      }
    } catch (error) {
      console.log('❌ Ошибка парсинга JSON:', error.message);
      console.log('📄 Сырой ответ:', data);
    }
  });
});

req.on('error', error => {
  console.error('❌ Ошибка запроса:', error.message);
});

req.write(testData);
req.end();
