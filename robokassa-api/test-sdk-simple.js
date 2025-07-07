#!/usr/bin/env node

const axios = require('axios');

// Конфигурация
const API_BASE_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 10000;

// Простые функции для вывода
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    'success': '✅',
    'error': '❌',
    'info': 'ℹ️',
    'warning': '⚠️'
  }[type] || 'ℹ️';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// Функция для проверки доступности API
async function checkApiHealth() {
  try {
    log('Проверка состояния API...');
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      log('API доступен и работает', 'success');
      log(`Режим: ${response.data.environment}`);
      log(`Тестовый режим: ${response.data.testMode ? 'ВКЛ' : 'ВЫКЛ'}`);
      return true;
    }
  } catch (error) {
    log('API недоступен', 'error');
    if (error.code === 'ECONNREFUSED') {
      log('Соединение отклонено - сервер не запущен на порту 3002', 'error');
    } else {
      log(`Ошибка: ${error.message}`, 'error');
    }
    return false;
  }
}

// Функция для тестирования SDK эндпоинта
async function testSdkEndpoint() {
  try {
    log('Тестирование SDK эндпоинта...');
    
    const response = await axios.get(`${API_BASE_URL}/api/robokassa-sdk/test`, {
      timeout: TEST_TIMEOUT
    });
    
    if (response.status === 200 && response.data.success) {
      log('SDK эндпоинт работает корректно', 'success');
      log(`Merchant Login: ${response.data.config.merchantLogin}`);
      log(`Тестовый режим: ${response.data.config.testMode ? 'ВКЛ' : 'ВЫКЛ'}`);
      
      if (response.data.testData.paymentUrl) {
        log('Тестовый URL для оплаты сгенерирован', 'success');
        console.log(`URL: ${response.data.testData.paymentUrl}`);
      }
      
      return true;
    } else {
      log('SDK эндпоинт вернул неожиданный ответ', 'error');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    log('Ошибка при тестировании SDK эндпоинта', 'error');
    if (error.response) {
      log(`HTTP ${error.response.status}: ${error.response.statusText}`, 'error');
      if (error.response.data) {
        console.log('Response data:', error.response.data);
      }
    } else {
      log(error.message, 'error');
    }
    return false;
  }
}

// Функция для тестирования создания платежа через SDK
async function testSdkPaymentCreation() {
  try {
    log('Тестирование создания платежа через SDK...');
    
    const paymentData = {
      amount: 1500,
      description: 'Тестовый платеж через SDK - Реабилитация Миненкова',
      orderId: `SDK_TEST_${Date.now()}`,
      email: 'test@example.com',
      currency: 'RUB'
    };
    
    log(`Данные платежа: ${JSON.stringify(paymentData)}`);
    
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
      log('Платеж успешно создан через SDK!', 'success');
      
      const paymentInfo = response.data.data;
      log(`ID заказа: ${paymentInfo.invoiceId}`);
      log(`Сумма: ${paymentInfo.amount} ${paymentInfo.currency}`);
      log(`Описание: ${paymentInfo.description}`);
      log(`Тестовый режим: ${paymentInfo.testMode ? 'ВКЛ' : 'ВЫКЛ'}`);
      
      if (paymentInfo.paymentUrl) {
        log('URL для оплаты сгенерирован:', 'success');
        console.log(`🔗 ${paymentInfo.paymentUrl}`);
        
        // Проверяем, что URL содержит ожидаемые параметры
        if (paymentInfo.paymentUrl.includes('auth.robokassa.ru')) {
          log('URL содержит корректный домен Robokassa', 'success');
        }
        
        if (paymentInfo.paymentUrl.includes('OutSum=' + paymentData.amount)) {
          log('URL содержит корректную сумму', 'success');
        }
        
        if (paymentInfo.paymentUrl.includes('IsTest=1') && paymentInfo.testMode) {
          log('URL содержит параметр тестового режима', 'success');
        }
      }
      
      return true;
    } else {
      log('Неожиданный ответ при создании платежа', 'error');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    log('Ошибка при создании платежа через SDK', 'error');
    if (error.response) {
      log(`HTTP ${error.response.status}: ${error.response.statusText}`, 'error');
      if (error.response.data) {
        console.log('Response data:', error.response.data);
      }
    } else {
      log(error.message, 'error');
    }
    return false;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('\n=== Тестирование интеграции Robokassa SDK ===');
  console.log(`Время запуска: ${new Date().toLocaleString()}\n`);
  
  let allTestsPassed = true;
  
  // 1. Проверка доступности API
  console.log('--- Проверка состояния API ---');
  const apiHealthy = await checkApiHealth();
  if (!apiHealthy) {
    log('Тестирование прервано - API недоступен', 'error');
    process.exit(1);
  }
  
  // 2. Тестирование SDK эндпоинта
  console.log('\n--- Тестирование SDK эндпоинта ---');
  const sdkEndpointWorking = await testSdkEndpoint();
  if (!sdkEndpointWorking) {
    allTestsPassed = false;
  }
  
  // 3. Тестирование создания платежа
  console.log('\n--- Тестирование создания платежа через SDK ---');
  const paymentCreationWorking = await testSdkPaymentCreation();
  if (!paymentCreationWorking) {
    allTestsPassed = false;
  }
  
  // Итоговый результат
  console.log('\n--- Результаты тестирования ---');
  
  if (allTestsPassed) {
    log('🎉 Все тесты пройдены успешно!', 'success');
    log('✅ SDK интеграция работает корректно', 'success');
    log('🚀 Можно использовать новые эндпоинты для создания платежей', 'success');
    
    console.log('\nДоступные эндпоинты SDK:');
    console.log('• GET  /api/robokassa-sdk/test - Тестирование SDK');
    console.log('• POST /api/robokassa-sdk/generate-payment-url - Создание платежа');
    console.log('• POST /api/robokassa-sdk/callback - Обработка callback от Robokassa');
    
  } else {
    log('❌ Некоторые тесты завершились с ошибками', 'error');
    log('🔧 Требуется дополнительная настройка или исправление ошибок', 'warning');
    process.exit(1);
  }
}

// Запуск тестов
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n💥 Критическая ошибка при выполнении тестов:');
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