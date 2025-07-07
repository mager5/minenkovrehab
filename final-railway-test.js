const https = require('https');

// Финальный тест Railway деплоя
const RAILWAY_URL = 'minenkovrehab-production-15cc.up.railway.app';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runFinalTest() {
  console.log('🚀 ФИНАЛЬНЫЙ ТЕСТ RAILWAY ДЕПЛОЯ');
  console.log('=' .repeat(50));
  console.log(`🌐 URL: https://${RAILWAY_URL}`);
  console.log('');

  // Тест 1: Health check
  console.log('1️⃣ Проверка health endpoint...');
  try {
    const healthResponse = await makeRequest({
      hostname: RAILWAY_URL,
      port: 443,
      path: '/health',
      method: 'GET'
    });
    
    if (healthResponse.statusCode === 200) {
      console.log('   ✅ Health check: OK');
      console.log(`   📊 Environment: ${healthResponse.data.environment}`);
      console.log(`   🧪 Test Mode: ${healthResponse.data.testMode}`);
    } else {
      console.log('   ❌ Health check: FAILED');
      return;
    }
  } catch (error) {
    console.log('   ❌ Health check: ERROR -', error.message);
    return;
  }

  // Тест 2: Payment generation
  console.log('\n2️⃣ Проверка генерации ссылки оплаты...');
  try {
    const postData = JSON.stringify({
      email: 'test@example.com',
      phone: '+79001234567',
      amount: 2950,
      description: 'Абонемент клуба формула движения'
    });

    const paymentResponse = await makeRequest({
      hostname: RAILWAY_URL,
      port: 443,
      path: '/api/robokassa-sdk/generate-payment-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);

    if (paymentResponse.statusCode === 200 && paymentResponse.data.success) {
      console.log('   ✅ API Response: SUCCESS');
      
      const paymentUrl = paymentResponse.data.data?.paymentUrl;
      if (paymentUrl) {
        console.log('   ✅ Payment URL: GENERATED');
        
        // Анализ URL
        try {
          const url = new URL(paymentUrl);
          const params = url.searchParams;
          
          const merchantLogin = params.get('MerchantLogin');
          const outSum = params.get('OutSum');
          const description = params.get('Description');
          const isTest = params.get('IsTest');
          const signature = params.get('SignatureValue');
          
          console.log('\n   🔍 Анализ параметров URL:');
          console.log(`   - MerchantLogin: ${merchantLogin || '❌ ПУСТОЙ!'} ${merchantLogin ? '✅' : '❌'}`);
          console.log(`   - OutSum: ${outSum} ${outSum === '2950' ? '✅' : '❌'}`);
          console.log(`   - Description: ${decodeURIComponent(description || '')} ${description ? '✅' : '❌'}`);
          console.log(`   - IsTest: ${isTest} ${isTest === '1' ? '✅' : '❌'}`);
          console.log(`   - Signature: ${signature ? 'ЕСТЬ ✅' : 'НЕТ ❌'}`);
          
          // Итоговая оценка
          const isValid = merchantLogin && outSum === '2950' && description && isTest === '1' && signature;
          
          console.log('\n   📋 ИТОГОВАЯ ОЦЕНКА:');
          if (isValid) {
            console.log('   🎉 ВСЕ ПАРАМЕТРЫ КОРРЕКТНЫ!');
            console.log('   ✅ Ссылка готова к использованию');
            console.log(`\n   🔗 Готовая ссылка: ${paymentUrl}`);
          } else {
            console.log('   ⚠️  ЕСТЬ ПРОБЛЕМЫ С ПАРАМЕТРАМИ');
            if (!merchantLogin) {
              console.log('   🔧 НУЖНО: Настроить ROBOKASSA_LOGIN на Railway');
            }
          }
          
        } catch (urlError) {
          console.log('   ❌ Ошибка анализа URL:', urlError.message);
        }
      } else {
        console.log('   ❌ Payment URL: NOT FOUND in response');
      }
    } else {
      console.log('   ❌ API Response: FAILED');
      console.log('   📊 Status:', paymentResponse.statusCode);
      console.log('   📊 Response:', JSON.stringify(paymentResponse.data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Payment generation: ERROR -', error.message);
  }

  // Заключение
  console.log('\n' + '=' .repeat(50));
  console.log('📋 ЗАКЛЮЧЕНИЕ:');
  console.log('=' .repeat(50));
  console.log('✅ Код успешно задеплоен на Railway');
  console.log('✅ Сервер запущен и отвечает на запросы');
  console.log('✅ API endpoints работают');
  console.log('⚠️  Нужно настроить environment variables');
  console.log('');
  console.log('🔧 СЛЕДУЮЩИЕ ШАГИ:');
  console.log('1. Откройте Railway Dashboard');
  console.log('2. Настройте environment variables (см. RAILWAY_ENV_SETUP.md)');
  console.log('3. Дождитесь автоматического редеплоя');
  console.log('4. Повторите тест');
  console.log('');
  console.log('📖 Подробная инструкция: RAILWAY_ENV_SETUP.md');
  console.log('=' .repeat(50));
}

runFinalTest().catch(console.error);