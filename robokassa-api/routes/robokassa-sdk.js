const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Функция для генерации простой ссылки Robokassa
function generateSimplePaymentUrl(merchantLogin, outSum, invoiceID, description, password1, isTest = false) {
  // Создаем строку для подписи: MerchantLogin:OutSum:InvId:Password1
  const signatureString = `${merchantLogin}:${outSum}:${invoiceID}:${password1}`;
  
  // Генерируем MD5 хэш
  const signature = crypto.createHash('md5').update(signatureString).digest('hex').toUpperCase();
  
  // Кодируем описание для URL
  const encodedDescription = encodeURIComponent(description).replace(/%20/g, '+');
  
  // Формируем URL
  const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
  const params = [
    `MerchantLogin=${merchantLogin}`,
    `OutSum=${outSum}`,
    `invoiceID=${invoiceID}`,
    `Description=${encodedDescription}`,
    `SignatureValue=${signature}`
  ];
  
  if (isTest) {
    params.push('IsTest=1');
  }
  
  return `${baseUrl}?${params.join('&')}`;
}

/**
 * @route POST /api/robokassa-sdk/generate-payment-url
 * @desc Генерация простой URL для оплаты без лишних параметров
 * @access Public
 */
router.post('/generate-payment-url', async (req, res) => {
  try {
    console.log('🔄 [SDK] Получен запрос на создание платежа:', req.body);
    
    const { amount, description, orderId, email, currency } = req.body;
    
    // Валидация обязательных параметров
    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные параметры: amount, description'
      });
    }
    
    // Параметры для генерации платежа
    const outSum = parseFloat(amount);
    const invDesc = description;
    const invoiceID = orderId || Math.floor(Math.random() * 1000000000); // Генерируем случайный ID
    
    // Простые опции без лишних параметров
    const options = {
      invId: invoiceID,
      isTest: process.env.ROBOKASSA_TEST_MODE === 'true'
    };
    
    console.log('📊 [SDK] Параметры платежа:', {
      outSum,
      invDesc,
      options
    });
    
    // Генерация простого URL для оплаты
    const paymentUrl = generateSimplePaymentUrl(
      process.env.ROBOKASSA_LOGIN || 'Minenkov-2',
      outSum,
      invoiceID,
      invDesc,
      process.env.ROBOKASSA_PASSWORD1 || 'password1',
      process.env.ROBOKASSA_TEST_MODE === 'true'
    );
    
    console.log('✅ [SDK] URL для оплаты сгенерирован:', paymentUrl);
    
    // Возвращаем успешный ответ
    res.json({
      success: true,
      data: {
        paymentUrl: paymentUrl,
        invoiceId: invoiceID,
        amount: outSum,
        description: invDesc,
        testMode: options.isTest,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [SDK] Ошибка при создании платежа:', error);
    
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера при создании платежа',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/robokassa-sdk/callback
 * @desc Обработка callback от Robokassa (ResultURL)
 * @access Public
 */
router.post('/callback', (req, res) => {
  console.log('🔔 [SDK] Получен callback от Robokassa:', req.body);
  
  try {
    // Простая обработка callback
    const { OutSum, InvId, SignatureValue } = req.body;
    
    console.log('✅ [SDK] Платеж подтвержден:', {
      outSum: OutSum,
      invId: InvId,
      signature: SignatureValue
    });
    
    // Здесь можно добавить логику обработки успешного платежа:
    // - Обновление статуса заказа в базе данных
    // - Отправка уведомлений
    // - Логирование транзакции
    
    res.send('OK');
    
  } catch (error) {
    console.error('❌ [SDK] Ошибка при обработке callback:', error);
    
    // В случае ошибки отправляем статус 500
    res.status(500).send('Internal Server Error');
  }
});

/**
 * @route GET /api/robokassa-sdk/test
 * @desc Тестовый эндпоинт для проверки SDK
 * @access Public
 */
router.get('/test', (req, res) => {
  try {
    // Тестовые параметры
    const testAmount = 100;
    const testDescription = 'Тестовый платеж SDK';
    const testInvoiceId = 'TEST_' + Date.now();
    
    // Генерация тестового URL
    const testPaymentUrl = generateSimplePaymentUrl(
      process.env.ROBOKASSA_LOGIN || 'Minenkov-2',
      testAmount,
      testInvoiceId,
      testDescription,
      process.env.ROBOKASSA_PASSWORD1 || 'password1',
      true
    );
    
    res.json({
      success: true,
      message: 'SDK работает корректно',
      testData: {
        paymentUrl: testPaymentUrl,
        amount: testAmount,
        description: testDescription,
        invoiceId: testInvoiceId
      },
      config: {
        merchantLogin: process.env.ROBOKASSA_LOGIN,
        testMode: process.env.ROBOKASSA_TEST_MODE === 'true'
      }
    });
    
  } catch (error) {
    console.error('❌ [SDK] Ошибка в тестовом эндпоинте:', error);
    
    res.status(500).json({
      success: false,
      error: 'Ошибка при тестировании SDK',
      details: error.message
    });
  }
});

module.exports = router;