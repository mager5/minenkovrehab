const axios = require('axios');

// Тестирование фискализации для разных типов услуг
async function testServiceFiscalization() {
  const baseURL = 'http://localhost:3002/api/robokassa/generate-payment-url';

  const testCases = [
    {
      name: 'Консультация',
      data: {
        amount: 3000,
        productId: 'consultation',
        email: 'test@example.com',
        phone: '+79001234567',
      },
    },
    {
      name: 'Экспресс онлайн-консультация',
      data: {
        amount: 1500,
        productId: 'express-consultation',
        email: 'test@example.com',
        phone: '+79001234567',
      },
    },
    {
      name: 'Персональная программа',
      data: {
        amount: 5000,
        productId: 'personal-program',
        email: 'test@example.com',
        phone: '+79001234567',
      },
    },
    {
      name: 'Онлайн-тренировка',
      data: {
        amount: 2000,
        productId: 'online-training',
        email: 'test@example.com',
        phone: '+79001234567',
      },
    },
    {
      name: 'Формула Движения - 1-й уровень',
      data: {
        amount: 6000,
        productId: 'formula-movement',
        level: 1,
        email: 'test@example.com',
        phone: '+79001234567',
      },
    },
    {
      name: 'Формула Движения - 2-й уровень',
      data: {
        amount: 8000,
        productId: 'formula-movement',
        level: 2,
        email: 'test@example.com',
        phone: '+79001234567',
      },
    },
  ];

  console.log('🧪 Тестирование фискализации услуг...');
  console.log('='.repeat(60));

  for (const testCase of testCases) {
    try {
      console.log(`\n📋 Тестируем: ${testCase.name}`);
      console.log(`💰 Сумма: ${testCase.data.amount} руб.`);

      const response = await axios.post(baseURL, testCase.data);

      console.log('📡 Ответ сервера:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.paymentUrl) {
        const url = response.data.paymentUrl;

        // Извлекаем параметр Receipt из URL
        const receiptMatch = url.match(/Receipt=([^&]+)/);
        if (receiptMatch) {
          const receiptParam = decodeURIComponent(receiptMatch[1]);
          const receiptData = JSON.parse(receiptParam);

          console.log(
            `✅ Название услуги в чеке: "${receiptData.items[0].name}"`
          );
          console.log(`💵 Цена в чеке: ${receiptData.items[0].sum / 100} руб.`);
        } else {
          console.log('❌ Параметр Receipt не найден в URL');
        }
      } else {
        console.log('❌ Ошибка: не получен paymentUrl');
        console.log('📄 Полный ответ:', response.data);
      }
    } catch (error) {
      console.log(
        `❌ Ошибка при тестировании ${testCase.name}:`,
        error.message
      );
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Тестирование завершено');
}

// Запускаем тест
testServiceFiscalization().catch(console.error);
