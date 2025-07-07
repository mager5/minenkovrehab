#!/usr/bin/env node

const axios = require('axios');

// URL Railway API
const RAILWAY_API_URL = 'https://minenkovrehab-production-15cc.up.railway.app';

async function generatePaymentLink() {
  try {
    console.log('🚀 Генерация тестовой ссылки Robokassa...');
    
    const paymentData = {
      amount: 100,
      description: 'Тест числового InvId на Railway',
      email: 'test@example.com'
    };
    
    console.log('📤 Отправка запроса:', paymentData);
    
    const response = await axios.post(
      `${RAILWAY_API_URL}/api/robokassa/generate-payment-url`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Ответ получен:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.paymentUrl) {
      console.log('\n🔗 ССЫЛКА ДЛЯ ОПЛАТЫ:');
      console.log(response.data.paymentUrl);
      
      // Извлекаем InvId из ссылки
      const invIdMatch = response.data.paymentUrl.match(/InvId=(\d+)/);
      if (invIdMatch) {
        console.log(`\n🆔 InvId: ${invIdMatch[1]} (тип: ${typeof parseInt(invIdMatch[1])})`);
        console.log('✅ InvId корректно генерируется как число!');
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('📄 Ответ сервера:', error.response.data);
      console.error('🔢 Статус:', error.response.status);
    }
  }
}

// Запуск
generatePaymentLink();