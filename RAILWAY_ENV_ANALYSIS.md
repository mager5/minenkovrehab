# 🔍 Анализ критичности переменной FRONTEND_URL на Railway

## ❌ Проблема

Сообщение `'FRONTEND_URL не установлен, будет использован localhost'` указывает на отсутствие переменной окружения `FRONTEND_URL` в Railway.

## 🚨 Критичность: **ВЫСОКАЯ**

### Почему это критично?

1. **CORS блокировка** - без правильного FRONTEND_URL запросы с фронтенда будут заблокированы
2. **Безопасность** - localhost не подходит для продакшена
3. **Функциональность** - API не сможет корректно обрабатывать запросы от реального сайта

## 📋 Текущая конфигурация CORS

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',  // ❌ Проблема здесь
  'https://minenkovrehab.github.io',                    // ✅ Статический домен
  'https://minenkovrehab.ru'                           // ✅ Основной домен
];
```

## 🔧 Решение

### 1. Установить переменную FRONTEND_URL в Railway

```bash
# В Railway Dashboard или через CLI:
FRONTEND_URL=https://minenkovrehab.ru
```

### 2. Альтернативные варианты

```javascript
// Вариант 1: Множественные домены
FRONTEND_URL=https://minenkovrehab.ru,https://minenkovrehab.github.io

// Вариант 2: Основной домен
FRONTEND_URL=https://minenkovrehab.ru

// Вариант 3: Для разработки
FRONTEND_URL=http://localhost:3000
```

## 🛠️ Рекомендуемые переменные окружения для Railway

```env
# Основные настройки
NODE_ENV=production
PORT=3000

# Фронтенд
FRONTEND_URL=https://minenkovrehab.ru

# Robokassa (продакшен)
ROBOKASSA_LOGIN=Minenkov-2
ROBOKASSA_PASSWORD1=ваш_реальный_пароль_1
ROBOKASSA_PASSWORD2=ваш_реальный_пароль_2
ROBOKASSA_TEST_MODE=false

# Безопасность
ALLOWED_ORIGINS=https://minenkovrehab.ru,https://minenkovrehab.github.io
```

## 🚀 Немедленные действия

1. **Установить FRONTEND_URL** в Railway Dashboard
2. **Перезапустить сервис** Railway
3. **Протестировать** CORS запросы
4. **Проверить** логи Railway на ошибки

## 🔍 Проверка после исправления

```bash
# Тест CORS с правильным Origin
curl -H "Origin: https://minenkovrehab.ru" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://robokassa-api-production.up.railway.app/api/robokassa-sdk/generate-payment-url
```

## 📊 Влияние на функциональность

| Функция | Без FRONTEND_URL | С FRONTEND_URL |
|---------|------------------|----------------|
| API запросы | ❌ Блокированы | ✅ Работают |
| Платежи | ❌ Не работают | ✅ Работают |
| CORS | ❌ Ошибки | ✅ Корректно |
| Безопасность | ❌ Уязвимо | ✅ Защищено |

## 🎯 Заключение

Отсутствие `FRONTEND_URL` на Railway **критично** и блокирует работу API с фронтендом. Необходимо немедленно установить эту переменную для корректной работы платежной системы.