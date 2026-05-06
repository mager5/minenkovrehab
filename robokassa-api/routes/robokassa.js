const express = require('express');
const router = express.Router();
// const crypto = require('crypto');
const {
  generatePaymentSignature,
  generateResultSignature,
  generateSuccessSignature,
  verifySignature,
  generateInvoiceId,
  formatShpParams,
  createReceiptParameter,
} = require('../utils/signature');
const {
  validatePaymentParams,
  validateResultParams,
  validateSuccessParams,
  validateEnvironment,
  sanitizeString,
  normalizePhone,
} = require('../utils/validation');

/*
const crypto = require('crypto');

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('SUPABASE_URL is not set');
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return { url, serviceRoleKey };
}

function generatePassword(length = 12) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
}

async function resendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY is missing' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Вадим Миненков | Реабилитация <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      error: data?.message || data?.error || `Resend error: ${response.status}`,
    };
  }

  return { ok: true, data };
}

async function supabaseAuthAdminRequest(path, method, body) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function supabaseRestRequest(pathWithQuery, method, body) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}${pathWithQuery}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  return { response, data };
}
*/

// Проверка переменных окружения при загрузке модуля
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.error(
    '❌ Критические ошибки в переменных окружения:',
    envValidation.errors
  );
  console.log('ℹ️ API может работать в ограниченном режиме для тестирования');
}
if (envValidation.warnings && envValidation.warnings.length > 0) {
  console.warn('⚠️ Предупреждения конфигурации:', envValidation.warnings);
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
        details: validation.errors,
      });

      // Эндпоинт track-redirect удален как ненужный
    }

    // Извлечение и санитизация данных
    const email = req.body.email ? sanitizeString(req.body.email) : undefined;
    const phone = req.body.phone ? normalizePhone(req.body.phone) : undefined;
    const amount = parseFloat(req.body.amount);
    // const description = sanitizeString(
    //   req.body.description || 'Абонемент клуба формула движения'
    // ); // Убрано по требованию пользователя
    const productId = req.body.productId; // Получаем ID продукта для определения типа услуги
    const level = req.body.level; // Получаем уровень отдельным параметром

    // Генерируем уникальный ID заказа (числовой, требование Robokassa)
    const invId = generateInvoiceId();

    // Получение настроек Robokassa
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    const login = process.env.ROBOKASSA_LOGIN;
    const password1 = isTestMode
      ? process.env.ROBOKASSA_TEST_PASSWORD1
      : process.env.ROBOKASSA_PASSWORD1;

    // Отладочная информация для диагностики
    console.log('🔍 Отладка переменных окружения:', {
      isTestMode,
      login: login ? `${login.substring(0, 3)}***` : 'НЕ УСТАНОВЛЕН',
      password1: password1 ? '***УСТАНОВЛЕН***' : 'НЕ УСТАНОВЛЕН',
      ROBOKASSA_TEST_MODE: process.env.ROBOKASSA_TEST_MODE,
      NODE_ENV: process.env.NODE_ENV,
    });

    if (!login) {
      return res.status(500).json({
        success: false,
        error: 'ROBOKASSA_LOGIN не установлен - обратитесь к администратору',
      });
    }

    if (!password1) {
      return res.status(500).json({
        success: false,
        error: `Пароль #1 для ${isTestMode ? 'тестового' : 'боевого'} режима не установлен`,
        details: {
          testMode: isTestMode,
          requiredVar: isTestMode
            ? 'ROBOKASSA_TEST_PASSWORD1'
            : 'ROBOKASSA_PASSWORD1',
          message:
            'Для генерации платежных ссылок необходимо установить соответствующие переменные окружения',
        },
      });
    }

    // Создание параметра Receipt для фискализации
    let receiptParam = null;

    const shpParams = {};
    if (productId) {
      shpParams.shp_product_id = sanitizeString(String(productId));
    }
    if (level !== undefined && level !== null && String(level).trim()) {
      shpParams.shp_level = sanitizeString(String(level));
    }

    // Если в запросе передан объект receipt, используем его
    console.log('🔍 Проверка req.body.receipt:', req.body.receipt);
    if (req.body.receipt) {
      receiptParam = JSON.stringify(req.body.receipt);
      console.log('📄 Использован переданный параметр Receipt:', receiptParam);
    }
    // Иначе создаем автоматически, если есть email или phone
    else if (email || phone) {
      console.log('🚀 ВХОД В ЛОГИКУ ФИСКАЛИЗАЦИИ');
      // Для фискализации определяем название услуги по productId и level
      console.log('🔍 Отладка параметров для фискализации:', {
        productId,
        level,
        typeOfProductId: typeof productId,
        typeOfLevel: typeof level,
      });
      let fiscalServiceName;

      // Определяем название услуги на основе productId
      if (productId === 'formula-movement') {
        // Для программы "Формула Движения" определяем конкретный уровень
        // Проверяем и строковые, и числовые значения level
        if (level === '1' || level === 1) {
          fiscalServiceName =
            "Программа тренировок 'Формула Движения' 1 уровень";
        } else if (level === '2' || level === 2) {
          fiscalServiceName =
            "Программа тренировок 'Формула Движения' 2 уровень";
        } else if (level === '3' || level === 3) {
          fiscalServiceName =
            "Программа тренировок 'Формула Движения' 3 уровень";
        } else if (level === '4' || level === 4) {
          fiscalServiceName =
            "Программа тренировок 'Формула Движения' 4 уровень";
        } else {
          // Fallback для неизвестного уровня
          fiscalServiceName = "Программа тренировок 'Формула Движения'";
        }
      } else if (productId === 'consultation') {
        fiscalServiceName = 'Онлайн-консультация';
      } else if (productId === 'express-consultation') {
        fiscalServiceName = 'Экспресс онлайн-консультация';
      } else if (productId === 'personal-program') {
        fiscalServiceName = 'Программа восстановления после резекции мениска';
      } else if (productId === 'online-training') {
        fiscalServiceName = 'Онлайн-тренировка';
      } else {
        // Fallback для неизвестных продуктов - НЕ используем "Формула Движения"
        fiscalServiceName = 'Услуга реабилитации';
      }

      receiptParam = createReceiptParameter(
        fiscalServiceName,
        amount,
        email || 'noreply@minenkovrehab.ru',
        phone || '+79000000000'
      );
      console.log('📄 Создан автоматический параметр Receipt для фискализации');
    }

    // Генерация подписи с учетом параметра Receipt (если есть)
    // Старый вариант (оставлен для истории):
    // const signature = generatePaymentSignature(
    //   login,
    //   amount,
    //   invId,
    //   password1,
    //   {},
    //   receiptParam
    // );
    const signature = generatePaymentSignature(
      login,
      amount,
      invId,
      password1,
      shpParams,
      receiptParam
    );

    // Формирование URL для оплаты в точном соответствии с образцом ссылки
    const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';

    // Формируем параметры в том же порядке как в образце
    const params = [
      // 'Encoding=utf-8',
      // 'Culture=ru',
      // 'Locale=ru-RU',
      `MerchantLogin=${encodeURIComponent(login)}`,
      `OutSum=${amount.toFixed(2)}`,
      `invoiceID=${invId}`,
      // `InvId=${invId}`,
      // `Description=${encodeURIComponent(description)}`, // Убрано по требованию пользователя
    ];

    // Добавляем Receipt параметр, если он создан (для фискализации)
    if (receiptParam) {
      params.push(`Receipt=${encodeURIComponent(receiptParam)}`);
    }

    // Старый вариант (оставлен для истории):
    // const shpKeys = Object.keys(shpParams).sort();
    // for (const key of shpKeys) {
    //   params.push(`${key}=${encodeURIComponent(shpParams[key])}`);
    // }
    const shpKeys = Object.keys(shpParams).sort();
    for (const key of shpKeys) {
      params.push(`${key}=${encodeURIComponent(shpParams[key])}`);
    }

    // Добавляем подпись в конце
    params.push(`SignatureValue=${signature}`);

    // Добавляем IsTest только в тестовом режиме
    if (isTestMode) {
      params.push('IsTest=1');
    }

    const paymentUrl = `${baseUrl}?${params.join('&')}`;

    console.log(
      '✅ Платежный URL сгенерирован согласно документации Robokassa:',
      {
        invId,
        amount,
        email,
        phone,
        testMode: isTestMode,
        culture: 'en',
        locale: 'en',
        url: paymentUrl,
      }
    );

    // Формат URL с параметрами в алфавитном порядке (обязательно для Robokassa):
    // https://auth.robokassa.ru/Merchant/Index.aspx?Culture=ru&Description=Покупка&Encoding=utf-8&InvId=123&Locale=ru-RU&MerchantLogin=demo&OutSum=11&SignatureValue=xxx
    // Порядок параметров критически важен для корректной работы

    // Возврат результата
    res.json({
      success: true,
      data: {
        paymentUrl,
        invoiceId: invId,
        amount,
        // description, // Убрано по требованию пользователя
        testMode: isTestMode,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка генерации платежного URL:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      message:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
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

    // Извлечение shp_ параметров из запроса
    const shpParams = {};
    Object.keys(params).forEach(key => {
      if (key.startsWith('shp_')) {
        shpParams[key] = params[key];
      }
    });

    // Получение пароля #2
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    const password2 = isTestMode
      ? process.env.ROBOKASSA_TEST_PASSWORD2
      : process.env.ROBOKASSA_PASSWORD2;

    if (!password2) {
      const requiredVar = isTestMode
        ? 'ROBOKASSA_TEST_PASSWORD2'
        : 'ROBOKASSA_PASSWORD2';
      console.error(
        `❌ Пароль #2 не сконфигурирован: ${requiredVar} не установлен`
      );
      console.error(
        'ℹ️ Без пароля #2 невозможно проверить подпись Result URL от Robokassa'
      );
      return res
        .status(500)
        .send('Configuration Error: Password #2 not configured');
    }

    // Генерация ожидаемой подписи с учетом shp_ параметров
    const expectedSignature = generateResultSignature(
      outSum,
      InvId,
      password2,
      shpParams
    );

    // Проверка подписи
    if (!verifySignature(SignatureValue, expectedSignature)) {
      console.error('❌ Неверная подпись Result URL');
      return res.status(400).send('Invalid Signature');
    }

    console.log('✅ Платеж подтвержден:', {
      invoiceId: InvId,
      amount: outSum,
      testMode: isTestMode,
    });

    // TODO: Здесь должна быть логика обновления статуса заказа в базе данных
    // Например:
    // await updateOrderStatus(InvId, 'paid', outSum);
    // await sendConfirmationEmail(email);

    /*
    try {
      const pick = value => (Array.isArray(value) ? value[0] : value);
      const emailRaw =
        pick(shpParams.shp_email) ||
        pick(params.Email) ||
        pick(params.email) ||
        '';
      const email = String(emailRaw).trim().toLowerCase();
      const productSlugRaw = pick(shpParams.shp_product_id) || '';
      const productSlug = String(productSlugRaw).trim();

      if (!email) {
        console.warn('Email отсутствует в Result URL (ожидается shp_email)');
      } else {
        const password = generatePassword();

        let userId = null;
        const created = await supabaseAuthAdminRequest(
          '/auth/v1/admin/users',
          'POST',
          {
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: 'Покупатель',
            },
          }
        );

        if (created.response.ok && created.data?.user?.id) {
          userId = created.data.user.id;
        } else {
          const PER_PAGE = 200;
          for (let page = 1; page <= 10; page++) {
            const list = await supabaseAuthAdminRequest(
              `/auth/v1/admin/users?page=${page}&per_page=${PER_PAGE}`,
              'GET'
            );
            const users = Array.isArray(list.data?.users)
              ? list.data.users
              : [];
            const hit = users.find(
              u =>
                typeof u?.email === 'string' &&
                u.email.toLowerCase() === email.toLowerCase()
            );
            if (hit?.id) {
              userId = hit.id;
              break;
            }
            if (!list.response.ok || users.length < PER_PAGE) {
              break;
            }
          }

          if (userId) {
            await supabaseAuthAdminRequest(
              `/auth/v1/admin/users/${userId}`,
              'PUT',
              { password }
            );
          }
        }

        const siteUrl = process.env.FRONTEND_URL || 'https://minenkovrehab.ru';
        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Доступ к курсу открыт</h2>
            <p>Ваши данные для входа:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Пароль:</strong> ${password}</p>
            <p>Войти можно здесь: <a href="${siteUrl}/login">${siteUrl}/login</a></p>
          </div>
        `;

        const emailResult = await resendEmail({
          to: email,
          subject: 'Доступ к курсу открыт! Ваши данные для входа',
          html,
        });

        if (!emailResult.ok) {
          console.warn('Email send skipped/failed:', emailResult.error);
        }

        if (userId && productSlug) {
          let productId = null;

          const productLookup = await supabaseRestRequest(
            `/rest/v1/products?select=id&slug=eq.${encodeURIComponent(productSlug)}&limit=1`,
            'GET'
          );
          if (
            productLookup.response.ok &&
            Array.isArray(productLookup.data) &&
            productLookup.data[0]?.id
          ) {
            productId = productLookup.data[0].id;
          } else {
            const looksLikeUuid =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                productSlug
              );
            if (looksLikeUuid) {
              productId = productSlug;
            }
          }

          if (productId) {
            const existing = await supabaseRestRequest(
              `/rest/v1/purchases?select=id&robokassa_invoice_id=eq.${encodeURIComponent(
                String(InvId)
              )}&limit=1`,
              'GET'
            );

            const hasPurchase =
              existing.response.ok &&
              Array.isArray(existing.data) &&
              existing.data.length > 0;

            if (hasPurchase) {
              await supabaseRestRequest(
                `/rest/v1/purchases?robokassa_invoice_id=eq.${encodeURIComponent(
                  String(InvId)
                )}`,
                'PATCH',
                {
                  status: 'active',
                  user_id: userId,
                  product_id: productId,
                }
              );
            } else {
              await supabaseRestRequest('/rest/v1/purchases', 'POST', {
                user_id: userId,
                product_id: productId,
                status: 'active',
                robokassa_invoice_id: String(InvId),
              });
            }
          } else {
            console.warn(
              'Не удалось определить product_id в Supabase для productSlug:',
              productSlug
            );
          }
        }
      }
    } catch (e) {
      console.error('Post-payment processing error:', e);
    }
    */

    // Robokassa ожидает ответ "OK{InvId}"
    res.send(`OK${InvId}`);
  } catch (error) {
    console.error('❌ Ошибка обработки Result URL:', error);
    res.status(500).send('Internal Server Error');
  }
};

router.post('/result', handleResult);
router.get('/result', handleResult);

/**
 * GET/POST /api/robokassa/success
 * Обработка Success URL от Robokassa
 */
const handleSuccess = async (req, res) => {
  // Получаем параметры из body (POST) или query (GET)
  const params = req.method === 'POST' ? req.body : req.query;

  try {
    console.log(`✅ Получен Success URL от Robokassa (${req.method}):`, params);

    // Валидация параметров
    const validation = validateSuccessParams(params);
    if (!validation.isValid) {
      console.error('❌ Ошибка валидации Success URL:', validation.errors);
      // Перенаправляем на фронтенд с ошибкой
      const frontendUrl =
        process.env.FRONTEND_URL || 'https://minenkovrehab.github.io';
      return res.redirect(
        `${frontendUrl}/payment/error?message=Invalid+parameters`
      );
    }

    const { OutSum, InvId, SignatureValue } = params;
    const outSum = parseFloat(OutSum);

    // Извлечение shp_ параметров из запроса
    const shpParams = {};
    Object.keys(params).forEach(key => {
      if (key.startsWith('shp_')) {
        shpParams[key] = params[key];
      }
    });

    // Получение пароля #1
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    const password1 = isTestMode
      ? process.env.ROBOKASSA_TEST_PASSWORD1
      : process.env.ROBOKASSA_PASSWORD1;

    if (!password1) {
      console.error('❌ Пароль #1 не сконфигурирован для проверки Success URL');
      const frontendUrl =
        process.env.FRONTEND_URL || 'https://minenkovrehab.github.io';
      return res.redirect(
        `${frontendUrl}/payment/error?message=Configuration+error`
      );
    }

    // Генерация ожидаемой подписи с учетом shp_ параметров
    const expectedSignature = generateSuccessSignature(
      outSum,
      InvId,
      password1,
      shpParams
    );

    // Проверка подписи
    if (!verifySignature(SignatureValue, expectedSignature)) {
      console.error('❌ Неверная подпись Success URL');
      const frontendUrl =
        process.env.FRONTEND_URL || 'https://minenkovrehab.github.io';
      return res.redirect(
        `${frontendUrl}/payment/error?message=Invalid+signature`
      );
    }

    console.log('✅ Успешный платеж подтвержден:', {
      invoiceId: InvId,
      amount: outSum,
      testMode: isTestMode,
    });

    // Перенаправляем на страницу успеха
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://minenkovrehab.github.io';
    res.redirect(
      `${frontendUrl}/payment/success?invId=${InvId}&amount=${outSum}`
    );
  } catch (error) {
    console.error('❌ Ошибка обработки Success URL:', error);
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://minenkovrehab.github.io';
    res.redirect(`${frontendUrl}/payment/error?message=Internal+error`);
  }
};

/**
 * GET/POST /api/robokassa/fail
 * Обработка Fail URL от Robokassa
 */
const handleFail = async (req, res) => {
  // Получаем параметры из body (POST) или query (GET)
  const params = req.method === 'POST' ? req.body : req.query;

  try {
    console.log(`❌ Получен Fail URL от Robokassa (${req.method}):`, params);

    const { InvId, OutSum } = params;

    console.log('❌ Неуспешный платеж:', {
      invoiceId: InvId || 'неизвестно',
      amount: OutSum || 'неизвестно',
    });

    // Перенаправляем на страницу ошибки
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://minenkovrehab.github.io';
    const redirectUrl = InvId
      ? `${frontendUrl}/payment/fail?invId=${InvId}${OutSum ? `&amount=${OutSum}` : ''}`
      : `${frontendUrl}/payment/fail`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Ошибка обработки Fail URL:', error);
    const frontendUrl =
      process.env.FRONTEND_URL || 'https://minenkovrehab.github.io';
    res.redirect(`${frontendUrl}/payment/fail`);
  }
};

router.post('/success', handleSuccess);
router.get('/success', handleSuccess);
router.post('/fail', handleFail);
router.get('/fail', handleFail);

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
        error: 'Параметры outSum, invId и signature обязательны',
      });
    }

    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    let expectedSignature;

    if (type === 'result') {
      const password2 = isTestMode
        ? process.env.ROBOKASSA_TEST_PASSWORD2
        : process.env.ROBOKASSA_PASSWORD2;
      expectedSignature = generateResultSignature(
        parseFloat(outSum),
        invId,
        password2
      );
    } else if (type === 'success') {
      const password1 = isTestMode
        ? process.env.ROBOKASSA_TEST_PASSWORD1
        : process.env.ROBOKASSA_PASSWORD1;
      expectedSignature = generateSuccessSignature(
        parseFloat(outSum),
        invId,
        password1
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'Тип должен быть result или success',
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
        testMode: isTestMode,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка проверки подписи:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
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
      hasPassword1: !!(isTestMode
        ? process.env.ROBOKASSA_TEST_PASSWORD1
        : process.env.ROBOKASSA_PASSWORD1),
      hasPassword2: !!(isTestMode
        ? process.env.ROBOKASSA_TEST_PASSWORD2
        : process.env.ROBOKASSA_PASSWORD2),
    },
  });
});

module.exports = router;
