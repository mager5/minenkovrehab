#!/usr/bin/env node

const crypto = require('crypto');

// Настройки Robokassa (тестовый режим)
const ROBOKASSA_CONFIG = {
  merchantLogin: 'Minenkov-2',
  password1: 'Eld5Xljk2GBN4D6TJo3N', // Тестовый пароль #1
  password2: 'gWtiI5Li9nqojQcc1f60', // Тестовый пароль #2
  isTest: true, // Тестовый режим
};

/**
 * Генерирует MD5 хэш
 * @param {string} str - Строка для хэширования
 * @returns {string} MD5 хэш в верхнем регистре
 */
function generateMD5(str) {
  return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

/**
 * Генерирует ссылку на оплату Robokassa
 * @param {Object} options - Параметры платежа
 * @param {number} options.amount - Сумма платежа в рублях
 * @param {string} options.description - Описание платежа
 * @param {number} [options.invoiceId] - Номер счета (опционально)
 * @returns {Object} Объект с данными платежа
 */
function generatePaymentLink(options) {
  const { amount, description, invoiceId } = options;

  // Генерируем уникальный номер счета, если не передан
  const invId = invoiceId || Math.floor(Math.random() * 1000000000);

  // Формируем строку для подписи: MerchantLogin:OutSum:InvId:Password1
  const signatureString = `${ROBOKASSA_CONFIG.merchantLogin}:${amount}:${invId}:${ROBOKASSA_CONFIG.password1}`;

  // Генерируем подпись
  const signature = generateMD5(signatureString);

  // Кодируем описание для URL
  const encodedDescription = encodeURIComponent(description);

  // Формируем ссылку
  const paymentUrl =
    `https://auth.robokassa.ru/Merchant/Index.aspx?` +
    `MerchantLogin=${ROBOKASSA_CONFIG.merchantLogin}&` +
    `OutSum=${amount}&` +
    `invoiceID=${invId}&` +
    `Description=${encodedDescription}&` +
    `SignatureValue=${signature}&` +
    `IsTest=${ROBOKASSA_CONFIG.isTest ? 1 : 0}`;

  return {
    paymentUrl,
    invoiceId: invId,
    amount,
    description,
    signature,
    signatureString,
    isTest: ROBOKASSA_CONFIG.isTest,
  };
}

// /**
//  * Быстрая генерация ссылки для абонемента клуба
//  * @param {number} amount - Сумма платежа
//  * @returns {Object} Данные платежа
//  */
// function generateClubSubscriptionLink(amount = 2950) {
//   return generatePaymentLink({
//     amount,
//     description: 'Абонемент клуба формула движения'
//   });
// } // Удалено: функция для клуба

// Если скрипт запущен напрямую
if (require.main === module) {
  console.log('🏋️ Генератор ссылок оплаты');
  console.log('='.repeat(60));

  // Генерируем ссылку для консультации
  const result = generatePaymentLink({
    amount: 5000,
    description: 'Консультация',
  });

  console.log('✅ ССЫЛКА НА ОПЛАТУ СГЕНЕРИРОВАНА:');
  console.log('');
  console.log('🔗 Ссылка для оплаты:');
  console.log(result.paymentUrl);
  console.log('');
  console.log('📋 Детали платежа:');
  console.log(`💰 Сумма: ${result.amount} руб.`);
  console.log(`🆔 Номер счета: ${result.invoiceId}`);
  console.log(`📝 Описание: ${result.description}`);
  console.log(`🧪 Тестовый режим: ${result.isTest ? 'Да' : 'Нет'}`);
  console.log(`🔐 Подпись: ${result.signature}`);
  console.log('');
  console.log('🎯 ГОТОВАЯ ССЫЛКА ДЛЯ КОПИРОВАНИЯ:');
  console.log('='.repeat(70));
  console.log(result.paymentUrl);
  console.log('='.repeat(70));

  // Проверяем формат ссылки
  const url = new URL(result.paymentUrl);
  console.log('');
  console.log('🔍 Проверка параметров:');
  console.log(`✅ MerchantLogin: ${url.searchParams.get('MerchantLogin')}`);
  console.log(`✅ OutSum: ${url.searchParams.get('OutSum')}`);
  console.log(`✅ invoiceID: ${url.searchParams.get('invoiceID')}`);
  console.log(
    `✅ Description: ${decodeURIComponent(url.searchParams.get('Description'))}`
  );
  console.log(`✅ SignatureValue: ${url.searchParams.get('SignatureValue')}`);
  console.log(`✅ IsTest: ${url.searchParams.get('IsTest')}`);
}

module.exports = {
  generatePaymentLink,
  // generateClubSubscriptionLink, // Удалено: функция для клуба
  ROBOKASSA_CONFIG,
};
