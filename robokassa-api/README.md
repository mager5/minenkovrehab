# Robokassa API для minenkovrehab.ru

Бэкенд API для интеграции с платежной системой Robokassa.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Скопируйте `.env.example` в `.env` и заполните необходимые значения:
```bash
cp .env.example .env
```

### 3. Запуск сервера
```bash
# Режим разработки
npm run dev

# Продакшен
npm start
```

## 📋 API Endpoints

### POST /api/robokassa/generate-payment-url
Генерация URL для оплаты через Robokassa.

**Параметры запроса:**
```json
{
  "email": "user@example.com",
  "phone": "+7 (999) 123-45-67",
  "amount": 5000,
  "description": "Оплата абонемента"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://auth.robokassa.ru/Merchant/Index.aspx?...",
    "invoiceId": "INV_1234567890",
    "amount": 5000,
    "description": "Оплата абонемента",
    "testMode": true
  }
}
```

### POST /api/robokassa/result
Обработка Result URL от Robokassa (webhook).

**Параметры (от Robokassa):**
- `OutSum` - сумма платежа
- `InvId` - ID заказа
- `SignatureValue` - подпись

**Ответ:** `OK{InvId}` при успешной обработке

### GET /api/robokassa/verify-signature
Проверка подписи (для отладки).

**Параметры:**
- `outSum` - сумма
- `invId` - ID заказа
- `signature` - подпись для проверки
- `type` - тип подписи (`result` или `success`)

### GET /api/robokassa/config
Получение текущей конфигурации (для отладки).

### GET /health
Проверка состояния сервера.

## 🔧 Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|-------------|
| `ROBOKASSA_LOGIN` | Логин магазина в Robokassa | ✅ |
| `ROBOKASSA_PASSWORD1` | Пароль #1 (для генерации подписи платежа) | ✅ |
| `ROBOKASSA_PASSWORD2` | Пароль #2 (для проверки Result URL) | ✅ |
| `ROBOKASSA_TEST_PASSWORD1` | Тестовый пароль #1 | ✅ |
| `ROBOKASSA_TEST_PASSWORD2` | Тестовый пароль #2 | ✅ |
| `ROBOKASSA_TEST_MODE` | Режим работы (`true`/`false`) | ✅ |
| `FRONTEND_URL` | URL фронтенда | ✅ |
| `PORT` | Порт сервера | ❌ (по умолчанию 3000) |
| `NODE_ENV` | Окружение | ❌ |
| `ALLOWED_ORIGINS` | Разрешенные домены для CORS | ❌ |

## 🔐 Безопасность

- Все подписи генерируются и проверяются с использованием MD5
- Валидация всех входящих параметров
- Санитизация пользовательских данных
- CORS настройки для ограничения доступа
- Helmet.js для базовой защиты
- Логирование всех операций

## 📁 Структура проекта

```
robokassa-api/
├── server.js              # Основной файл сервера
├── package.json           # Зависимости и скрипты
├── .env.example          # Пример переменных окружения
├── README.md             # Документация
├── routes/
│   └── robokassa.js      # Роуты для Robokassa API
└── utils/
    ├── signature.js      # Генерация и проверка подписей
    └── validation.js     # Валидация данных
```

## 🧪 Тестирование

### Локальное тестирование
1. Установите `ROBOKASSA_TEST_MODE=true`
2. Используйте тестовые пароли от Robokassa
3. Отправьте POST запрос на `/api/robokassa/generate-payment-url`
4. Перейдите по полученному URL и совершите тестовый платеж

### Проверка подписи
```bash
curl "http://localhost:3000/api/robokassa/verify-signature?outSum=5000&invId=INV_123&signature=ABC123&type=result"
```

### Проверка конфигурации
```bash
curl "http://localhost:3000/api/robokassa/config"
```

## 🚀 Деплой на Railway

1. Подключите репозиторий к Railway
2. Установите переменные окружения в панели Railway
3. Railway автоматически развернет приложение
4. Настройте Result URL в панели Robokassa: `https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/result`

## 📝 Логи

Сервер логирует:
- Все входящие запросы
- Генерацию платежных URL
- Обработку Result URL
- Ошибки валидации и обработки

## 🔄 Интеграция с фронтендом

Пример использования в React:

```javascript
const handlePayment = async (paymentData) => {
  try {
    const response = await fetch('https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/generate-payment-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Перенаправляем пользователя на страницу оплаты
      window.location.href = result.data.paymentUrl;
    } else {
      console.error('Ошибка:', result.error);
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
  }
};
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в правильности переменных окружения
3. Проверьте настройки в панели Robokassa
4. Используйте эндпоинт `/api/robokassa/config` для диагностики