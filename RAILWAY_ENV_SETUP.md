# 🔧 Настройка Environment Variables на Railway

## ❌ Проблема
API работает, но ссылки оплаты генерируются с пустым `MerchantLogin`, что означает отсутствие настроенных environment variables на Railway.

## ✅ Решение
Нужно настроить следующие environment variables в Railway Dashboard:

### 🔑 Обязательные переменные

```bash
# Основные настройки Robokassa
ROBOKASSA_LOGIN=Minenkov-2
ROBOKASSA_PASSWORD_1=password_1
ROBOKASSA_PASSWORD_2=password_2

# Тестовые пароли (для тестового режима)
ROBOKASSA_TEST_PASSWORD1=Eld5Xljk2GBN4D6TJo3N
ROBOKASSA_TEST_PASSWORD2=gWtiI5Li9nqojQcc1f60

# Режим работы
ROBOKASSA_TEST_MODE=true

# URL фронтенда
FRONTEND_URL=https://minenkovrehab.github.io

# Настройки сервера
PORT=3000
NODE_ENV=production

# CORS настройки
ALLOWED_ORIGINS=https://minenkovrehab.github.io,https://minenkovrehab.ru
```

## 🚀 Как настроить в Railway

### Способ 1: Через Railway Dashboard
1. Откройте [Railway Dashboard](https://railway.app/dashboard)
2. Выберите ваш проект `minenkovrehab`
3. Перейдите в раздел **Variables**
4. Добавьте каждую переменную из списка выше
5. Нажмите **Deploy** для применения изменений

### Способ 2: Через Railway CLI (если установлен)
```bash
# Установка Railway CLI (если не установлен)
npm install -g @railway/cli

# Логин в Railway
railway login

# Переход в проект
railway link

# Добавление переменных
railway variables set ROBOKASSA_LOGIN=Minenkov-2
railway variables set ROBOKASSA_PASSWORD_1=password_1
railway variables set ROBOKASSA_PASSWORD_2=password_2
railway variables set ROBOKASSA_TEST_PASSWORD1=Eld5Xljk2GBN4D6TJo3N
railway variables set ROBOKASSA_TEST_PASSWORD2=gWtiI5Li9nqojQcc1f60
railway variables set ROBOKASSA_TEST_MODE=true
railway variables set FRONTEND_URL=https://minenkovrehab.github.io
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=https://minenkovrehab.github.io,https://minenkovrehab.ru

# Деплой
railway up
```

## 🔍 Проверка после настройки

После настройки environment variables запустите тест:

```bash
node test-railway-deployment.js
```

Или проверьте вручную:

```bash
curl -X POST https://minenkovrehab-production-15cc.up.railway.app/api/robokassa-sdk/generate-payment-url \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+79001234567",
    "amount": 2950,
    "description": "Абонемент клуба формула движения"
  }'
```

## ✅ Ожидаемый результат

После настройки переменных ссылка должна содержать:
- `MerchantLogin=Minenkov-2` (не пустой!)
- `OutSum=2950`
- `Description=Абонемент клуба формула движения`
- `IsTest=1`
- Корректную подпись `SignatureValue`

## 🚨 Важные замечания

1. **Безопасность**: Никогда не коммитьте реальные пароли в git
2. **Тестовый режим**: Сейчас используется `ROBOKASSA_TEST_MODE=true`
3. **Продакшн**: Для продакшна измените `NODE_ENV=production` и `ROBOKASSA_TEST_MODE=false`
4. **Домены**: Добавьте все нужные домены в `ALLOWED_ORIGINS`

## 🔄 После настройки

Railway автоматически перезапустит приложение после изменения environment variables. Подождите 1-2 минуты и протестируйте API снова.