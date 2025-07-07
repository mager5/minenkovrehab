const https = require('https');

// Простой тест доступности Railway
function testRailway() {
  const options = {
    hostname: 'minenkovrehab-production-15cc.up.railway.app',
    port: 443,
    path: '/health',
    method: 'GET',
    timeout: 10000
  };

  console.log('🔍 Проверяем доступность Railway...');
  console.log('🌐 URL: https://minenkovrehab-production-15cc.up.railway.app/health');

  const req = https.request(options, (res) => {
    console.log('✅ Соединение установлено');
    console.log('📊 Статус:', res.statusCode);
    console.log('📋 Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📦 Ответ:', data);
      try {
        const json = JSON.parse(data);
        console.log('✅ JSON валиден:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('⚠️  Ответ не является JSON');
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Ошибка соединения:', err.message);
    console.log('🔧 Возможные причины:');
    console.log('   - Сервер не запущен на Railway');
    console.log('   - Неправильный URL');
    console.log('   - Проблемы с сетью');
  });

  req.on('timeout', () => {
    console.log('⏰ Таймаут соединения');
    req.destroy();
  });

  req.end();
}

testRailway();