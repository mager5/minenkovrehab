#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Функция для проверки статуса URL
function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
        success: res.statusCode >= 200 && res.statusCode < 400
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        error: err.message,
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout',
        success: false
      });
    });
    
    req.end();
  });
}

// Функция для получения полного ответа
function getFullResponse(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          body: data,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        error: err.message,
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout',
        success: false
      });
    });
    
    req.end();
  });
}

async function testRailwayStatus() {
  console.log('🔍 Проверка статуса Railway API...');
  console.log('=' .repeat(50));
  
  const urls = [
    'https://robokassa-api-production.up.railway.app',
    'https://robokassa-api-production.up.railway.app/health',
    'https://robokassa-api-production.up.railway.app/api/robokassa-sdk/test'
  ];
  
  for (const url of urls) {
    console.log(`\n📡 Проверяем: ${url}`);
    
    // Сначала HEAD запрос
    const headResult = await checkUrl(url);
    console.log(`   Status: ${headResult.status}`);
    
    if (headResult.success) {
      console.log('   ✅ Доступен');
      
      // Если доступен, получаем полный ответ
      const fullResult = await getFullResponse(url);
      if (fullResult.body) {
        try {
          const jsonBody = JSON.parse(fullResult.body);
          console.log('   📄 Ответ:', JSON.stringify(jsonBody, null, 2));
        } catch {
          console.log('   📄 Ответ (не JSON):', fullResult.body.substring(0, 200));
        }
      }
    } else {
      console.log(`   ❌ Недоступен: ${headResult.error || headResult.status}`);
      
      // Попробуем получить тело ошибки
      if (headResult.status !== 'ERROR' && headResult.status !== 'TIMEOUT') {
        const errorResult = await getFullResponse(url);
        if (errorResult.body) {
          console.log('   📄 Ошибка:', errorResult.body.substring(0, 200));
        }
      }
    }
    
    if (headResult.headers) {
      console.log('   🏷️  Заголовки:');
      Object.entries(headResult.headers).forEach(([key, value]) => {
        if (key.startsWith('x-railway')) {
          console.log(`      ${key}: ${value}`);
        }
      });
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Проверка завершена');
}

// Запуск проверки
testRailwayStatus().catch(console.error);