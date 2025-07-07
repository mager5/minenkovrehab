const crypto = require('crypto');
const https = require('https');

// Настройки Robokassa
const ROBOKASSA_CONFIG = {
  merchantLogin: 'Minenkov-2',
  password1: 'Eld5Xljk2GBN4D6TJo3N', // Тестовый пароль #1
  password2: 'gWtiI5Li9nqojQcc1f60', // Тестовый пароль #2
  isTest: true // Тестовый режим
};

/**
 * Генерирует MD5 хэш
 * @param {string} str - Строка для хэширования
 * @returns {string} MD5 хэш в верхнем регистре
 */
function generateMD5(str) {
  return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

/**
 * Генерирует прямую ссылку на оплату Robokassa
 * @param {Object} paymentData - Данные для платежа
 * @param {number} paymentData.amount - Сумма платежа в рублях
 * @param {string} paymentData.description - Описание платежа
 * @param {number} [paymentData.invoiceId] - Номер счета (опционально)
 * @returns {string} Прямая ссылка на оплату
 */
function generateDirectPaymentLink(paymentData) {
  const { amount, description, invoiceId } = paymentData;
  
  // Генерируем уникальный номер счета, если не передан
  const invId = invoiceId || Math.floor(Math.random() * 1000000000);
  
  // Формируем строку для подписи: MerchantLogin:OutSum:InvId:Password1
  const signatureString = `${ROBOKASSA_CONFIG.merchantLogin}:${amount}:${invId}:${ROBOKASSA_CONFIG.password1}`;
  
  // Генерируем подпись
  const signature = generateMD5(signatureString);
  
  // Кодируем описание для URL
  const encodedDescription = encodeURIComponent(description);
  
  // Формируем ссылку
  const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?` +
    `MerchantLogin=${ROBOKASSA_CONFIG.merchantLogin}&` +
    `OutSum=${amount}&` +
    `invoiceID=${invId}&` +
    `Description=${encodedDescription}&` +
    `SignatureValue=${signature}&` +
    `IsTest=${ROBOKASSA_CONFIG.isTest ? 1 : 0}`;
  
  return {
    paymentUrl,
    invoiceId: invId,
    amount,
    description,
    signature,
    signatureString
  };
}

/**
 * Генерирует ссылку на оплату через Railway API (альтернативный способ)
 * @param {Object} paymentData - Данные для платежа
 */
function generatePaymentLinkViaAPI(paymentData) {
  const data = JSON.stringify({
    amount: paymentData.amount,
    description: paymentData.description,
    email: paymentData.email || '',
    phone: paymentData.phone || ''
  });

  const options = {
    hostname: 'minenkovrehab-production-15cc.up.railway.app',
    port: 443,
    path: '/api/robokassa/generate-payment-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  console.log('🚂 Генерируем ссылку через Railway API...');
  console.log('📍 URL:', `https://${options.hostname}${options.path}`);
  console.log('📋 Данные:', data);

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`✅ Статус ответа: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          
          console.log('📦 Полный ответ:', JSON.stringify(jsonResponse));
          
          if (res.statusCode === 200 && jsonResponse.success) {
            console.log('🎉 Ссылка через API успешно сгенерирована!');
            console.log('🔗 Ссылка из API:', jsonResponse.data?.paymentUrl);
            resolve(jsonResponse);
          } else {
            console.error('❌ Ошибка API:', jsonResponse);
            reject(new Error(jsonResponse.error || 'Ошибка API'));
          }
        } catch (e) {
          console.error('❌ Ошибка парсинга:', e.message);
          console.error('Сырой ответ:', responseData);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Ошибка запроса:', e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

// Пример использования
async function testPaymentGeneration() {
  try {
    // Тестовые данные для генерации ссылки
    const testPayment = {
      amount: 2950,
      description: 'Абонемент клуба формула движения',
      email: 'test@example.com',
      phone: '+79001234567'
    };

    console.log('🧪 Тестируем генерацию прямой ссылки Robokassa...');
    console.log('=' .repeat(60));
    
    // Генерируем прямую ссылку
    const directResult = generateDirectPaymentLink(testPayment);
    
    console.log('✅ ПРЯМАЯ ССЫЛКА ROBOKASSA:');
    console.log('🔗 Ссылка:', directResult.paymentUrl);
    console.log('🆔 Номер счета:', directResult.invoiceId);
    console.log('💰 Сумма:', directResult.amount, 'руб.');
    console.log('📝 Описание:', directResult.description);
    console.log('🔐 Подпись:', directResult.signature);
    console.log('📋 Строка подписи:', directResult.signatureString);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🧪 Тестируем генерацию через Railway API...');
    
    try {
      const apiResult = await generatePaymentLinkViaAPI(testPayment);
      console.log('✅ ССЫЛКА ЧЕРЕЗ API:');
      console.log('🔗 Ссылка:', apiResult.data?.paymentUrl || 'Ссылка не найдена в ответе');
      console.log('📋 Полные данные API:', apiResult.data);
    } catch (apiError) {
      console.log('⚠️ API недоступен:', apiError.message);
      console.log('💡 Используйте прямую ссылку выше');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 ГОТОВАЯ ССЫЛКА ДЛЯ ИСПОЛЬЗОВАНИЯ:');
    console.log(directResult.paymentUrl);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
  }
}

// Запускаем тест, если файл выполняется напрямую
if (require.main === module) {
  testPaymentGeneration();
}

module.exports = { 
  generateDirectPaymentLink, 
  generatePaymentLinkViaAPI,
  ROBOKASSA_CONFIG 
};