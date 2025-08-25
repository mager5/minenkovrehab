const axios = require('axios');

// Тестовые данные для разных услуг
const testServices = [
  {
    name: 'Онлайн-консультация',
    productId: 'consultation',
    amount: 5000,
    level: undefined, // Уровень не нужен для консультации
  },
  {
    name: 'Экспресс онлайн-консультация',
    productId: 'express-consultation',
    amount: 3000,
    level: undefined,
  },
  {
    name: 'Персональная программа',
    productId: 'personal-program',
    amount: 10000,
    level: undefined,
  },
  {
    name: 'Онлайн тренировки',
    productId: 'online-training',
    amount: 5000,
    level: undefined,
  },
  {
    name: 'Формула Движения - 1-й уровень',
    productId: 'formula-dvizheniya',
    amount: 6000,
    level: '1',
  },
  {
    name: 'Формула Движения - 2-й уровень',
    productId: 'formula-dvizheniya',
    amount: 6000,
    level: '2',
  },
  {
    name: 'Формула Движения - 3-й уровень',
    productId: 'formula-dvizheniya',
    amount: 6000,
    level: '3',
  },
  {
    name: 'Формула Движения - 4-й уровень',
    productId: 'formula-dvizheniya',
    amount: 6000,
    level: '4',
  },
];

async function testServiceFiscalization(service) {
  console.log(`\n🧪 Тестирование: ${service.name}`);
  console.log('='.repeat(50));

  try {
    const requestData = {
      amount: service.amount,
      productId: service.productId,
      email: 'test@example.com',
      phone: '+79001234567',
    };

    // Добавляем level только если он определен
    if (service.level !== undefined) {
      requestData.level = service.level;
    }

    console.log('📤 Отправляемые данные:', requestData);

    const response = await axios.post(
      'http://localhost:3002/api/robokassa/generate-payment-url',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      console.log('✅ Успешно создана платежная ссылка');
      console.log('🔗 URL:', response.data.data.paymentUrl);

      // Декодируем Receipt параметр для проверки названия услуги
      const url = new URL(response.data.data.paymentUrl);
      const receiptParam = url.searchParams.get('Receipt');

      if (receiptParam) {
        try {
          const decodedReceipt = JSON.parse(decodeURIComponent(receiptParam));
          const serviceName = decodedReceipt.items[0].name;
          console.log('📄 Название услуги в фискализации:', serviceName);

          // Проверяем правильность названия
          const expectedNames = {
            consultation: 'Консультация невролога',
            'express-consultation': 'Экспресс консультация невролога',
            'personal-program': 'Персональная программа реабилитации',
            'online-training': 'Онлайн тренировки',
            'formula-dvizheniya': {
              1: 'Формула Движения - 1-й уровень',
              2: 'Формула Движения - 2-й уровень',
              3: 'Формула Движения - 3-й уровень',
              4: 'Формула Движения - 4-й уровень',
            },
          };

          let expectedName;
          if (service.productId === 'formula-dvizheniya') {
            expectedName = expectedNames[service.productId][service.level];
          } else {
            expectedName = expectedNames[service.productId];
          }

          if (serviceName === expectedName) {
            console.log('✅ Название услуги ПРАВИЛЬНОЕ!');
          } else {
            console.log('❌ Название услуги НЕПРАВИЛЬНОЕ!');
            console.log('🎯 Ожидалось:', expectedName);
            console.log('📝 Получено:', serviceName);
          }
        } catch (e) {
          console.log('❌ Ошибка декодирования Receipt:', e.message);
        }
      } else {
        console.log('⚠️ Receipt параметр не найден в URL');
      }
    } else {
      console.log('❌ Ошибка создания платежной ссылки:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.message);
    if (error.response) {
      console.log('📄 Ответ сервера:', error.response.data);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Запуск тестирования фискализации для всех услуг');
  console.log('='.repeat(60));

  for (const service of testServices) {
    await testServiceFiscalization(service);
    // Небольшая пауза между тестами
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🏁 Тестирование завершено!');
}

// Запускаем тесты
runAllTests().catch(console.error);
