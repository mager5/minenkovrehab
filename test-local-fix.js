const http = require('http');

// Тестирование исправления проблемы с кавычками на локальном сервере
const testLocalFix = async () => {
  console.log('🔧 Тестирование исправления проблемы с кавычками на локальном API...');
  console.log('=' .repeat(80));

  const testData = {
    amount: 2500,
    description: 'Консультация специалиста',
    phone: '+79123456789'
  };

  try {
    // Тестируем локальный API
    console.log('\n📡 Тестирование локального API...');
    const localUrl = await testLocalAPI(testData);
    
    if (localUrl) {
      console.log('\n✅ Локальный API работает корректно');
      console.log('🔗 Сгенерированная ссылка:', localUrl);
      
      // Проверяем наличие кавычек
      const hasQuotes = localUrl.includes('%27') || localUrl.includes("'");
      
      if (hasQuotes) {
        console.log('\n❌ ПРОБЛЕМА: В ссылке все еще есть кавычки!');
        console.log('🔍 Найденные кавычки:', localUrl.match(/%27|'/g));
        
        // Показываем где именно находятся кавычки
        const parts = localUrl.split('&');
        parts.forEach((part, index) => {
          if (part.includes('%27') || part.includes("'")) {
            console.log(`🎯 Кавычки в параметре ${index + 1}: ${part}`);
          }
        });
      } else {
        console.log('\n✅ ИСПРАВЛЕНО: Кавычки в ссылке отсутствуют!');
      }
      
      // Дополнительная валидация
      validatePaymentUrl(localUrl);
      
      // Тестируем очистку URL
      console.log('\n🧹 Тестирование очистки URL...');
      const cleanedUrl = cleanPaymentUrl(localUrl);
      console.log('🔗 Очищенная ссылка:', cleanedUrl);
      
      const stillHasQuotes = cleanedUrl.includes('%27') || cleanedUrl.includes("'");
      console.log(`${stillHasQuotes ? '❌' : '✅'} Результат очистки: ${stillHasQuotes ? 'Кавычки остались' : 'Кавычки удалены'}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
};

const testLocalAPI = (data) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/payment/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          console.log('📊 Статус ответа:', res.statusCode);
          console.log('📋 Ответ API:', JSON.stringify(response, null, 2));
          
          if (response.success && response.paymentUrl) {
            resolve(response.paymentUrl);
          } else {
            reject(new Error(`API вернул ошибку: ${response.error || 'Неизвестная ошибка'}`));
          }
        } catch (parseError) {
          reject(new Error(`Ошибка парсинга ответа: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Ошибка запроса: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
};

const cleanPaymentUrl = (url) => {
  // Функция очистки URL от кавычек (как в client.tsx)
  return url.replace(/%27/g, '').replace(/'/g, '');
};

const validatePaymentUrl = (url) => {
  console.log('\n🔍 Валидация платежной ссылки...');
  
  const checks = [
    {
      name: 'Отсутствие кавычек (%27)',
      test: !url.includes('%27'),
      details: url.includes('%27') ? 'Найдены символы %27' : 'Кавычки отсутствуют'
    },
    {
      name: 'Отсутствие одинарных кавычек',
      test: !url.includes("'"),
      details: url.includes("'") ? 'Найдены одинарные кавычки' : 'Одинарные кавычки отсутствуют'
    },
    {
      name: 'Домен Robokassa',
      test: url.includes('auth.robokassa.ru'),
      details: url.includes('auth.robokassa.ru') ? 'Корректный домен' : 'Неверный домен'
    },
    {
      name: 'Параметр MerchantLogin',
      test: url.includes('MerchantLogin='),
      details: url.includes('MerchantLogin=') ? 'Присутствует' : 'Отсутствует'
    },
    {
      name: 'Параметр OutSum',
      test: url.includes('OutSum='),
      details: url.includes('OutSum=') ? 'Присутствует' : 'Отсутствует'
    },
    {
      name: 'Параметр SignatureValue',
      test: url.includes('SignatureValue='),
      details: url.includes('SignatureValue=') ? 'Присутствует' : 'Отсутствует'
    },
    {
      name: 'Тестовый режим',
      test: url.includes('IsTest=1'),
      details: url.includes('IsTest=1') ? 'Активен' : 'Неактивен'
    }
  ];
  
  checks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.details}`);
  });
  
  const allPassed = checks.every(check => check.test);
  console.log(`\n${allPassed ? '✅' : '❌'} Общий результат валидации: ${allPassed ? 'ПРОЙДЕНА' : 'ПРОВАЛЕНА'}`);
};

// Запуск тестирования
testLocalFix().then(() => {
  console.log('\n🏁 Тестирование завершено');
}).catch(error => {
  console.error('💥 Критическая ошибка:', error);
});