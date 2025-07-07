const https = require('https');

// Тестирование фронтенд запроса с исправленным описанием
function testFrontendPayment() {
  const data = JSON.stringify({
    email: '',
    phone: '',
    amount: 2950,
    description: 'Club membership payment'
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

  console.log('🧪 Тестирование фронтенд запроса с исправленным описанием...');
  console.log('📊 Данные:', data);
  console.log('🌐 URL:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log(`📈 Статус ответа: ${res.statusCode}`);
    console.log('📋 Заголовки ответа:', res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('📄 Тело ответа:', responseData);
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log('✅ Парсированный ответ:', JSON.stringify(jsonResponse, null, 2));
        
        if (jsonResponse.success && jsonResponse.data?.paymentUrl) {
          console.log('🎉 Успех! Платежная ссылка создана.');
          console.log('🔗 URL для оплаты:', jsonResponse.data.paymentUrl);
        } else {
          console.log('❌ Ошибка в ответе:', jsonResponse.error || 'Неизвестная ошибка');
        }
      } catch (e) {
        console.log('❌ Ответ не является валидным JSON:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Ошибка запроса:', e.message);
  });

  req.write(data);
  req.end();
}

testFrontendPayment();