const axios = require('axios');

// Тестирование генерации ссылки с параметрами из PaymentModal
async function testCurrentPaymentModal() {
  try {
    console.log('🧪 Тестирование генерации ссылки с параметрами PaymentModal...');
    
    // Данные из PaymentModal (строки 66-67)
    const paymentData = {
      amount: 2950, // Стоимость абонемента из PaymentModal
      description: 'Оплата абонемента minenkovrehab.ru', // Описание из PaymentModal
      email: 'test@example.com',
      phone: '+79001234567'
    };
    
    console.log('📋 Данные платежа из PaymentModal:', paymentData);
    
    // URL Railway API (тот же, что в PaymentModal)
    const apiUrl = 'https://minenkovrehab-production-15cc.up.railway.app';
    
    console.log('🌐 Railway API URL:', apiUrl);
    
    const response = await axios.post(
      `${apiUrl}/api/robokassa/generate-payment-url`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Ответ API:', response.data);
    
    if (response.data.success && response.data.data?.paymentUrl) {
      const generatedUrl = response.data.data.paymentUrl;
      console.log('\n🔗 Сгенерированная ссылка:');
      console.log(generatedUrl);
      
      // Требуемая ссылка от пользователя
      const requiredUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950.00&invoiceID=837984789&Description=Абонемент+клуба+формула+движения&SignatureValue=8E86A9B01122AA2175F5405AE1532FAE&IsTest=1';
      
      console.log('\n🎯 Требуемая ссылка:');
      console.log(requiredUrl);
      
      // Сравнение параметров
      console.log('\n🔍 Анализ различий:');
      
      const generatedParams = new URLSearchParams(generatedUrl.split('?')[1]);
      const requiredParams = new URLSearchParams(requiredUrl.split('?')[1]);
      
      console.log('\n📊 Сгенерированные параметры:');
      for (const [key, value] of generatedParams) {
        console.log(`  ${key}: ${value}`);
      }
      
      console.log('\n📊 Требуемые параметры:');
      for (const [key, value] of requiredParams) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Проверка различий
      console.log('\n⚠️ Различия:');
      
      // Проверка суммы
      const generatedAmount = generatedParams.get('OutSum');
      const requiredAmount = requiredParams.get('OutSum');
      if (generatedAmount !== requiredAmount) {
        console.log(`  💰 Сумма: сгенерировано ${generatedAmount}, требуется ${requiredAmount}`);
      }
      
      // Проверка описания
      const generatedDesc = decodeURIComponent(generatedParams.get('Description') || '');
      const requiredDesc = decodeURIComponent(requiredParams.get('Description') || '').replace(/\+/g, ' ');
      if (generatedDesc !== requiredDesc) {
        console.log(`  📝 Описание: сгенерировано "${generatedDesc}", требуется "${requiredDesc}"`);
      }
      
      // Проверка InvoiceID
      const generatedInvId = generatedParams.get('InvoiceID') || generatedParams.get('invoiceID');
      const requiredInvId = requiredParams.get('invoiceID');
      console.log(`  🔢 InvoiceID: сгенерировано ${generatedInvId}, требуется ${requiredInvId}`);
      
    } else {
      console.error('❌ Ошибка:', response.data.error || 'Неизвестная ошибка');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    if (error.response) {
      console.error('📄 Ответ сервера:', error.response.data);
    }
  }
}

// Запуск теста
testCurrentPaymentModal();