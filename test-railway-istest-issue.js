const https = require('https');

// Тестируем Railway API на предмет проблемы с %27
console.log('🚂 Тестирование Railway API на проблему с %27');
console.log('=' .repeat(60));

function testRailwayAPI() {
  const data = JSON.stringify({
    amount: 2950,
    description: 'Test payment',
    email: 'test@example.com'
  });

  const options = {
    hostname: 'minenkovrehab-production-15cc.up.railway.app',
    port: 443,
    path: '/api/robokassa/generate-payment-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  console.log('📡 Отправляем запрос к Railway API...');
  console.log('🌐 URL:', `https://${options.hostname}${options.path}`);
  console.log('📋 Данные:', data);

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`\n📊 Статус ответа: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          console.log('\n📦 Сырой ответ:');
          console.log(responseData);
          
          const jsonResponse = JSON.parse(responseData);
          
          console.log('\n🔍 Анализ ответа:');
          console.log('Success:', jsonResponse.success);
          
          if (jsonResponse.success && jsonResponse.data && jsonResponse.data.paymentUrl) {
            const paymentUrl = jsonResponse.data.paymentUrl;
            console.log('\n🔗 Полученная ссылка:');
            console.log(paymentUrl);
            
            // Проверяем наличие %27
            const hasPercent27 = paymentUrl.includes('%27');
            console.log('\n🔍 Проверка на %27:');
            console.log('Содержит %27:', hasPercent27);
            
            if (hasPercent27) {
              console.log('❌ НАЙДЕНА ПРОБЛЕМА: ссылка содержит %27');
              const index = paymentUrl.indexOf('%27');
              console.log('Позиция %27:', index);
              console.log('Контекст:', paymentUrl.substring(Math.max(0, index - 20), index + 10));
              
              // Анализируем что находится перед %27
              const beforePercent27 = paymentUrl.substring(Math.max(0, index - 10), index);
              console.log('Что перед %27:', JSON.stringify(beforePercent27));
            } else {
              console.log('✅ Ссылка корректна, %27 не найдено');
            }
            
            // Парсим URL для детального анализа
            try {
              const url = new URL(paymentUrl);
              console.log('\n📋 Параметры URL:');
              for (const [key, value] of url.searchParams.entries()) {
                console.log(`${key}: ${value}`);
                if (value.includes("'")) {
                  console.log(`❌ НАЙДЕНА КАВЫЧКА в параметре ${key}: ${JSON.stringify(value)}`);
                }
              }
            } catch (urlError) {
              console.log('❌ Ошибка парсинга URL:', urlError.message);
            }
            
          } else {
            console.log('❌ Ошибка в ответе API:', jsonResponse.error || 'Неизвестная ошибка');
          }
          
          resolve(jsonResponse);
          
        } catch (parseError) {
          console.error('❌ Ошибка парсинга JSON:', parseError.message);
          console.error('Сырой ответ:', responseData);
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Запускаем тест
if (require.main === module) {
  testRailwayAPI()
    .then(() => {
      console.log('\n✅ Тест завершен');
    })
    .catch((error) => {
      console.error('\n❌ Тест завершился с ошибкой:', error.message);
    });
}

module.exports = { testRailwayAPI };