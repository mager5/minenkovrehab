# 🚀 Быстрый деплой на Railway

## ✅ Готово к деплою!

Все файлы подготовлены и код отправлен в GitHub.

## 📋 Чек-лист деплоя

### 1. Создание проекта на Railway (5 минут)

1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Выберите: `mager5/minenkovrehab`
5. **ВАЖНО:** Установите **Root Directory** = `robokassa-api`

### 2. Переменные окружения (3 минуты)

В разделе **Variables** добавьте:

```
ROBOKASSA_LOGIN=Minenkov-2
ROBOKASSA_PASSWORD1=password_1
ROBOKASSA_PASSWORD2=password_2
ROBOKASSA_TEST_PASSWORD1=Eld5Xljk2GBN4D6TJo3N
ROBOKASSA_TEST_PASSWORD2=gWtiI5Li9nqojQcc1f60
ROBOKASSA_TEST_MODE=true
NODE_ENV=production
ALLOWED_ORIGINS=https://minenkovrehab.github.io,https://minenkovrehab.ru,http://localhost:3000
```

### 3. Получение Railway URL (1 минута)

После деплоя скопируйте URL: `https://minenkovrehab-production-15cc.up.railway.app`

### 4. Настройка Robokassa (2 минуты)

В панели Robokassa установите:
- **Result URL:** `https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/result`
- **Success URL:** `https://minenkovrehab.github.io/payment/success`
- **Fail URL:** `https://minenkovrehab.github.io/payment/fail`

### 5. Проверка (1 минута)

```bash
curl https://minenkovrehab-production-15cc.up.railway.app/health
```

## 🎯 Итого: ~12 минут до полной работы!

---

**Подробная инструкция:** См. `RAILWAY_DEPLOY.md`