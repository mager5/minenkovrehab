const express = require('express');
const router = express.Router();
const {
  generateSuccessSignature,
  verifySignature,
} = require('../utils/signature');
const { validateSuccessParams } = require('../utils/validation');

/**
 * GET /payment/success
 * Страница успешной оплаты
 */
router.get('/success', (req, res) => {
  try {
    console.log('✅ Переход на страницу успешной оплаты:', req.query);

    const { OutSum, InvId, SignatureValue } = req.query;

    // Если есть параметры от Robokassa, проверяем подпись
    if (OutSum && InvId && SignatureValue) {
      const validation = validateSuccessParams(req.query);
      if (!validation.isValid) {
        console.error('❌ Ошибка валидации Success URL:', validation.errors);
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Ошибка оплаты</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #d32f2f; }
            </style>
          </head>
          <body>
            <h1 class="error">Ошибка проверки платежа</h1>
            <p>Некорректные параметры платежа</p>
            <a href="/">Вернуться на главную</a>
          </body>
          </html>
        `);
      }

      const outSum = parseFloat(OutSum);
      const shpParams = {};
      Object.keys(req.query).forEach(key => {
        if (key.startsWith('shp_')) {
          shpParams[key] = req.query[key];
        }
      });
      const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
      const password1 = isTestMode
        ? process.env.ROBOKASSA_TEST_PASSWORD1
        : process.env.ROBOKASSA_PASSWORD1;

      if (password1) {
        const expectedSignature = generateSuccessSignature(
          outSum,
          InvId,
          password1,
          shpParams
        );

        if (!verifySignature(SignatureValue, expectedSignature)) {
          console.error('❌ Неверная подпись Success URL');
          return res.status(400).send(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Ошибка оплаты</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #d32f2f; }
              </style>
            </head>
            <body>
              <h1 class="error">Ошибка проверки платежа</h1>
              <p>Неверная подпись платежа</p>
              <a href="/">Вернуться на главную</a>
            </body>
            </html>
          `);
        }

        console.log('✅ Успешная оплата подтверждена:', {
          invoiceId: InvId,
          amount: outSum,
          testMode: isTestMode,
        });

        const frontendUrl =
          process.env.FRONTEND_URL || 'https://minenkovrehab.ru';
        const redirect = new URL('/payment/success', frontendUrl);
        redirect.searchParams.set('OutSum', String(OutSum));
        redirect.searchParams.set('InvId', String(InvId));
        redirect.searchParams.set('SignatureValue', String(SignatureValue));
        Object.keys(shpParams)
          .sort()
          .forEach(key => {
            const value = shpParams[key];
            if (typeof value === 'string') {
              redirect.searchParams.set(key, value);
            } else if (Array.isArray(value) && value[0]) {
              redirect.searchParams.set(key, String(value[0]));
            }
          });
        return res.redirect(redirect.toString());
      }
    }

    // Отображение страницы успешной оплаты
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Оплата успешна</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
          }
          .success-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 0 auto;
          }
          .success { color: #4caf50; }
          .checkmark {
            font-size: 64px;
            color: #4caf50;
            margin-bottom: 20px;
          }
          .btn {
            background-color: #4caf50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
          }
          .btn:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="success-container">
          <div class="checkmark">✓</div>
          <h1 class="success">Оплата успешно завершена!</h1>
          <p>Спасибо за покупку. Ваш платеж был успешно обработан.</p>
          ${InvId ? `<p><strong>Номер заказа:</strong> ${InvId}</p>` : ''}
          ${OutSum ? `<p><strong>Сумма:</strong> ${OutSum} руб.</p>` : ''}
          <p>В ближайшее время с вами свяжется наш менеджер для уточнения деталей.</p>
          <a href="https://minenkovrehab.ru" class="btn">Вернуться на сайт</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Ошибка на странице успешной оплаты:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ошибка</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1 class="error">Произошла ошибка</h1>
        <p>Попробуйте обновить страницу или обратитесь в поддержку</p>
        <a href="/">Вернуться на главную</a>
      </body>
      </html>
    `);
  }
});

/**
 * GET /payment/fail
 * Страница неуспешной оплаты
 */
router.get('/fail', (req, res) => {
  try {
    console.log('❌ Переход на страницу неуспешной оплаты:', req.query);

    const { OutSum, InvId } = req.query;

    // Отображение страницы неуспешной оплаты
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ошибка оплаты</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
          }
          .fail-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 0 auto;
          }
          .error { color: #d32f2f; }
          .error-icon {
            font-size: 64px;
            color: #d32f2f;
            margin-bottom: 20px;
          }
          .btn {
            background-color: #2196f3;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 10px;
          }
          .btn:hover {
            background-color: #1976d2;
          }
          .btn-retry {
            background-color: #ff9800;
          }
          .btn-retry:hover {
            background-color: #f57c00;
          }
        </style>
      </head>
      <body>
        <div class="fail-container">
          <div class="error-icon">✗</div>
          <h1 class="error">Оплата не была завершена</h1>
          <p>К сожалению, платеж не был обработан. Это могло произойти по следующим причинам:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>Отмена операции</li>
            <li>Недостаточно средств на карте</li>
            <li>Технические проблемы банка</li>
            <li>Неверные данные карты</li>
          </ul>
          ${InvId ? `<p><strong>Номер заказа:</strong> ${InvId}</p>` : ''}
          ${OutSum ? `<p><strong>Сумма:</strong> ${OutSum} руб.</p>` : ''}
          <div>
            <a href="https://minenkovrehab.ru" class="btn">Вернуться на сайт</a>
            <a href="https://minenkovrehab.ru/payment" class="btn btn-retry">Попробовать снова</a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Если проблема повторяется, обратитесь в поддержку:<br>
            <strong>Телефон:</strong> +7 (XXX) XXX-XX-XX<br>
            <strong>Email:</strong> support@minenkovrehab.ru
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Ошибка на странице неуспешной оплаты:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ошибка</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1 class="error">Произошла ошибка</h1>
        <p>Попробуйте обновить страницу или обратитесь в поддержку</p>
        <a href="/">Вернуться на главную</a>
      </body>
      </html>
    `);
  }
});

module.exports = router;
