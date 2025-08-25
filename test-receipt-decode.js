const http = require('http');

// Функция для декодирования URL-encoded строки
function decodeReceiptParameter(url) {
  const receiptMatch = url.match(/Receipt=([^&]+)/);
  if (receiptMatch) {
    const encodedReceipt = receiptMatch[1];
    const decodedReceipt = decodeURIComponent(encodedReceipt);
    return JSON.parse(decodedReceipt);
  }
  return null;
}

// Тестовые данные для экспресс-консультации
const testData = {
  amount: 1500,
  description: 'Экспресс-консультация невролога',
  invoiceId: `express-${Date.now()}`,
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
};

console.log('🧪 Тестирование декодирования параметра Receipt...');
console.log('URL:', 'http://localhost:3002/api/robokassa/generate-payment-url');
console.log('Data:', testData);

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/robokassa/generate-payment-url',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = http.request(options, res => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 Ответ сервера:');
    console.log('Status:', res.statusCode);

    try {
      const response = JSON.parse(data);
      console.log('\n📝 Тело ответа:');
      console.log(JSON.stringify(response, null, 2));

      if (response.success && response.data.paymentUrl) {
        const paymentUrl = response.data.paymentUrl;
        console.log('\n🔍 Анализ параметра Receipt:');

        // Декодируем параметр Receipt
        const decodedReceipt = decodeReceiptParameter(paymentUrl);

        if (decodedReceipt) {
          console.log('✅ Параметр Receipt успешно декодирован:');
          console.log(JSON.stringify(decodedReceipt, null, 2));

          // Проверяем корректность данных
          const item = decodedReceipt.items[0];
          console.log('\n🔍 Проверка корректности данных:');
          console.log(
            '- Название услуги:',
            item.name === testData.description ? '✅' : '❌'
          );
          console.log('- Сумма:', item.sum === testData.amount ? '✅' : '❌');
          console.log('- Количество:', item.quantity === 1 ? '✅' : '❌');
          console.log(
            '- Тип платежа:',
            item.payment_method === 'full_payment' ? '✅' : '❌'
          );
          console.log(
            '- Объект платежа:',
            item.payment_object === 'service' ? '✅' : '❌'
          );
          console.log('- НДС:', item.tax === 'vat20' ? '✅' : '❌');
          console.log('- СНО:', decodedReceipt.sno === 'osn' ? '✅' : '❌');
        } else {
          console.log('❌ Параметр Receipt не найден в URL');
        }
      }
    } catch (error) {
      console.error('❌ Ошибка парсинга ответа:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', error => {
  console.error('❌ Ошибка запроса:', error.message);
});

req.write(postData);
req.end();
