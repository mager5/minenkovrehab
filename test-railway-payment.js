const https = require('https');

const postData = JSON.stringify({
  amount: 5000,
  description: 'Test subscription payment minenkovrehab.ru'
});

const options = {
  hostname: 'minenkovrehab-production-15cc.up.railway.app',
  port: 443,
  path: '/api/robokassa/generate-payment-url',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
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

req.write(postData);
req.end();

console.log('Отправляем запрос к Railway API...');
console.log('Данные:', postData);