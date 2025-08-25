const https = require('https');
const http = require('http');

// Тест локального API с данными экспресс-консультации
const testData = JSON.stringify({
  amount: 1500,
  description: 'Экспресс-консультация невролога',
  invoiceId: 'express-' + Date.now(),
  // Добавляем данные для фискализации
  receipt: {
    sno: 'osn',
    items: [
      {
        name: 'Экспресс-консультация невролога',
        quantity: 1,
        sum: 1500,
        payment_method: 'full_payment',
        payment_object: 'service',
        tax: 'vat20',
      },
    ],
  },
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/robokassa/generate-payment-url',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData),
  },
};

console.log('🚀 Тестирование локального API с фискализацией...');
console.log(
  'URL:',
  `http://${options.hostname}:${options.port}${options.path}`
);
console.log('Data:', JSON.parse(testData));

const req = http.request(options, res => {
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

      if (parsed.success && parsed.paymentUrl) {
        console.log('\n✅ УСПЕХ! Ссылка для оплаты сгенерирована:');
        console.log('🔗', parsed.paymentUrl);

        // Проверяем наличие параметра Receipt в URL
        if (parsed.paymentUrl.includes('Receipt=')) {
          console.log(
            '\n✅ Параметр Receipt найден в URL - фискализация включена!'
          );

          // Извлекаем и декодируем Receipt
          const receiptMatch = parsed.paymentUrl.match(/Receipt=([^&]+)/);
          if (receiptMatch) {
            const encodedReceipt = receiptMatch[1];
            const decodedReceipt = decodeURIComponent(encodedReceipt);
            console.log('\n📋 Декодированный Receipt:');
            console.log(JSON.stringify(JSON.parse(decodedReceipt), null, 2));
          }
        } else {
          console.log('\n❌ Параметр Receipt НЕ найден в URL!');
        }
      }
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
