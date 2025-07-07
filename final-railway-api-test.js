const https = require('https');

/**
 * Финальный тест Railway API для генерации платежных ссылок Robokassa
 * Проверяет, что API корректно работает и возвращает правильные ссылки
 */
async function testRailwayAPI() {
  console.log('🚂 ФИНАЛЬНЫЙ ТЕСТ RAILWAY API ROBOKASSA');
  console.log('=' .repeat(60));
  
  const testData = {
    amount: 2950,
    description: 'Абонемент клуба формула движения',
    email: 'test@example.com',
    phone: '+79001234567'
  };
  
  console.log('📋 Тестовые данные:', testData);
  console.log('\n🔄 Отправляем запрос на Railway API...');
  
  try {
    const result = await makeAPIRequest(testData);
    
    if (result.success && result.data && result.data.paymentUrl) {
      console.log('\n✅ ТЕСТ ПРОЙДЕН УСПЕШНО!');
      console.log('🔗 Сгенерированная ссылка:', result.data.paymentUrl);
      console.log('🆔 ID заказа:', result.data.invoiceId);
      console.log('💰 Сумма:', result.data.amount, 'руб.');
      console.log('🧪 Тестовый режим:', result.data.testMode ? 'ДА' : 'НЕТ');
      
      // Проверяем, что ссылка содержит правильные параметры
      const url = new URL(result.data.paymentUrl);
      const params = url.searchParams;
      
      console.log('\n🔍 ПРОВЕРКА ПАРАМЕТРОВ ССЫЛКИ:');
      console.log('✅ MerchantLogin:', params.get('MerchantLogin') || 'ОТСУТСТВУЕТ');
      console.log('✅ OutSum:', params.get('OutSum') || 'ОТСУТСТВУЕТ');
      console.log('✅ InvId:', params.get('InvId') || 'ОТСУТСТВУЕТ');
      console.log('✅ SignatureValue:', params.get('SignatureValue') ? 'ПРИСУТСТВУЕТ' : 'ОТСУТСТВУЕТ');
      console.log('✅ IsTest:', params.get('IsTest') || 'ОТСУТСТВУЕТ');
      
      // Проверяем критические параметры
      const merchantLogin = params.get('MerchantLogin');
      const outSum = params.get('OutSum');
      const signature = params.get('SignatureValue');
      
      if (!merchantLogin) {
        console.log('❌ ОШИБКА: MerchantLogin отсутствует!');
        return false;
      }
      
      if (!outSum) {
        console.log('❌ ОШИБКА: OutSum отсутствует!');
        return false;
      }
      
      if (!signature) {
        console.log('❌ ОШИБКА: SignatureValue отсутствует!');
        return false;
      }
      
      console.log('\n🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!');
      console.log('🚀 Railway API работает корректно и готов к использованию!');
      
      return true;
      
    } else {
      console.log('❌ ТЕСТ НЕ ПРОЙДЕН!');
      console.log('Ответ API:', result);
      return false;
    }
    
  } catch (error) {
    console.log('❌ ОШИБКА ТЕСТА:', error.message);
    return false;
  }
}

/**
 * Выполняет HTTP запрос к Railway API
 */
function makeAPIRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'minenkovrehab-production-15cc.up.railway.app',
      port: 443,
      path: '/api/robokassa/generate-payment-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData, 'utf8')
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve(jsonResponse);
        } catch (e) {
          reject(new Error('Ошибка парсинга JSON: ' + e.message));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(new Error('Ошибка запроса: ' + e.message));
    });
    
    req.write(postData);
    req.end();
  });
}

// Запускаем тест
if (require.main === module) {
  testRailwayAPI().then(success => {
    console.log('\n' + '=' .repeat(60));
    if (success) {
      console.log('🎯 РЕЗУЛЬТАТ: RAILWAY API ПОЛНОСТЬЮ ИСПРАВЛЕН И РАБОТАЕТ!');
      process.exit(0);
    } else {
      console.log('💥 РЕЗУЛЬТАТ: ТРЕБУЕТСЯ ДОПОЛНИТЕЛЬНАЯ ДИАГНОСТИКА');
      process.exit(1);
    }
  });
}

module.exports = { testRailwayAPI };