const express = require('express');
const router = express.Router();
const { 
  generatePaymentSignature, 
  generateResultSignature, 
  generateSuccessSignature,
  verifySignature, 
  generateInvoiceId 
} = require('../utils/signature');
const { 
  validatePaymentParams, 
  validateResultParams, 
  validateEnvironment,
  sanitizeString,
  normalizePhone
} = require('../utils/validation');

// Проверка переменных окружения при загрузке модуля
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.error('❌ Ошибки в переменных окружения:', envValidation.errors);
}

/**
 * POST /api/robokassa/generate-payment-url
 * Генерация URL для оплаты через Robokassa
 */
router.post('/generate-payment-url', async (req, res) => {
  try {
    console.log('🔄 Запрос на генерацию платежного URL:', req.body);
    
    // Валидация входных данных
    const validation = validatePaymentParams(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Ошибка валидации',
        details: validation.errors
      });
    }
    
    // Извлечение и санитизация данных
    const email = req.body.email ? sanitizeString(req.body.email) : '';
    const phone = req.body.phone ? normalizePhone(req.body.phone) : '';
    const amount = parseFloat(req.body.amount);
    const description = sanitizeString(req.body.description || 'Оплата абонемента minenkovrehab.ru');
    
    // Генерация уникального ID заказа
    const invId = generateInvoiceId();
    
    // Получение настроек Robokassa
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    const login = process.env.ROBOKASSA_LOGIN;
    const password1 = isTestMode 
      ? process.env.ROBOKASSA_TEST_PASSWORD1 
      : process.env.ROBOKASSA_PASSWORD1;
    
    if (!login || !password1) {
      return res.status(500).json({
        success: false,
        error: 'Настройки Robokassa не сконфигурированы'
      });
    }
    
    // Генерация подписи
    const signature = generatePaymentSignature(login, amount, invId, password1);
    
    // URL для Success и Fail страниц (используем GitHub Pages)
    const frontendUrl = process.env.FRONTEND_URL || 'https://minenkovrehab.github.io';
    const successUrl = `${frontendUrl}/payment/success`;
    const failUrl = `${frontendUrl}/payment/fail`;
    
    // ResultURL указывает на Railway API
    const apiUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
      : 'http://localhost:3001';
    
    // Формирование URL для оплаты
    const baseUrl = isTestMode 
      ? 'https://auth.robokassa.ru/Merchant/Index.aspx'
      : 'https://auth.robokassa.ru/Merchant/Index.aspx';
    
    // Формирование параметров в алфавитном порядке согласно требованиям Robokassa
    const paymentParams = {
      Culture: 'ru',
      Description: description,
      Encoding: 'utf-8',
      FailURL: failUrl,
      InvId: invId,
      IsTest: isTestMode ? '1' : '0',
      MerchantLogin: login,
      OutSum: amount.toString(),
      ResultURL: `${apiUrl}/api/robokassa/result`,
      SignatureValue: signature,
      SuccessURL: successUrl
    };
    
    // Добавляем email и phone только если они переданы
    if (email) {
      paymentParams.Email = email;
    }
    if (phone) {
      paymentParams.Phone = phone;
    }
    
    const paymentParamsUrl = new URLSearchParams(paymentParams);
    
    const paymentUrl = `${baseUrl}?${paymentParamsUrl.toString()}`;
    
    console.log('✅ Платежный URL сгенерирован:', {
      invId,
      amount,
      email,
      phone,
      testMode: isTestMode
    });
    
    // Возврат результата
    res.json({
      success: true,
      data: {
        paymentUrl,
        invoiceId: invId,
        amount,
        description,
        testMode: isTestMode
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка генерации платежного URL:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST/GET /api/robokassa/result
 * Обработка Result URL от Robokassa
 */
const handleResult = async (req, res) => {
  // Получаем параметры из body (POST) или query (GET)
  const params = req.method === 'POST' ? req.body : req.query;
  
  try {
    console.log(`🔔 Получен Result URL от Robokassa (${req.method}):`, params);
    
    // Валидация параметров
    const validation = validateResultParams(params);
    if (!validation.isValid) {
      console.error('❌ Ошибка валидации Result URL:', validation.errors);
      return res.status(400).send('Bad Request');
    }
    
    const { OutSum, InvId, SignatureValue } = params;
    const outSum = parseFloat(OutSum);
    
    // Получение пароля #2
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    const password2 = isTestMode 
      ? process.env.ROBOKASSA_TEST_PASSWORD2 
      : process.env.ROBOKASSA_PASSWORD2;
    
    if (!password2) {
      console.error('❌ Пароль #2 не сконфигурирован');
      return res.status(500).send('Configuration Error');
    }
    
    // Генерация ожидаемой подписи
    const expectedSignature = generateResultSignature(outSum, InvId, password2);
    
    // Проверка подписи
    if (!verifySignature(SignatureValue, expectedSignature)) {
      console.error('❌ Неверная подпись Result URL');
      return res.status(400).send('Invalid Signature');
    }
    
    console.log('✅ Платеж подтвержден:', {
      invoiceId: InvId,
      amount: outSum,
      testMode: isTestMode
    });
    
    // TODO: Здесь должна быть логика обновления статуса заказа в базе данных
    // Например:
    // await updateOrderStatus(InvId, 'paid', outSum);
    // await sendConfirmationEmail(email);
    
    // Robokassa ожидает ответ "OK{InvId}"
    res.send(`OK${InvId}`);
    
  } catch (error) {
    console.error('❌ Ошибка обработки Result URL:', error);
    res.status(500).send('Internal Server Error');
  }
};

router.post('/result', handleResult);
router.get('/result', handleResult);

// Старая версия только для POST (закомментирована)
/*
router.post('/result', async (req, res) => {
  try {
    console.log('🔔 Получен Result URL от Robokassa:', req.body);
    
    // Валидация параметров
    const validation = validateResultParams(req.body);
    if (!validation.isValid) {
      console.error('❌ Ошибка валидации Result URL:', validation.errors);
      return res.status(400).send('Bad Request');
    }
    
    const { OutSum, InvId, SignatureValue } = req.body;
    const outSum = parseFloat(OutSum);
    
    // Получение пароля #2
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    const password2 = isTestMode 
      ? process.env.ROBOKASSA_TEST_PASSWORD2 
      : process.env.ROBOKASSA_PASSWORD2;
    
    if (!password2) {
      console.error('❌ Пароль #2 не сконфигурирован');
      return res.status(500).send('Configuration Error');
    }
    
    // Генерация ожидаемой подписи
    const expectedSignature = generateResultSignature(outSum, InvId, password2);
    
    // Проверка подписи
    if (!verifySignature(SignatureValue, expectedSignature)) {
      console.error('❌ Неверная подпись Result URL');
      return res.status(400).send('Invalid Signature');
    }
    
    console.log('✅ Платеж подтвержден:', {
      invoiceId: InvId,
      amount: outSum,
      testMode: isTestMode
    });
    
    // TODO: Здесь должна быть логика обновления статуса заказа в базе данных
    // Например:
    // await updateOrderStatus(InvId, 'paid', outSum);
    // await sendConfirmationEmail(email);
    
    // Robokassa ожидает ответ "OK{InvId}"
    res.send(`OK${InvId}`);
    
  } catch (error) {
    console.error('❌ Ошибка обработки Result URL:', error);
    res.status(500).send('Internal Server Error');
  }
});
*/

/**
 * GET /api/robokassa/verify-signature
 * Проверка подписи (для отладки)
 */
router.get('/verify-signature', (req, res) => {
  try {
    const { outSum, invId, signature, type = 'result' } = req.query;
    
    if (!outSum || !invId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Параметры outSum, invId и signature обязательны'
      });
    }
    
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    let expectedSignature;
    
    if (type === 'result') {
      const password2 = isTestMode 
        ? process.env.ROBOKASSA_TEST_PASSWORD2 
        : process.env.ROBOKASSA_PASSWORD2;
      expectedSignature = generateResultSignature(parseFloat(outSum), invId, password2);
    } else if (type === 'success') {
      const password1 = isTestMode 
        ? process.env.ROBOKASSA_TEST_PASSWORD1 
        : process.env.ROBOKASSA_PASSWORD1;
      expectedSignature = generateSuccessSignature(parseFloat(outSum), invId, password1);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Тип должен быть result или success'
      });
    }
    
    const isValid = verifySignature(signature, expectedSignature);
    
    res.json({
      success: true,
      data: {
        isValid,
        receivedSignature: signature.toUpperCase(),
        expectedSignature,
        type,
        testMode: isTestMode
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка проверки подписи:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

/**
 * GET /api/robokassa/config
 * Получение текущей конфигурации (для отладки)
 */
router.get('/config', (req, res) => {
  const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
  
  res.json({
    success: true,
    data: {
      login: process.env.ROBOKASSA_LOGIN || 'НЕ УСТАНОВЛЕН',
      testMode: isTestMode,
      frontendUrl: process.env.FRONTEND_URL || 'НЕ УСТАНОВЛЕН',
      environment: process.env.NODE_ENV || 'development',
      hasPassword1: !!(isTestMode ? process.env.ROBOKASSA_TEST_PASSWORD1 : process.env.ROBOKASSA_PASSWORD1),
      hasPassword2: !!(isTestMode ? process.env.ROBOKASSA_TEST_PASSWORD2 : process.env.ROBOKASSA_PASSWORD2)
    }
  });
});

module.exports = router;