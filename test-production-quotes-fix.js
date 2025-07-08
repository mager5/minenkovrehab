const axios = require('axios');

// Тестирование исправления проблемы с кавычками на продакшене
async function testProductionQuotesFix() {
  try {
    console.log('🚀 ТЕСТИРОВАНИЕ ИСПРАВЛЕНИЯ НА ПРОДАКШЕНЕ');
    console.log('=' .repeat(50));
    
    const apiUrl = 'https://minenkovrehab-production-15cc.up.railway.app';
    
    console.log('📡 Отправляем запрос на генерацию платежной ссылки...');
    
    const response = await axios.post(`${apiUrl}/api/robokassa/generate-payment-url`, {
      amount: 2950,
      description: 'Абонемент клуба формула движения',
      email: 'test@example.com'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      const paymentUrl = response.data.data.paymentUrl;
      
      console.log('✅ Платежная ссылка успешно сгенерирована!');
      console.log('🔗 Ссылка:', paymentUrl);
      
      // Проверяем наличие %27 в ссылке
      const has27 = paymentUrl.includes('%27');
      
      console.log(`\n${has27 ? '❌' : '✅'} Проверка %27: ${has27 ? 'НАЙДЕН (проблема не решена)' : 'ОТСУТСТВУЕТ (проблема решена!)'}`);
      
      // Извлекаем параметры из URL
      const url = new URL(paymentUrl);
      const description = url.searchParams.get('Description');
      const isTest = url.searchParams.get('IsTest');
      
      console.log('\n📋 Параметры URL:');
      console.log(`   Description: ${description}`);
      console.log(`   IsTest: ${isTest}`);
      
      // Проверяем корректность IsTest параметра
      const isTestCorrect = isTest === '1';
      console.log(`\n${isTestCorrect ? '✅' : '❌'} IsTest параметр: ${isTestCorrect ? 'КОРРЕКТНЫЙ' : 'НЕКОРРЕКТНЫЙ'}`);
      
      if (!has27 && isTestCorrect) {
        console.log('\n🎉 УСПЕХ! Проблема с кавычками полностью решена!');
        console.log('✅ %27 больше не появляется в ссылках');
        console.log('✅ Все параметры корректны');
      } else {
        console.log('\n⚠️  Проблема еще не полностью решена');
        if (has27) console.log('❌ %27 все еще присутствует');
        if (!isTestCorrect) console.log('❌ IsTest параметр некорректный');
      }
      
    } else {
      console.log('❌ Ошибка генерации ссылки:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    if (error.response) {
      console.error('📄 Ответ сервера:', error.response.data);
    }
  }
}

// Запускаем тест
testProductionQuotesFix();