const https = require('https');

function testRailwayAPI() {
  const data = JSON.stringify({
    email: '',
    phone: '',
    amount: 2950,
    description: 'Test payment'
  });

  const options = {
    hostname: 'minenkovrehab-production-15cc.up.railway.app',
    port: 443,
    path: '/api/robokassa/generate-payment-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('Отправляем запрос на Railway API...');
  console.log('URL:', `https://${options.hostname}${options.path}`);
  console.log('Данные:', data);

  const req = https.request(options, (res) => {
    console.log(`Статус ответа: ${res.statusCode}`);
    console.log('Заголовки ответа:', res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Тело ответа:', responseData);
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log('Парсированный ответ:', JSON.stringify(jsonResponse, null, 2));
      } catch (e) {
        console.log('Ответ не является валидным JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Ошибка запроса:', e.message);
  });

  req.write(data);
  req.end();
}

testRailwayAPI();