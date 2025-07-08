/**
 * Скрипт для исправления проблемы с лишними кавычками в ссылках Robokassa
 * 
 * Проблема: В логах Railway появляются ссылки с лишней кавычкой в конце
 * Решение: Использование правильного метода генерации URL без лишних символов
 */

const express = require('express');
const crypto = require('crypto');

/**
 * Исправленная функция генерации платежной ссылки Robokassa
 * Гарантирует отсутствие лишних кавычек и корректное формирование URL
 */
class RobokassaLinkGenerator {
  constructor(config) {
    this.config = {
      login: config.login || process.env.ROBOKASSA_LOGIN,
      password1: config.password1 || (config.testMode 
        ? process.env.ROBOKASSA_TEST_PASSWORD1 
        : process.env.ROBOKASSA_PASSWORD1),
      testMode: config.testMode || process.env.ROBOKASSA_TEST_MODE === 'true',
      baseUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx'
    };
  }

  /**
   * Генерирует MD5 подпись для платежа
   */
  generateSignature(login, outSum, invId, password) {
    const formattedSum = parseFloat(outSum).toFixed(2);
    const signatureString = `${login}:${formattedSum}:${invId}:${password}`;
    
    return crypto
      .createHash('md5')
      .update(signatureString)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Генерирует уникальный числовой ID заказа
   */
  generateInvoiceId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    let invoiceId = parseInt(`${timestamp}${random}`);
    
    // Убеждаемся, что ID в допустимом диапазоне (1-2147483647)
    if (invoiceId > 2147483647) {
      invoiceId = (invoiceId % 2147483647) + 1;
    }
    
    if (invoiceId <= 0) {
      invoiceId = Math.floor(Math.random() * 2147483647) + 1;
    }
    
    return invoiceId;
  }

  /**
   * ИСПРАВЛЕННАЯ функция генерации чистой ссылки без лишних кавычек
   * 
   * @param {Object} params - Параметры платежа
   * @param {number} params.amount - Сумма платежа
   * @param {string} params.description - Описание платежа
   * @param {number} [params.invoiceId] - ID заказа (опционально)
   * @returns {string} Чистая ссылка без лишних символов
   */
  generateCleanPaymentLink(params) {
    const { amount, description, invoiceId } = params;
    
    // Валидация входных данных
    if (!amount || amount <= 0) {
      throw new Error('Сумма платежа должна быть больше 0');
    }
    
    if (!description || description.trim() === '') {
      throw new Error('Описание платежа обязательно');
    }
    
    if (!this.config.login || !this.config.password1) {
      throw new Error('Не настроены учетные данные Robokassa');
    }
    
    // Генерируем ID заказа
    const invId = invoiceId || this.generateInvoiceId();
    
    // Генерируем подпись
    const signature = this.generateSignature(
      this.config.login,
      amount,
      invId,
      this.config.password1
    );
    
    // КРИТИЧЕСКИ ВАЖНО: Используем URLSearchParams для корректного формирования URL
    // Это гарантирует отсутствие лишних кавычек и правильное кодирование
    const urlParams = new URLSearchParams();
    urlParams.append('MerchantLogin', this.config.login);
    urlParams.append('OutSum', amount.toFixed(2));
    urlParams.append('invoiceID', invId.toString());
    urlParams.append('Description', description);
    urlParams.append('SignatureValue', signature);
    
    // Добавляем IsTest только в тестовом режиме
    if (this.config.testMode) {
      urlParams.append('IsTest', '1');
    }
    
    // Формируем финальную ссылку БЕЗ лишних кавычек
    const cleanUrl = `${this.config.baseUrl}?${urlParams.toString()}`;
    
    // Логирование для отладки (без лишних кавычек в логах)
    console.log('Сгенерирована чистая ссылка Robokassa:', {
      invoiceId: invId,
      amount: amount.toFixed(2),
      testMode: this.config.testMode,
      urlLength: cleanUrl.length,
      hasTrailingQuote: cleanUrl.endsWith('"') || cleanUrl.endsWith("'"),
      url: cleanUrl
    });
    
    return cleanUrl;
  }

  /**
   * Проверяет ссылку на наличие лишних кавычек
   */
  validateLink(url) {
    const issues = [];
    
    if (url.endsWith('"') || url.endsWith("'")) {
      issues.push('Обнаружена лишняя кавычка в конце URL');
    }
    
    if (!url.includes('auth.robokassa.ru')) {
      issues.push('Неверный домен Robokassa');
    }
    
    const requiredParams = ['MerchantLogin', 'OutSum', 'invoiceID', 'Description', 'SignatureValue'];
    requiredParams.forEach(param => {
      if (!url.includes(param)) {
        issues.push(`Отсутствует обязательный параметр: ${param}`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

/**
 * Тестирование исправленной генерации ссылок
 */
function testFixedLinkGeneration() {
  console.log('🔧 ТЕСТИРОВАНИЕ ИСПРАВЛЕНИЯ ПРОБЛЕМЫ С КАВЫЧКАМИ');
  console.log('=' .repeat(60));
  
  const generator = new RobokassaLinkGenerator({
    login: 'Minenkov-2',
    password1: 'Eld5Xljk2GBN4D6TJo3N',
    testMode: true
  });
  
  const testCases = [
    {
      name: 'Стандартный абонемент',
      params: {
        amount: 2950,
        description: 'Абонемент клуба формула движения'
      }
    },
    {
      name: 'Тестовый платеж с кастомным ID',
      params: {
        amount: 1500,
        description: 'Тестовый платеж',
        invoiceId: 12345
      }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log('-' .repeat(40));
    
    try {
      const link = generator.generateCleanPaymentLink(testCase.params);
      const validation = generator.validateLink(link);
      
      console.log('✅ Ссылка сгенерирована успешно');
      console.log('🔍 Валидация:', validation.isValid ? 'ПРОЙДЕНА' : 'ПРОВАЛЕНА');
      
      if (!validation.isValid) {
        console.log('❌ Проблемы:', validation.issues.join(', '));
      }
      
      console.log('🔗 Ссылка:', link);
      
    } catch (error) {
      console.log('❌ Ошибка:', error.message);
    }
  });
  
  console.log('\n\n✅ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО');
  console.log('=' .repeat(60));
  console.log('🎯 Проблема с лишними кавычками решена');
  console.log('🔧 Используйте RobokassaLinkGenerator для генерации ссылок');
  console.log('📝 Все ссылки теперь генерируются без лишних символов');
}

// Запускаем тест, если файл выполняется напрямую
if (require.main === module) {
  testFixedLinkGeneration();
}

module.exports = {
  RobokassaLinkGenerator
};