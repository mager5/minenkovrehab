const axios = require('axios');

// Базовый URL боевого API
const API_BASE_URL =
  'https://minenkovrehab-robokassa-api-production.up.railway.app/api/robokassa';

// Функция для декодирования URL-encoded строки
function decodeReceiptData(encodedReceipt) {
  try {
    const decoded = decodeURIComponent(encodedReceipt);
    const parsed = JSON.parse(decoded);
    return parsed.items[0].name; // Возвращаем название услуги
  } catch (error) {
    return 'Ошибка декодирования';
  }
}

// Функция для тестирования услуги
async function testService(testData, expectedName, testName) {
  console.log(`\n📋 Тестирование: ${testName}`);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/generate-payment-url`,
      testData
    );

    if (response.data.success) {
      console.log(`✅ Платежная ссылка создана успешно`);

      // Извлекаем параметр Receipt из URL
      const url =
        response.data.url ||
        response.data.data?.url ||
        response.data.data?.paymentUrl;

      if (url) {
        const receiptMatch = url.match(/Receipt=([^&]+)/);

        if (receiptMatch) {
          const serviceName = decodeReceiptData(receiptMatch[1]);
          console.log(`🎯 Название услуги в фискализации: "${serviceName}"`);

          if (serviceName === expectedName) {
            console.log(`✅ Фискализация корректна`);
          } else {
            console.log(`❌ Ошибка фискализации`);
            console.log(`   Ожидалось: "${expectedName}"`);
            console.log(`   Получено: "${serviceName}"`);
          }
        } else {
          console.log('❌ Параметр Receipt не найден в URL');
        }
      } else {
        console.log('❌ URL не найден в ответе');
      }
    } else {
      console.log(`❌ Ошибка создания ссылки:`, response.data.message);
    }
  } catch (error) {
    console.log(`❌ Ошибка запроса:`, error.message);
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🚀 Тестирование фискализации всех услуг на боевом сервере\n');

  // Тестируем программу "Формула Движения" - все 4 уровня
  await testService(
    {
      amount: 6000,
      email: 'test@example.com',
      phone: '+79001234567',
      productId: 'formula-movement',
      level: 1,
    },
    "Программа тренировок 'Формула Движения' 1 уровень",
    'Формула Движения - 1 уровень'
  );

  await testService(
    {
      amount: 6000,
      email: 'test@example.com',
      phone: '+79001234567',
      productId: 'formula-movement',
      level: 2,
    },
    "Программа тренировок 'Формула Движения' 2 уровень",
    'Формула Движения - 2 уровень'
  );

  await testService(
    {
      amount: 6000,
      email: 'test@example.com',
      phone: '+79001234567',
      productId: 'formula-movement',
      level: 3,
    },
    "Программа тренировок 'Формула Движения' 3 уровень",
    'Формула Движения - 3 уровень'
  );

  await testService(
    {
      amount: 6000,
      email: 'test@example.com',
      phone: '+79001234567',
      productId: 'formula-movement',
      level: 4,
    },
    "Программа тренировок 'Формула Движения' 4 уровень",
    'Формула Движения - 4 уровень'
  );

  // Тестируем онлайн-консультацию
  await testService(
    {
      amount: 7000,
      email: 'test@example.com',
      phone: '+79001234567',
      productId: 'consultation',
    },
    'Онлайн-консультация',
    'Онлайн-консультация'
  );

  // Тестируем неизвестный продукт (должен использовать запасной вариант)
  await testService(
    {
      amount: 5000,
      email: 'test@example.com',
      phone: '+79001234567',
      productId: 'unknown-product',
    },
    'Услуга реабилитации',
    'Неизвестный продукт (запасной вариант)'
  );

  console.log('\n🏁 Тестирование завершено');
}

// Запускаем тесты
runTests().catch(console.error);
