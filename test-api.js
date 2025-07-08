const https = require('https');

// Тестовые данные для API
const testData = {
  amount: 2950.00,
  description: 'Абонемент клуба формула движения',
  email: 'test@example.com',
  phone: '+7 (999) 123-45-67'
};

// Правильный URL Railway API
const apiUrl = 'https://minenkovrehab-production-15cc.up.railway.app';
const endpoint = '/api/robokassa/generate-payment-url';

const postData = JSON.stringify(testData);

const options = {
  hostname: 'minenkovrehab-production-15cc.up.railway.app',
  port: 443,
  path: endpoint,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔄 Тестирование API генерации платежных ссылок...');
console.log('URL:', `${apiUrl}${endpoint}`);
console.log('Данные:', testData);
console.log('');

const req = https.request(options, (res) => {
  console.log('📊 Статус ответа:', res.statusCode);
  console.log('📋 Заголовки:', res.headers);
  console.log('');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Тело ответа:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.success && response.data && response.data.paymentUrl) {
        console.log('');
        console.log('✅ Платежная ссылка сгенерирована успешно!');
        console.log('🔗 URL для оплаты:');
        console.log(response.data.paymentUrl);
        
        // Проверяем структуру ссылки
        const url = new URL(response.data.paymentUrl);
        console.log('');
        console.log('🔍 Анализ сгенерированной ссылки:');
        console.log('- Базовый URL:', url.origin + url.pathname);
        console.log('- MerchantLogin:', url.searchParams.get('MerchantLogin'));
        console.log('- OutSum:', url.searchParams.get('OutSum'));
        console.log('- invoiceID:', url.searchParams.get('invoiceID'));
        console.log('- Description:', url.searchParams.get('Description'));
        console.log('- SignatureValue:', url.searchParams.get('SignatureValue'));
        console.log('- IsTest:', url.searchParams.get('IsTest'));
        
        // Проверяем правильность формата
        const isCorrectFormat = 
          url.hostname === 'auth.robokassa.ru' &&
          url.pathname === '/Merchant/Index.aspx' &&
          url.searchParams.get('MerchantLogin') === 'Minenkov-2' &&
          url.searchParams.get('OutSum') &&
          url.searchParams.get('invoiceID') &&
          url.searchParams.get('SignatureValue') &&
          url.searchParams.get('IsTest') === '1';
          
        console.log('');
        console.log(isCorrectFormat ? '✅ Формат ссылки правильный!' : '❌ Формат ссылки неправильный!');
        
      } else {
        console.log('');
        console.log('❌ Ошибка генерации платежной ссылки');
        if (response.error) {
          console.log('Ошибка:', response.error);
        }
        if (response.details) {
          console.log('Детали:', response.details);
        }
      }
    } catch (error) {
      console.log('❌ Ошибка парсинга JSON:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка запроса:', error.message);
});

req.write(postData);
req.end();