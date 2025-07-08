/**
 * Валидация параметров для генерации платежного URL
 * 
 * @param {Object} params - Параметры запроса
 * @param {string} params.email - Email пользователя
 * @param {string} params.phone - Телефон пользователя
 * @param {number} params.amount - Сумма платежа
 * @param {string} [params.description] - Описание платежа
 * @returns {Object} Результат валидации
 */
function validatePaymentParams(params) {
  const errors = [];
  
  // Проверка email (необязательно)
  if (params.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    errors.push('Некорректный формат email');
  }
  
  // Проверка телефона (необязательно)
  if (params.phone && !/^\+?[1-9]\d{1,14}$/.test(params.phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Некорректный формат телефона');
  }
  
  // Старая валидация (закомментирована)
  /*
  // Проверка email
  if (!params.email) {
    errors.push('Email обязателен');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    errors.push('Некорректный формат email');
  }
  
  // Проверка телефона
  if (!params.phone) {
    errors.push('Телефон обязателен');
  } else if (!/^\+?[1-9]\d{1,14}$/.test(params.phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Некорректный формат телефона');
  }
  */
  
  // Проверка суммы
  if (!params.amount) {
    errors.push('Сумма платежа обязательна');
  } else if (typeof params.amount !== 'number' || params.amount <= 0) {
    errors.push('Сумма должна быть положительным числом');
  } else if (params.amount < 1) {
    errors.push('Минимальная сумма платежа: 1 рубль');
  } else if (params.amount > 1000000) {
    errors.push('Максимальная сумма платежа: 1,000,000 рублей');
  }
  
  // Проверка описания (опционально)
  if (params.description && params.description.length > 255) {
    errors.push('Описание не должно превышать 255 символов');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Валидация параметров Result URL от Robokassa
 * 
 * @param {Object} params - Параметры от Robokassa
 * @param {number} params.OutSum - Сумма платежа
 * @param {string} params.InvId - ID заказа
 * @param {string} params.SignatureValue - Подпись
 * @returns {Object} Результат валидации
 */
function validateResultParams(params) {
  const errors = [];
  
  // Проверка суммы
  if (!params.OutSum) {
    errors.push('OutSum обязателен');
  } else if (isNaN(parseFloat(params.OutSum))) {
    errors.push('OutSum должен быть числом');
  }
  
  // Проверка InvId
  if (!params.InvId) {
    errors.push('InvId обязателен');
  } else {
    // Старая валидация для строкового InvId (закомментирована)
    // if (typeof params.InvId !== 'string' || params.InvId.trim().length === 0) {
    //   errors.push('InvId должен быть непустой строкой');
    // }
    
    // Новая валидация для числового InvId (требование Robokassa)
    const invIdNum = parseInt(params.InvId);
    if (isNaN(invIdNum) || invIdNum < 1 || invIdNum > 2147483647) {
      errors.push('InvId должен быть числом от 1 до 2147483647');
    }
  }
  
  // Проверка подписи
  if (!params.SignatureValue) {
    errors.push('SignatureValue обязателен');
  } else if (typeof params.SignatureValue !== 'string' || params.SignatureValue.length !== 32) {
    errors.push('SignatureValue должен быть MD5 хешем (32 символа)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Валидация переменных окружения
 * 
 * @returns {Object} Результат валидации
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];
  
  // Проверка логина (обязательно)
  if (!process.env.ROBOKASSA_LOGIN) {
    errors.push('Переменная окружения ROBOKASSA_LOGIN не установлена');
  }
  
  // Проверка паролей (для тестирования можно работать без них, но с предупреждениями)
  if (!process.env.ROBOKASSA_PASSWORD1) {
    warnings.push('Переменная окружения ROBOKASSA_PASSWORD1 не установлена - генерация платежных ссылок может не работать');
  }
  
  if (!process.env.ROBOKASSA_PASSWORD2) {
    warnings.push('Переменная окружения ROBOKASSA_PASSWORD2 не установлена - проверка подписей Result URL может не работать');
  }
  
  // Проверка тестовых переменных в тестовом режиме
  if (process.env.ROBOKASSA_TEST_MODE === 'true') {
    if (!process.env.ROBOKASSA_TEST_PASSWORD1) {
      warnings.push('Тестовая переменная ROBOKASSA_TEST_PASSWORD1 не установлена - генерация тестовых платежных ссылок может не работать');
    }
    if (!process.env.ROBOKASSA_TEST_PASSWORD2) {
      warnings.push('Тестовая переменная ROBOKASSA_TEST_PASSWORD2 не установлена - проверка тестовых подписей Result URL может не работать');
    }
  }
  
  // Проверка URL фронтенда
  if (!process.env.FRONTEND_URL) {
    warnings.push('FRONTEND_URL не установлен, будет использован localhost');
  }
  
  // Выводим предупреждения в консоль
  if (warnings.length > 0) {
    console.warn('⚠️ Предупреждения конфигурации:', warnings);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Санитизация строки для безопасности
 * 
 * @param {string} str - Входная строка
 * @returns {string} Очищенная строка
 */
function sanitizeString(str) {
  if (typeof str !== 'string') {
    return '';
  }
  
  return str
    .trim()
    .replace(/[<>&]/g, '') // Удаляем потенциально опасные символы (убрали кавычки)
    .substring(0, 255); // Ограничиваем длину
}

/**
 * Нормализация номера телефона
 * 
 * @param {string} phone - Номер телефона
 * @returns {string} Нормализованный номер
 */
function normalizePhone(phone) {
  if (typeof phone !== 'string') {
    return '';
  }
  
  // Удаляем все символы кроме цифр и +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Если номер начинается с 8, заменяем на +7
  if (normalized.startsWith('8')) {
    normalized = '+7' + normalized.substring(1);
  }
  
  // Если номер начинается с 7, добавляем +
  if (normalized.startsWith('7') && !normalized.startsWith('+7')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}

/**
 * Валидация параметров Success URL от Robokassa
 * 
 * @param {Object} params - Параметры от Robokassa
 * @param {number} params.OutSum - Сумма платежа
 * @param {string} params.InvId - ID заказа
 * @param {string} params.SignatureValue - Подпись
 * @returns {Object} Результат валидации
 */
function validateSuccessParams(params) {
  const errors = [];
  
  // Проверка суммы
  if (!params.OutSum) {
    errors.push('OutSum обязателен');
  } else if (isNaN(parseFloat(params.OutSum))) {
    errors.push('OutSum должен быть числом');
  }
  
  // Проверка InvId
  if (!params.InvId) {
    errors.push('InvId обязателен');
  } else {
    // Старая валидация для строкового InvId (закомментирована)
    // if (typeof params.InvId !== 'string' || params.InvId.trim().length === 0) {
    //   errors.push('InvId должен быть непустой строкой');
    // }
    
    // Новая валидация для числового InvId (требование Robokassa)
    const invIdNum = parseInt(params.InvId);
    if (isNaN(invIdNum) || invIdNum < 1 || invIdNum > 2147483647) {
      errors.push('InvId должен быть числом от 1 до 2147483647');
    }
  }
  
  // Проверка подписи
  if (!params.SignatureValue) {
    errors.push('SignatureValue обязателен');
  } else if (typeof params.SignatureValue !== 'string' || params.SignatureValue.length !== 32) {
    errors.push('SignatureValue должен быть MD5 хешем (32 символа)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validatePaymentParams,
  validateResultParams,
  validateSuccessParams,
  validateEnvironment,
  sanitizeString,
  normalizePhone
};