const axios = require('axios');

// Тестирование генерации ссылки для оплаты абонемента
async function testSubscriptionPayment() {
  try {
    console.log('🧪 Тестирование генерации ссылки оплаты абонемента...');
    
    // Данные для тестового платежа
    const paymentData = {
      amount: 5000, // 5000 рублей за абонемент
      description: 'Абонемент на реабилитацию minenkovrehab.ru',
      email: 'test@example.com',
      phone: '+79001234567'
    };
    
    console.log('📋 Данные платежа:', paymentData);
    
    // URL Railway сервера
    const apiUrl = 'https://minenkovrehab-production-15cc.up.railway.app';
    
    console.log('🌐 Railway API URL:', apiUrl);
    
    // Отправка запроса на генерацию ссылки
    const response = await axios.post(`${apiUrl}/api/robokassa/generate-payment-url`, paymentData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.success) {
      console.log('✅ Ссылка успешно сгенерирована!');
      console.log('💳 Платежная ссылка:', response.data.data.paymentUrl);
      console.log('🆔 ID заказа:', response.data.data.invoiceId);
      console.log('💰 Сумма:', response.data.data.amount, 'руб.');
      console.log('📝 Описание:', response.data.data.description);
      console.log('🧪 Тестовый режим:', response.data.data.testMode);
      
      console.log('\n🔗 ГОТОВАЯ ССЫЛКА ДЛЯ ТЕСТИРОВАНИЯ:');
      console.log(response.data.data.paymentUrl);
      
      // Анализ параметров ссылки
      const url = new URL(response.data.data.paymentUrl);
      console.log('\n📊 Параметры ссылки:');
      for (const [key, value] of url.searchParams) {
        console.log(`  ${key}: ${value}`);
      }
      
    } else {
      console.error('❌ Ошибка генерации ссылки:', response.data.error);
      if (response.data.details) {
        console.error('📋 Детали:', response.data.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка запроса:', error.message);
    if (error.response) {
      console.error('📋 Ответ сервера:', error.response.data);
      console.error('🔢 Статус:', error.response.status);
    }
  }
}

// Запуск теста
testSubscriptionPayment();