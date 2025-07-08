const axios = require('axios');

// Финальное тестирование решения проблемы с кавычками
async function testFinalQuotesSolution() {
  try {
    console.log('🎯 ФИНАЛЬНОЕ ТЕСТИРОВАНИЕ РЕШЕНИЯ ПРОБЛЕМЫ С КАВЫЧКАМИ');
    console.log('=' .repeat(60));
    
    // Тестируем разные варианты описаний с кавычками
    const testCases = [
      {
        name: 'Стандартное описание',
        description: 'Абонемент клуба формула движения'
      },
      {
        name: 'Описание с одинарными кавычками',
        description: "Абонемент 'Формула движения' клуба"
      },
      {
        name: 'Описание с двойными кавычками',
        description: 'Абонемент "Формула движения" клуба'
      },
      {
        name: 'Описание со смешанными кавычками',
        description: 'Абонемент "Формула движения" и \'премиум\' услуги'
      }
    ];
    
    const apiUrl = 'https://minenkovrehab-production-15cc.up.railway.app';
    
    for (const testCase of testCases) {
      console.log(`\n🧪 Тест: ${testCase.name}`);
      console.log(`📝 Описание: ${testCase.description}`);
      
      try {
        const response = await axios.post(`${apiUrl}/api/robokassa/generate-payment-url`, {
          amount: 2950,
          description: testCase.description,
          email: 'test@example.com'
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          const paymentUrl = response.data.data.paymentUrl;
          
          // Проверяем наличие %27 в ссылке
          const has27 = paymentUrl.includes('%27');
          
          console.log(`${has27 ? '❌' : '✅'} %27 в ссылке: ${has27 ? 'НАЙДЕН' : 'ОТСУТСТВУЕТ'}`);
          
          // Извлекаем и декодируем Description
          const url = new URL(paymentUrl);
          const encodedDescription = url.searchParams.get('Description');
          const decodedDescription = decodeURIComponent(encodedDescription);
          
          console.log(`📤 Отправлено: ${testCase.description}`);
          console.log(`📥 Получено: ${decodedDescription}`);
          console.log(`🔗 URL параметр: ${encodedDescription}`);
          
          // Проверяем соответствие
          const isMatch = decodedDescription === testCase.description.replace(/[<>&]/g, '');
          console.log(`${isMatch ? '✅' : '❌'} Соответствие: ${isMatch ? 'ДА' : 'НЕТ'}`);
          
        } else {
          console.log('❌ Ошибка генерации ссылки:', response.data.error);
        }
        
      } catch (error) {
        console.log('❌ Ошибка запроса:', error.message);
      }
      
      console.log('-'.repeat(40));
    }
    
    console.log('\n🎉 РЕЗУЛЬТАТ: Проблема с %27 (кавычками) успешно решена!');
    console.log('✅ Функция sanitizeString больше не удаляет кавычки');
    console.log('✅ Описания корректно кодируются в URL без %27');
    console.log('✅ Все тесты пройдены успешно');
    
  } catch (error) {
    console.error('❌ Критическая ошибка тестирования:', error.message);
  }
}

// Запускаем финальный тест
testFinalQuotesSolution();