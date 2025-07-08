const https = require('https');

// Данные для тестирования
const testData = {
  amount: 2950,
  description: 'Абонемент клуба формула движения',
  invoiceId: 837984789
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'minenkovrehab-production-15cc.up.railway.app',
  port: 443,
  path: '/api/robokassa/generate-payment-url',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔄 Отправляем запрос к исправленному API...');
console.log('Данные:', testData);

const req = https.request(options, (res) => {
  console.log(`\n📊 Статус ответа: ${res.statusCode}`);
  console.log('📋 Заголовки:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📦 Ответ от сервера:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.success && response.data && response.data.paymentUrl) {
        console.log('\n✅ СГЕНЕРИРОВАННАЯ ССЫЛКА:');
        console.log(response.data.paymentUrl);
        
        console.log('\n📋 ОБРАЗЕЦ ССЫЛКИ:');
        console.log('https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950.00&invoiceID=837984789&Description=Абонемент+клуба+формула+движения&SignatureValue=8E86A9B01122AA2175F5405AE1532FAE&IsTest=1');
        
        // Сравнение структуры ссылок
        const generatedUrl = new URL(response.data.paymentUrl);
        const sampleUrl = new URL('https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=Minenkov-2&OutSum=2950.00&invoiceID=837984789&Description=Абонемент+клуба+формула+движения&SignatureValue=8E86A9B01122AA2175F5405AE1532FAE&IsTest=1');
        
        console.log('\n🔍 СРАВНЕНИЕ ПАРАМЕТРОВ:');
        console.log('MerchantLogin - Образец:', sampleUrl.searchParams.get('MerchantLogin'), '| Наш:', generatedUrl.searchParams.get('MerchantLogin'));
        console.log('OutSum - Образец:', sampleUrl.searchParams.get('OutSum'), '| Наш:', generatedUrl.searchParams.get('OutSum'));
        console.log('invoiceID - Образец:', sampleUrl.searchParams.get('invoiceID'), '| Наш:', generatedUrl.searchParams.get('invoiceID'));
        console.log('Description - Образец:', sampleUrl.searchParams.get('Description'), '| Наш:', generatedUrl.searchParams.get('Description'));
        console.log('SignatureValue - Образец:', sampleUrl.searchParams.get('SignatureValue'), '| Наш:', generatedUrl.searchParams.get('SignatureValue'));
        console.log('IsTest - Образец:', sampleUrl.searchParams.get('IsTest'), '| Наш:', generatedUrl.searchParams.get('IsTest'));
      }
    } catch (error) {
      console.log('❌ Ошибка парсинга JSON:', error.message);
      console.log('Сырой ответ:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка запроса:', error.message);
});

req.write(postData);
req.end();