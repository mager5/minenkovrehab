const axios = require('axios');

// Тестирование исправления дублирования для онлайн консультации
async function testOnlineConsultationFix() {
  console.log(
    '🧪 Тестирование исправления дублирования для онлайн консультации...'
  );

  const testData = {
    amount: 5000,
    description: 'Онлайн-консультация',
    email: 'test@example.com',
    phone: '+79123456789',
    isTest: true,
  };

  try {
    const response = await axios.post(
      'http://localhost:3000/api/robokassa/generate-payment-url',
      testData
    );

    if (response.data.success) {
      const paymentUrl = response.data.paymentUrl;
      console.log('✅ Ссылка успешно сгенерирована');

      // Извлекаем параметры из URL
      const url = new URL(paymentUrl);
      const description = url.searchParams.get('Description');
      const receiptParam = url.searchParams.get('Receipt');

      console.log('📋 Description:', description);

      if (receiptParam) {
        try {
          const receipt = JSON.parse(decodeURIComponent(receiptParam));
          const receiptItemName = receipt.items[0].name;

          console.log('🧾 Receipt item name:', receiptItemName);

          // Проверяем, что названия теперь совпадают и используют правильное название услуги
          if (receiptItemName === 'Онлайн-консультация') {
            console.log(
              '✅ ИСПРАВЛЕНО: Название в Receipt использует правильное название услуги'
            );
            console.log(
              '✅ Название в Receipt теперь соответствует логике Description'
            );
          } else {
            console.log(
              '❌ ПРОБЛЕМА: Название в Receipt все еще неправильное:',
              receiptItemName
            );
          }

          console.log('\n📊 Сравнение:');
          console.log('Description:', description);
          console.log('Receipt name:', receiptItemName);
        } catch (parseError) {
          console.error('❌ Ошибка парсинга Receipt:', parseError.message);
        }
      } else {
        console.log('⚠️ Параметр Receipt отсутствует в URL');
      }
    } else {
      console.error('❌ Ошибка генерации ссылки:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Ошибка запроса:', error.message);
  }
}

testOnlineConsultationFix();
