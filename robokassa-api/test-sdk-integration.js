#!/usr/bin/env node

const axios = require('axios');
const colors = require('colors');

// Конфигурация
const API_BASE_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 10000; // 10 секунд

// Функция для красивого вывода
function logSection(title) {
  console.log('\n' + '='.repeat(50));
  console.log(title.cyan.bold);
  console.log('='.repeat(50));
}

function logSuccess(message) {
  console.log('✅'.green + ' ' + message.green);
}

function logError(message) {
  console.log('❌'.red + ' ' + message.red);
}

function logInfo(message) {
  console.log('ℹ️'.blue + ' ' + message.blue);
}

function logWarning(message) {
  console.log('⚠️'.yellow + ' ' + message.yellow);
}

// Функция для проверки доступности API
async function checkApiHealth() {
  try {
    logInfo('Проверка состояния API...');
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      logSuccess('API доступен и работает');
      logInfo(`Режим: ${response.data.environment}`);
      logInfo(`Тестовый режим: ${response.data.testMode ? 'ВКЛ' : 'ВЫКЛ'}`);
      return true;
    }
  } catch (error) {
    logError('API недоступен:');
    if (error.code === 'ECONNREFUSED') {
      logError('🔌 Соединение отклонено - сервер не запущен на порту 3002');
    } else {
      logError(`Ошибка: ${error.message}`);
    }
    
    logWarning('\n💡 Рекомендации:');
    logWarning('1. Убедитесь, что API сервер запущен: npm start');
    logWarning('2. Проверьте, что сервер слушает на порту 3002');
    logWarning('3. Проверьте логи сервера на наличие ошибок');
    
    return false;
  }
}

// Функция для тестирования SDK эндпоинта
async function testSdkEndpoint() {
  try {
    logInfo('Тестирование SDK эндпоинта...');
    
    const response = await axios.get(`${API_BASE_URL}/api/robokassa-sdk/test`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('SDK эндпоинт работает корректно');
      logInfo(`Merchant Login: ${response.data.config.merchantLogin}`);
      logInfo(`Тестовый режим: ${response.data.config.testMode ? 'ВКЛ' : 'ВЫКЛ'}`);
      logInfo(`Алгоритм хеширования: ${response.data.config.hashingAlgorithm}`);
      
      if (response.data.testData.paymentUrl) {
        logSuccess('Тестовый URL для оплаты сгенерирован');
        logInfo(`URL: ${response.data.testData.paymentUrl.substring(0, 100)}...`);
      }
      
      return true;
    } else {
      logError('SDK эндпоинт вернул неожиданный ответ');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    logError('Ошибка при тестировании SDK эндпоинта:');
    if (error.response) {
      logError(`HTTP ${error.response.status}: ${error.response.statusText}`);
      if (error.response.data) {
        console.log('Response data:', error.response.data);
      }
    } else {
      logError(error.message);
    }
    return false;
  }
}

// Функция для тестирования создания платежа через SDK
async function testSdkPaymentCreation() {
  try {
    logInfo('Тестирование создания платежа через SDK...');
    
    const paymentData = {
      amount: 1500,
      description: 'Тестовый платеж через SDK - Реабилитация Миненкова',
      orderId: `SDK_TEST_${Date.now()}`,
      email: 'test@example.com',
      currency: 'RUB'
    };
    
    logInfo(`Данные платежа: ${JSON.stringify(paymentData, null, 2)}`);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/robokassa-sdk/generate-payment-url`,
      paymentData,
      {
        timeout: TEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Платеж успешно создан через SDK!');
      
      const paymentInfo = response.data.data;
      logInfo(`ID заказа: ${paymentInfo.invoiceId}`);
      logInfo(`Сумма: ${paymentInfo.amount} ${paymentInfo.currency}`);
      logInfo(`Описание: ${paymentInfo.description}`);
      logInfo(`Тестовый режим: ${paymentInfo.testMode ? 'ВКЛ' : 'ВЫКЛ'}`);
      
      if (paymentInfo.paymentUrl) {
        logSuccess('URL для оплаты сгенерирован:');
        console.log(`🔗 ${paymentInfo.paymentUrl}`.cyan);
        
        // Проверяем, что URL содержит ожидаемые параметры
        if (paymentInfo.paymentUrl.includes('auth.robokassa.ru')) {
          logSuccess('URL содержит корректный домен Robokassa');
        }
        
        if (paymentInfo.paymentUrl.includes('OutSum=' + paymentData.amount)) {
          logSuccess('URL содержит корректную сумму');
        }
        
        if (paymentInfo.paymentUrl.includes('IsTest=1') && paymentInfo.testMode) {
          logSuccess('URL содержит параметр тестового режима');
        }
      }
      
      return true;
    } else {
      logError('Неожиданный ответ при создании платежа');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    logError('Ошибка при создании платежа через SDK:');
    if (error.response) {
      logError(`HTTP ${error.response.status}: ${error.response.statusText}`);
      if (error.response.data) {
        console.log('Response data:', error.response.data);
      }
    } else {
      logError(error.message);
    }
    return false;
  }
}

// Функция для сравнения старого и нового API
async function compareApiMethods() {
  logSection('🔄 Сравнение старого и нового API');
  
  const testData = {
    amount: 1000,
    description: 'Сравнительный тест API',
    orderId: `COMPARE_${Date.now()}`
  };
  
  // Тест старого API
  try {
    logInfo('Тестирование старого API...');
    const oldResponse = await axios.post(
      `${API_BASE_URL}/api/robokassa/generate-payment-url`,
      testData,
      { timeout: TEST_TIMEOUT }
    );
    
    if (oldResponse.status === 200) {
      logSuccess('Старый API работает');
    }
  } catch (error) {
    logWarning('Старый API недоступен или работает с ошибками');
  }
  
  // Тест нового SDK API
  try {
    logInfo('Тестирование нового SDK API...');
    const newResponse = await axios.post(
      `${API_BASE_URL}/api/robokassa-sdk/generate-payment-url`,
      testData,
      { timeout: TEST_TIMEOUT }
    );
    
    if (newResponse.status === 200 && newResponse.data.success) {
      logSuccess('Новый SDK API работает корректно');
      logInfo('✨ Рекомендуется использовать SDK API для новых интеграций');
    }
  } catch (error) {
    logError('Новый SDK API недоступен');
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🧪 Тестирование интеграции Robokassa SDK'.rainbow.bold);
  console.log(`🕐 Время запуска: ${new Date().toLocaleString()}`);
  
  let allTestsPassed = true;
  
  // 1. Проверка доступности API
  logSection('🏥 Проверка состояния API');
  const apiHealthy = await checkApiHealth();
  if (!apiHealthy) {
    process.exit(1);
  }
  
  // 2. Тестирование SDK эндпоинта
  logSection('🔧 Тестирование SDK эндпоинта');
  const sdkEndpointWorking = await testSdkEndpoint();
  if (!sdkEndpointWorking) {
    allTestsPassed = false;
  }
  
  // 3. Тестирование создания платежа
  logSection('💳 Тестирование создания платежа через SDK');
  const paymentCreationWorking = await testSdkPaymentCreation();
  if (!paymentCreationWorking) {
    allTestsPassed = false;
  }
  
  // 4. Сравнение API методов
  await compareApiMethods();
  
  // Итоговый результат
  logSection('📊 Результаты тестирования');
  
  if (allTestsPassed) {
    logSuccess('🎉 Все тесты пройдены успешно!');
    logInfo('✅ SDK интеграция работает корректно');
    logInfo('🚀 Можно использовать новые эндпоинты для создания платежей');
    
    console.log('\n📋 Доступные эндпоинты SDK:'.cyan.bold);
    console.log('• GET  /api/robokassa-sdk/test - Тестирование SDK');
    console.log('• POST /api/robokassa-sdk/generate-payment-url - Создание платежа');
    console.log('• POST /api/robokassa-sdk/callback - Обработка callback от Robokassa');
    
  } else {
    logError('❌ Некоторые тесты завершились с ошибками');
    logWarning('🔧 Требуется дополнительная настройка или исправление ошибок');
    process.exit(1);
  }
}

// Запуск тестов
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n💥 Критическая ошибка при выполнении тестов:'.red.bold);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  checkApiHealth,
  testSdkEndpoint,
  testSdkPaymentCreation,
  runTests
};