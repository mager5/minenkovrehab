const express = require('express');
const robokassa = require('node-robokassa');
const router = express.Router();

// Инициализация Robokassa Helper с использованием переменных окружения
const robokassaHelper = new robokassa.RobokassaHelper({
  // ОБЯЗАТЕЛЬНЫЕ ПАРАМЕТРЫ:
  merchantLogin: process.env.ROBOKASSA_LOGIN,
  hashingAlgorithm: 'sha256', // или 'md5', 'sha1' в зависимости от настроек
  password1: process.env.ROBOKASSA_PASSWORD_1,
  password2: process.env.ROBOKASSA_PASSWORD_2,
  
  // ОПЦИОНАЛЬНЫЕ НАСТРОЙКИ
  testMode: process.env.ROBOKASSA_TEST_MODE === 'true', // Глобальный тестовый режим
  resultUrlRequestMethod: 'POST' // HTTP метод для ResultURL запросов
});

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
    const paymentUrl = robokassaHelper.generatePaymentUrl(outSum, invDesc, options);
    
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
    // Обработка ResultURL запроса с помощью SDK
    robokassaHelper.handleResultUrlRequest(req, res, function (values, userData) {
      console.log('✅ [SDK] Платеж подтвержден:', {
        values: values, // Содержит общие значения как "invId" и "outSum"
        userData: userData // Содержит все пользовательские данные, переданные ранее
      });
      
      // Здесь можно добавить логику обработки успешного платежа:
      // - Обновление статуса заказа в базе данных
      // - Отправка уведомлений
      // - Логирование транзакции
      
      // Возвращаем true для подтверждения успешной обработки
      // Если вернуть false, Robokassa получит ошибку
      return true;
      
      // Также можно вернуть Promise для асинхронной обработки:
      // return Promise.resolve();
    });
    
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
    const testOptions = {
      invId: 'TEST_' + Date.now(),
      isTest: true,
      userData: {
        test: true,
        timestamp: new Date().toISOString()
      }
    };
    
    // Генерация тестового URL
    const testPaymentUrl = robokassaHelper.generatePaymentUrl(testAmount, testDescription, testOptions);
    
    res.json({
      success: true,
      message: 'SDK работает корректно',
      testData: {
        paymentUrl: testPaymentUrl,
        amount: testAmount,
        description: testDescription,
        options: testOptions
      },
      config: {
        merchantLogin: process.env.ROBOKASSA_LOGIN,
        testMode: process.env.ROBOKASSA_TEST_MODE === 'true',
        hashingAlgorithm: 'sha256'
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