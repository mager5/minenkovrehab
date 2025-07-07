const https = require('https');

const data = JSON.stringify({
  amount: 5000,
  description: 'Тестовая оплата абонемента minenkovrehab.ru'
});

const options = {
  hostname: 'robokassa-api-production.up.railway.app',
  port: 443,
  path: '/api/robokassa/generate-payment-url',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Статус: ${res.statusCode}`);
  console.log(`Заголовки: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== ОТВЕТ ОТ RAILWAY API ===');
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success && parsed.data && parsed.data.paymentUrl) {
        console.log('\n=== ПЛАТЕЖНАЯ ССЫЛКА ===');
        console.log(parsed.data.paymentUrl);
      }
    } catch (e) {
      console.log('Сырой ответ:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`Ошибка запроса: ${e.message}`);
});

req.write(data);
req.end();

console.log('Отправляем запрос к Railway API...');
console.log('Данные:', data);