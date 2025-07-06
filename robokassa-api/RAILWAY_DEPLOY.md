# 🚂 Деплой Robokassa API на Railway

Пошаговая инструкция по развертыванию API на Railway.

## ✅ Подготовка завершена

- ✅ Git репозиторий инициализирован
- ✅ Код отправлен в GitHub
- ✅ Файлы конфигурации созданы
- ✅ ESLint настроен для Node.js

## 🚀 Шаги деплоя на Railway

### 1. Создание проекта на Railway

1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите репозиторий: `mager5/minenkovrehab`
6. **КРИТИЧЕСКИ ВАЖНО:** Установите Root Directory:
   - В настройках проекта найдите **"Root Directory"**
   - Установите значение: `robokassa-api`
   - Это предотвратит ошибку с Next.js

### 2. Настройка переменных окружения в Railway

Перейдите в раздел **"Variables"** и добавьте следующие переменные:

```bash
# Основные настройки Robokassa
ROBOKASSA_LOGIN=demo
ROBOKASSA_PASSWORD1=password_1
ROBOKASSA_PASSWORD2=password_2
ROBOKASSA_TEST_PASSWORD1=password_1
ROBOKASSA_TEST_PASSWORD2=password_2

# Режим работы
ROBOKASSA_TEST_MODE=true

# Окружение
NODE_ENV=production

# CORS домены
ALLOWED_ORIGINS=https://minenkovrehab.github.io,https://minenkovrehab.ru,http://localhost:3000
```

**Примечание:** Railway автоматически установит `PORT` и `RAILWAY_PUBLIC_DOMAIN`

### 3. Получение реальных данных от Robokassa

#### Для тестового режима:
1. Зарегистрируйтесь на [Robokassa](https://robokassa.com)
2. Перейдите в **"Технические настройки"**
3. Создайте тестовый магазин
4. Получите тестовые пароли

#### Для продакшена:
1. Пройдите модерацию магазина
2. Получите боевые пароли
3. Установите `ROBOKASSA_TEST_MODE=false`

### 4. Настройка URL в Robokassa

После деплоя Railway предоставит URL (например: `https://robokassa-api-production.up.railway.app`)

В панели Robokassa установите:
- **Result URL:** `https://ваш-railway-url.up.railway.app/api/robokassa/result`
- **Success URL:** `https://minenkovrehab.github.io/payment/success`
- **Fail URL:** `https://minenkovrehab.github.io/payment/fail`
- **Метод:** POST

### 5. Проверка деплоя

После успешного деплоя проверьте:

```bash
# Health check
curl https://ваш-railway-url.up.railway.app/health

# Информация об API
curl https://ваш-railway-url.up.railway.app/

# Тест генерации платежа
curl -X POST https://ваш-railway-url.up.railway.app/api/robokassa/generate-payment-url \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "email": "test@example.com",
    "phone": "+79001234567",
    "description": "Тестовый платеж"
  }'
```

### 6. Обновление локального API

Теперь нужно обновить локальный API, чтобы он использовал Railway URL для ResultURL:

1. Откройте `robokassa-api/routes/robokassa.js`
2. Найдите строку с `ResultURL`
3. Замените на Railway URL:

```javascript
ResultURL: `https://ваш-railway-url.up.railway.app/api/robokassa/result`,
```

### 7. Обновление фронтенда

Обновите переменные окружения фронтенда:

```bash
# В .env.local
NEXT_PUBLIC_ROBOKASSA_API_URL=https://ваш-railway-url.up.railway.app

# В GitHub Actions secrets
NEXT_PUBLIC_ROBOKASSA_API_URL=https://ваш-railway-url.up.railway.app
```

## 🔧 Troubleshooting

### Проблема: "next start does not work with output: export"
**Решение:** Убедитесь, что Root Directory установлен как `robokassa-api`

### Проблема: 500 Internal Server Error
**Решение:** Проверьте логи в Railway и переменные окружения

### Проблема: CORS ошибки
**Решение:** Добавьте ваш домен в `ALLOWED_ORIGINS`

### Проблема: Неверная подпись
**Решение:** Проверьте пароли Robokassa

## 📝 Полезные команды Railway CLI

```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Просмотр логов
railway logs

# Локальная разработка с Railway переменными
railway run npm run dev
```

## 🎯 Следующие шаги

1. ✅ Код подготовлен и отправлен в GitHub
2. 🔄 **СЕЙЧАС:** Создайте проект на Railway
3. 🔄 **ДАЛЕЕ:** Настройте переменные окружения
4. 🔄 **ДАЛЕЕ:** Обновите URL в Robokassa
5. 🔄 **ДАЛЕЕ:** Протестируйте интеграцию

## 🔐 Безопасность

- ✅ .env файлы исключены из git
- ✅ Используются переменные окружения
- ✅ CORS настроен правильно
- ✅ Helmet middleware подключен

---

**Готово к деплою!** 🚀

Теперь можете создавать проект на Railway и следовать инструкции выше.