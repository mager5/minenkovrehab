// Тест API для проверки работы спиннера
const https = require('https');

async function testAPI() {
  console.log('🔄 Тестирование Railway API...');

  try {
    // Тест health endpoint
    console.log('\n1. Проверка health endpoint...');
    const healthResponse = await fetch(
      'https://minenkovrehab-production-15cc.up.railway.app/health'
    );
    console.log('Health status:', healthResponse.status);
    const healthData = await healthResponse.text();
    console.log('Health response:', healthData);

    // Тест payment API
    console.log('\n2. Проверка payment API...');
    const paymentResponse = await fetch(
      'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000,
          description: 'Тест платежа',
          email: 'test@example.com',
          phone: '+79001234567',
        }),
      }
    );

    console.log('Payment API status:', paymentResponse.status);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('❌ Ошибка API:', errorText);
      return;
    }

    const paymentData = await paymentResponse.json();
    console.log(
      '✅ Payment API response:',
      JSON.stringify(paymentData, null, 2)
    );
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

testAPI();
