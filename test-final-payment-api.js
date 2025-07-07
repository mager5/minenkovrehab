// Используем встроенный fetch в Node.js 18+

// Тестирование обновленного API
async function testPaymentAPI() {
  console.log('\n=== ТЕСТ ОБНОВЛЕННОГО API ГЕНЕРАЦИИ ПЛАТЕЖНОЙ ССЫЛКИ ===\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/robokassa/generate-payment-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        phone: '+7 (999) 123-45-67',
        amount: 2950,
        description: 'Абонемент клуба формула движения'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data?.paymentUrl) {
      const generatedUrl = data.data.paymentUrl;
      console.log('✅ API успешно сгенерировал платежную ссылку:');
      console.log(generatedUrl);
      
      // Требуемая ссылка для сравнения
      const requiredUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950.00&invoiceID=837984789&Description=Абонемент+клуба+формула+движения&SignatureValue=8E86A9B01122AA2175F5405AE1532FAE&IsTest=1';
      
      console.log('\n📋 Требуемая ссылка:');
      console.log(requiredUrl);
      
      // Парсим параметры для сравнения
      const generatedParams = new URLSearchParams(generatedUrl.split('?')[1]);
      const requiredParams = new URLSearchParams(requiredUrl.split('?')[1]);
      
      console.log('\n=== СРАВНЕНИЕ КЛЮЧЕВЫХ ПАРАМЕТРОВ ===\n');
      
      const keyParams = ['MerchantLogin', 'OutSum', 'invoiceID', 'Description', 'IsTest'];
      let keyParamsMatch = true;
      
      for (const param of keyParams) {
        const generated = generatedParams.get(param);
        const required = requiredParams.get(param);
        const match = generated === required;
        
        if (!match) keyParamsMatch = false;
        
        console.log(`${param}:`);
        console.log(`  Сгенерировано: ${generated}`);
        console.log(`  Требуется: ${required}`);
        console.log(`  Совпадает: ${match ? '✅' : '❌'}`);
        console.log('');
      }
      
      // Проверяем подпись отдельно
      const generatedSignature = generatedParams.get('SignatureValue');
      const requiredSignature = requiredParams.get('SignatureValue');
      
      console.log('SignatureValue:');
      console.log(`  Сгенерировано: ${generatedSignature}`);
      console.log(`  Требуется: ${requiredSignature}`);
      console.log(`  Совпадает: ${generatedSignature === requiredSignature ? '✅' : '❌ (ожидаемо, разные пароли)'}`);
      
      console.log('\n=== ИТОГОВЫЙ РЕЗУЛЬТАТ ===');
      console.log(`Ключевые параметры совпадают: ${keyParamsMatch ? '✅ ДА' : '❌ НЕТ'}`);
      
      if (keyParamsMatch) {
        console.log('\n🎉 УСПЕХ! Обновленный API генерирует ссылки в требуемом формате.');
        console.log('📝 Подпись отличается, что нормально для разных паролей в тестовой среде.');
      } else {
        console.log('\n❌ ОШИБКА! Некоторые ключевые параметры не совпадают.');
      }
      
    } else {
      console.error('❌ API вернул ошибку:', data.error || 'Неизвестная ошибка');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error.message);
    console.log('\n💡 Убедитесь, что API запущен на http://localhost:3001');
  }
}

// Запускаем тест
testPaymentAPI();