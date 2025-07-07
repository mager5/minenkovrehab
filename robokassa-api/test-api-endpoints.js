const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Тестовые данные - используем те же параметры, что подтвердила Robokassa
const testData = {
  amount: 100.00,
  description: 'Тестовый платеж',
  invoiceId: '12345', // Используем тот же ID, что в подтвержденной ссылке
  email: 'test@example.com'
};

// Подтвержденная Robokassa ссылка для сравнения
const CONFIRMED_LINK = 'https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=100.00&invoiceID=12345&SignatureValue=5721aa1dfd7076b556a6bc43cecc65c3&IsTest=1';
const CONFIRMED_SIGNATURE = '5721aa1dfd7076b556a6bc43cecc65c3';
const SIGNATURE_STRING = 'Minenkov-2:100.00:12345:Eld5Xljk2GBN4D6TJo3N';

console.log('🧪 Тестирование API эндпоинтов Robokassa');
console.log('=' .repeat(50));

async function testEndpoints() {
  try {
    console.log('\n🔍 Проверка подтвержденных Robokassa данных:');
    console.log('📝 Строка для подписи:', SIGNATURE_STRING);
    console.log('🔐 Ожидаемая подпись:', CONFIRMED_SIGNATURE);
    console.log('🔗 Подтвержденная ссылка:', CONFIRMED_LINK);
    
    // 0. Проверка соединения с сервером
    console.log('\n0️⃣ Проверка соединения с сервером...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      console.log('✅ Соединение с сервером установлено');
      console.log('💚 Статус сервера:', JSON.stringify(healthResponse.data, null, 2));
    } catch (healthError) {
      console.error('❌ Не удается подключиться к серверу:', healthError.message);
      if (healthError.code === 'ECONNREFUSED') {
        console.error('🔌 Сервер не запущен или недоступен на порту 3001');
      }
      return;
    }

    // 1. Тест создания платежа
    console.log('\n1️⃣ Тестирование создания платежа...');
    try {
      const paymentResponse = await axios.post(`${BASE_URL}/api/payment/create`, testData, { timeout: 10000 });
      console.log('✅ Платеж создан успешно');
      console.log('📄 Данные платежа:', JSON.stringify(paymentResponse.data, null, 2));
    } catch (paymentError) {
      console.error('❌ Ошибка создания платежа:', paymentError.message);
      if (paymentError.response) {
        console.error('📄 Детали ошибки:', JSON.stringify(paymentError.response.data, null, 2));
        console.error('🔢 Статус код:', paymentError.response.status);
      }
      throw paymentError;
    }
    
    // 2. Тест получения ссылки на оплату
    console.log('\n2️⃣ Тестирование получения ссылки на оплату...');
    try {
      const linkResponse = await axios.post(`${BASE_URL}/api/payment/link`, testData, { timeout: 10000 });
      console.log('✅ Ссылка получена успешно');
      console.log('🔗 Ссылка на оплату:', linkResponse.data.paymentUrl);
      
      // Проверка соответствия с подтвержденными данными
      if (linkResponse.data.paymentUrl && linkResponse.data.paymentUrl.includes(CONFIRMED_SIGNATURE)) {
        console.log('🎯 ОТЛИЧНО! Наша подпись совпадает с подтвержденной Robokassa');
      } else {
        console.log('⚠️ Подпись отличается от подтвержденной Robokassa');
      }
    } catch (linkError) {
      console.error('❌ Ошибка получения ссылки:', linkError.message);
      if (linkError.response) {
        console.error('📄 Детали ошибки:', JSON.stringify(linkError.response.data, null, 2));
        console.error('🔢 Статус код:', linkError.response.status);
      }
    }
    
    // 3. Тест проверки статуса
    console.log('\n3️⃣ Тестирование проверки статуса...');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/api/payment/status/${testData.invoiceId}`, { timeout: 10000 });
      console.log('✅ Статус получен успешно');
      console.log('📊 Статус платежа:', JSON.stringify(statusResponse.data, null, 2));
    } catch (statusError) {
      console.error('❌ Ошибка получения статуса:', statusError.message);
      if (statusError.response) {
        console.error('📄 Детали ошибки:', JSON.stringify(statusError.response.data, null, 2));
        console.error('🔢 Статус код:', statusError.response.status);
      }
    }
    
    console.log('\n🎉 Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Критическая ошибка при тестировании:', error.message);
    if (error.response) {
      console.error('📄 Детали ошибки:', JSON.stringify(error.response.data, null, 2));
      console.error('🔢 Статус код:', error.response.status);
    }
    if (error.code) {
      console.error('🔧 Код ошибки:', error.code);
    }
    console.error('📚 Полная ошибка:', error);
  }
}

// Запуск тестов
testEndpoints();