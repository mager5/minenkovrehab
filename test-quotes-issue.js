#!/usr/bin/env node

/**
 * Тестирование проблемы с кавычками в продакшн среде
 * Сравнение локальной и Railway обработки данных
 */

const https = require('https');
const http = require('http');

// Тестовые данные с различными вариантами кавычек
const testCases = [
  {
    name: 'Без кавычек',
    description: 'Test payment'
  },
  {
    name: 'С одинарными кавычками',
    description: "'Test payment'"
  },
  {
    name: 'С двойными кавычками',
    description: '"Test payment"'
  },
  {
    name: 'Смешанные кавычки',
    description: "'Test \"payment\"'"
  },
  {
    name: 'Реальный заголовок с кавычками',
    description: "'Протокол реабилитации коленного сустава после операции'"
  }
];

function makeRequest(url, data, isHttps = true) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const client = isHttps ? https : http;
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testEnvironment(name, url, isHttps = true) {
  console.log(`\n🧪 Тестирование ${name}`);
  console.log('=' .repeat(50));
  
  for (const testCase of testCases) {
    console.log(`\n📝 Тест: ${testCase.name}`);
    console.log(`📥 Входные данные: ${JSON.stringify(testCase.description)}`);
    
    try {
      const response = await makeRequest(url, {
        amount: 1000,
        description: testCase.description
      }, isHttps);
      
      if (response.statusCode === 200 && response.data.success) {
        const generatedUrl = response.data.data.paymentUrl;
        const urlObj = new URL(generatedUrl);
        const description = urlObj.searchParams.get('Description');
        
        console.log(`✅ Статус: ${response.statusCode}`);
        console.log(`📤 Результат в URL: ${JSON.stringify(description)}`);
        
        // Проверяем наличие %27 (закодированные одинарные кавычки)
        if (generatedUrl.includes('%27')) {
          console.log(`⚠️  НАЙДЕНЫ %27 в URL!`);
          console.log(`🔗 URL: ${generatedUrl}`);
        } else {
          console.log(`✅ %27 не найдены`);
        }
        
        // Проверяем наличие других закодированных символов
        const encodedChars = generatedUrl.match(/%[0-9A-F]{2}/gi);
        if (encodedChars && encodedChars.length > 0) {
          console.log(`🔍 Найдены закодированные символы: ${encodedChars.join(', ')}`);
        }
        
      } else {
        console.log(`❌ Ошибка: ${response.statusCode}`);
        console.log(`📄 Ответ: ${JSON.stringify(response.data, null, 2)}`);
      }
      
    } catch (error) {
      console.log(`❌ Ошибка запроса: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('🔍 ДИАГНОСТИКА ПРОБЛЕМЫ С КАВЫЧКАМИ');
  console.log('Сравнение обработки данных в локальной и продакшн среде\n');
  
  // Тестируем локальную среду (если запущена)
  try {
    await testEnvironment('Локальная среда', 'http://localhost:3001/api/robokassa/generate-payment-url', false);
  } catch (error) {
    console.log('\n⚠️  Локальный сервер недоступен (это нормально если не запущен)');
  }
  
  // Тестируем Railway продакшн
  try {
    await testEnvironment('Railway продакшн', 'https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url', true);
  } catch (error) {
    console.log(`\n❌ Ошибка подключения к Railway: ${error.message}`);
  }
  
  console.log('\n🏁 Тестирование завершено');
  console.log('\n💡 Если в Railway найдены %27, а в локальной среде нет - проблема в различиях обработки строк между средами');
}

// Запуск тестов
runTests().catch(console.error);