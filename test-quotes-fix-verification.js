const axios = require('axios');

// Тестирование исправления проблемы с кавычками
async function testQuotesFix() {
  try {
    console.log('🧪 Тестирование исправления проблемы с кавычками...');
    
    // Данные для тестового платежа с кавычками в описании
    const paymentData = {
      amount: 2950,
      description: 'Абонемент клуба формула движения', // Строка с кавычками
      email: 'test@example.com'
    };
    
    console.log('📋 Исходные данные:', paymentData);
    
    // URL Railway сервера
    const apiUrl = 'https://minenkovrehab-production-15cc.up.railway.app';
    
    const response = await axios.post(`${apiUrl}/api/robokassa/generate-payment-url`, paymentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      const paymentUrl = response.data.data.paymentUrl;
      console.log('✅ Платежная ссылка сгенерирована:');
      console.log(paymentUrl);
      
      // Проверяем наличие %27 в ссылке
      if (paymentUrl.includes('%27')) {
        console.log('❌ ПРОБЛЕМА НЕ РЕШЕНА: В ссылке все еще есть %27');
        console.log('🔍 Позиции %27 в ссылке:', paymentUrl.split('%27'));
      } else {
        console.log('✅ ПРОБЛЕМА РЕШЕНА: %27 отсутствует в ссылке');
      }
      
      // Проверяем параметр Description
      const url = new URL(paymentUrl);
      const description = url.searchParams.get('Description');
      console.log('📝 Параметр Description:', description);
      
      // Анализируем все параметры
      console.log('\n📊 Анализ параметров ссылки:');
      url.searchParams.forEach((value, key) => {
        console.log(`${key}: ${value}`);
        if (value.includes('%27')) {
          console.log(`❌ Параметр ${key} содержит %27`);
        }
      });
      
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
testQuotesFix();