const http = require('http');

// Данные для тестирования
const testData = {
  amount: 2950,
  description: 'Новая исправленная ссылка',
  email: 'test@example.com'
};

// Опции для HTTP запроса
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/robokassa/generate-payment-url',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testData))
  }
};

console.log('🧪 ТЕСТИРОВАНИЕ НОВОГО API...');
console.log('=' .repeat(50));

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.success && response.paymentUrl) {
        console.log('✅ УСПЕХ! Новая ссылка сгенерирована:');
        console.log('');
        console.log('🔗 НОВАЯ ССЫЛКА:');
        console.log(response.paymentUrl);
        console.log('');
        
        // Проверяем параметры в ссылке
        const url = new URL(response.paymentUrl);
        console.log('🔍 АНАЛИЗ ПАРАМЕТРОВ:');
        console.log(`- Домен: ${url.hostname}`);
        console.log(`- Culture: ${url.searchParams.get('Culture')}`);
        console.log(`- Locale: ${url.searchParams.get('Locale')}`);
        console.log('');
        
        if (url.hostname === 'auth.robokassa.ru' && 
            url.searchParams.get('Culture') === 'en' && 
            url.searchParams.get('Locale') === 'en') {
          console.log('🎉 ОТЛИЧНО! Ссылка сгенерирована правильно:');
          console.log('✅ Домен: auth.robokassa.ru (НЕ .kz)');
          console.log('✅ Culture: en (НЕ ru)');
          console.log('✅ Locale: en (НЕ ru-RU)');
          console.log('');
          console.log('💡 Эта ссылка НЕ будет редиректить на .kz!');
        } else {
          console.log('❌ Что-то не так с параметрами...');
        }
      } else {
        console.log('❌ Ошибка при генерации ссылки:');
        console.log(response);
      }
    } catch (error) {
      console.log('❌ Ошибка парсинга ответа:');
      console.log('Сырой ответ:', data);
      console.log('Ошибка:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Ошибка запроса:', error.message);
  console.log('💡 Убедитесь, что API сервер запущен на порту 3001');
});

// Отправляем данные
req.write(JSON.stringify(testData));
req.end();