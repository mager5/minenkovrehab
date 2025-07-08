const axios = require('axios');

// Конфигурация для тестирования Railway API
// ИСПРАВЛЕНО: Используем правильный URL Railway проекта
const RAILWAY_API_URL = 'https://minenkovrehab-production-15cc.up.railway.app';

// Тестовые данные для создания платежной ссылки
const testPaymentData = {
  amount: 1000,
  description: 'Тестовый платеж для проверки Railway API',
  invoiceId: Date.now().toString(),
  email: 'test@example.com'
};

async function testRailwayPaymentLink() {
  console.log('🚀 Тестирование генерации платежной ссылки через Railway API...');
  console.log('URL:', RAILWAY_API_URL);
  console.log('Данные платежа:', testPaymentData);
  console.log('\n' + '='.repeat(60));

  try {
    // Отправляем запрос на создание платежной ссылки
    const response = await axios.post(`${RAILWAY_API_URL}/api/payment/create`, testPaymentData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Успешный ответ от Railway API');
    console.log('Статус:', response.status);
    console.log('Данные ответа:', JSON.stringify(response.data, null, 2));
    
    // Проверяем наличие платежной ссылки
    if (response.data && response.data.paymentUrl) {
      const paymentUrl = response.data.paymentUrl;
      console.log('\n🔗 Полученная платежная ссылка:');
      console.log(paymentUrl);
      
      // Проверяем на наличие лишних символов
      console.log('\n🔍 Проверка на лишние символы:');
      
      // Проверка на кавычки
      const hasQuotes = paymentUrl.includes('"') || paymentUrl.includes("'");
      console.log('- Кавычки:', hasQuotes ? '❌ НАЙДЕНЫ' : '✅ НЕТ');
      
      // Проверка на правильный домен
      const hasRobokassaDomain = paymentUrl.includes('auth.robokassa.ru');
      console.log('- Домен Robokassa:', hasRobokassaDomain ? '✅ КОРРЕКТНЫЙ' : '❌ НЕВЕРНЫЙ');
      
      // Проверка на обязательные параметры
      const hasRequiredParams = [
        'MerchantLogin=',
        'OutSum=',
        'SignatureValue='
      ].every(param => paymentUrl.includes(param));
      console.log('- Обязательные параметры:', hasRequiredParams ? '✅ ПРИСУТСТВУЮТ' : '❌ ОТСУТСТВУЮТ');
      
      // Проверка на тестовый режим
      const isTestMode = paymentUrl.includes('IsTest=1');
      console.log('- Тестовый режим:', isTestMode ? '✅ ВКЛЮЧЕН' : '⚠️ ВЫКЛЮЧЕН');
      
      // Общий результат
      const isValid = !hasQuotes && hasRobokassaDomain && hasRequiredParams;
      console.log('\n📊 ОБЩИЙ РЕЗУЛЬТАТ:', isValid ? '✅ ССЫЛКА КОРРЕКТНА' : '❌ ССЫЛКА СОДЕРЖИТ ОШИБКИ');
      
      if (hasQuotes) {
        console.log('\n⚠️ ВНИМАНИЕ: Обнаружены кавычки в URL! Это может вызвать проблемы при переходе.');
      }
      
    } else {
      console.log('❌ Платежная ссылка не найдена в ответе');
    }
    
  } catch (error) {
    console.log('❌ Ошибка при тестировании Railway API:');
    
    if (error.response) {
      console.log('Статус ошибки:', error.response.status);
      console.log('Данные ошибки:', error.response.data);
    } else if (error.request) {
      console.log('Ошибка сети:', error.message);
    } else {
      console.log('Общая ошибка:', error.message);
    }
  }
}

// Запускаем тест
testRailwayPaymentLink().catch(console.error);