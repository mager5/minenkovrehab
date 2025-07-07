const axios = require('axios');

// Конфигурация
const API_BASE_URL = 'http://localhost:3002';
const TEST_PAYMENT_DATA = {
  amount: 1000,
  email: 'test@example.com',
  phone: '+79123456789',
  description: 'Тестовый платеж для диагностики'
};

async function testPaymentCreation() {
  console.log('🧪 Тестирование создания платежа...');
  console.log('📊 Данные для тестирования:', TEST_PAYMENT_DATA);
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/robokassa/generate-payment-url`,
      TEST_PAYMENT_DATA,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Платеж успешно создан!');
    console.log('📋 Ответ сервера:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.paymentUrl) {
      console.log('🔗 Платежная ссылка:', response.data.data.paymentUrl);
      console.log('🆔 ID заказа:', response.data.data.invoiceId);
      console.log('💰 Сумма:', response.data.data.amount);
      console.log('🧪 Тестовый режим:', response.data.data.testMode);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при создании платежа:');
    
    if (error.response) {
      // Сервер ответил с кодом ошибки
      console.error('📊 Статус ответа:', error.response.status);
      console.error('📋 Данные ошибки:', JSON.stringify(error.response.data, null, 2));
      console.error('📝 Заголовки ответа:', error.response.headers);
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      console.error('📡 Нет ответа от сервера');
      console.error('🔗 URL запроса:', error.config?.url);
      console.error('📊 Данные запроса:', error.config?.data);
      console.error('⏱️ Таймаут:', error.config?.timeout);
    } else {
      // Ошибка при настройке запроса
      console.error('⚙️ Ошибка конфигурации запроса:', error.message);
    }
    
    console.error('🔍 Полная информация об ошибке:', error.code || error.message);
  }
}

// Проверка доступности API
async function checkAPIHealth() {
  console.log('🏥 Проверка состояния API...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    });
    
    console.log('✅ API доступен');
    console.log('📊 Статус:', response.status);
    console.log('📋 Ответ:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API недоступен:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Соединение отклонено - сервер не запущен на порту 3002');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️ Таймаут соединения');
    } else {
      console.error('🔍 Ошибка:', error.message);
    }
    
    return false;
  }
}

// Основная функция
async function main() {
  console.log('🚀 Запуск диагностики создания платежа');
  console.log('=' .repeat(50));
  
  // Проверяем доступность API
  const isAPIHealthy = await checkAPIHealth();
  
  if (!isAPIHealthy) {
    console.log('\n💡 Рекомендации:');
    console.log('1. Убедитесь, что API сервер запущен: npm start');
    console.log('2. Проверьте, что сервер слушает на порту 3002');
    console.log('3. Проверьте логи сервера на наличие ошибок');
    return;
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // Тестируем создание платежа
  await testPaymentCreation();
  
  console.log('\n🏁 Диагностика завершена');
}

// Запуск
main().catch(error => {
  console.error('💥 Критическая ошибка:', error);
  process.exit(1);
});