const https = require('https');

// Проверка environment variables на Railway
function checkEnvVars() {
  const postData = JSON.stringify({
    email: 'test@example.com',
    phone: '+79001234567',
    amount: 2950,
    description: 'Абонемент клуба формула движения',
  });

  const options = {
    hostname: 'minenkovrehab-production-15cc.up.railway.app',
    port: 443,
    path: '/api/robokassa-sdk/generate-payment-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  console.log('🔍 Проверяем генерацию ссылки оплаты на Railway...');

  const req = https.request(options, res => {
    console.log('📊 Статус:', res.statusCode);

    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📦 Полный ответ:', data);

      try {
        const json = JSON.parse(data);
        console.log('\n📋 Анализ ответа:');

        if (json.success) {
          console.log('✅ Запрос успешен');

          if (json.paymentUrl) {
            console.log('🔗 URL сгенерирован:', json.paymentUrl);

            // Анализируем URL
            try {
              const url = new URL(json.paymentUrl);
              const params = url.searchParams;

              console.log('\n🔍 Параметры URL:');
              console.log(
                '- MerchantLogin:',
                params.get('MerchantLogin') || 'ПУСТОЙ!'
              );
              console.log('- OutSum:', params.get('OutSum'));
              console.log('- Description:', params.get('Description'));
              console.log('- IsTest:', params.get('IsTest'));
              console.log(
                '- SignatureValue:',
                params.get('SignatureValue') ? 'ЕСТЬ' : 'НЕТ'
              );

              // Проверка Receipt
              const receiptParam = params.get('Receipt');
              if (receiptParam) {
                console.log('\n🧾 Параметры фискализации (Receipt):');
                try {
                  const receipt = JSON.parse(decodeURIComponent(receiptParam));
                  console.log('- INN:', receipt.company?.inn || 'НЕ УКАЗАН');
                  console.log('- SNO:', receipt.sno || 'НЕ УКАЗАН');
                  console.log('- Tax:', receipt.items?.[0]?.tax || 'НЕ УКАЗАН');
                  console.log(
                    '- Payment Method:',
                    receipt.items?.[0]?.payment_method || 'НЕ УКАЗАН'
                  );

                  if (receipt.company?.inn === '000000000000') {
                    console.log(
                      '⚠️ ВНИМАНИЕ: Используется тестовый ИНН 000000000000!'
                    );
                  }
                } catch (e) {
                  console.log('❌ Ошибка парсинга Receipt:', e.message);
                }
              } else {
                console.log('\n⚠️ Receipt параметр отсутствует!');
              }

              if (!params.get('MerchantLogin')) {
                console.log('\n❌ ПРОБЛЕМА: MerchantLogin пустой!');
                console.log('🔧 Нужно настроить ROBOKASSA_LOGIN на Railway');
              }
            } catch (urlError) {
              console.log('❌ Ошибка парсинга URL:', urlError.message);
            }
          } else {
            console.log('❌ paymentUrl отсутствует в ответе');
          }
        } else {
          console.log('❌ Запрос неуспешен');
          console.log('📝 Ошибка:', json.error || 'Неизвестная ошибка');
        }
      } catch (parseError) {
        console.log('❌ Ошибка парсинга JSON:', parseError.message);
      }
    });
  });

  req.on('error', err => {
    console.log('❌ Ошибка запроса:', err.message);
  });

  req.write(postData);
  req.end();
}

checkEnvVars();
