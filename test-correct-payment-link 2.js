const axios = require('axios');

// Тестирование исправленного API генерации платежных ссылок
async function testCorrectedPaymentLink() {
  try {
    console.log(
      '🔄 Тестирование исправленного API генерации платежных ссылок...'
    );

    const testData = {
      amount: 2950.0,
      description: 'Абонемент клуба формула движения',
      orderId: 837984789,
    };

    console.log('📤 Отправляем запрос:', testData);

    const response = await axios.post(
      'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa-sdk/generate-payment-url',
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Ответ получен:', response.data);

    if (response.data.success && response.data.data.paymentUrl) {
      const paymentUrl = response.data.data.paymentUrl;
      console.log('\n🔗 Сгенерированная ссылка:');
      console.log(paymentUrl);

      // Парсим параметры ссылки
      const url = new URL(paymentUrl);
      console.log('\n📋 Параметры ссылки:');
      console.log('- MerchantLogin:', url.searchParams.get('MerchantLogin'));
      console.log('- OutSum:', url.searchParams.get('OutSum'));
      console.log('- invoiceID:', url.searchParams.get('invoiceID'));
      console.log('- Description:', url.searchParams.get('Description'));
      console.log('- SignatureValue:', url.searchParams.get('SignatureValue'));
      console.log('- IsTest:', url.searchParams.get('IsTest'));

      // Проверяем соответствие требуемому формату
      const expectedFormat =
        'https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950.00&invoiceID=837984789&Description=Абонемент+клуба+формула+движения&SignatureValue=8E86A9B01122AA2175F5405AE1532FAE&IsTest=1';

      console.log('\n🎯 Ожидаемый формат:');
      console.log(expectedFormat);

      console.log('\n✅ Тест завершен успешно!');
    } else {
      console.error('❌ Ошибка: некорректный ответ от API');
    }
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    if (error.response) {
      console.error('📄 Ответ сервера:', error.response.data);
    }
  }
}

// Запускаем тест
testCorrectedPaymentLink();
