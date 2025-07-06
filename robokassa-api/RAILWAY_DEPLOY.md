# Деплой Robokassa API на Railway

Пошаговая инструкция по развертыванию API на Railway.

## 🚀 Шаги деплоя

### 1. Подготовка проекта

1. Убедитесь, что все файлы созданы:
   - `package.json`
   - `server.js`
   - `routes/robokassa.js`
   - `utils/signature.js`
   - `utils/validation.js`
   - `.env.example`
   - `.gitignore`

2. Инициализируйте git репозиторий (если еще не сделано):
   ```bash
   cd robokassa-api
   git init
   git add .
   git commit -m "Initial commit: Robokassa API"
   ```

### 2. Создание проекта на Railway

1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите ваш репозиторий с кодом
6. **КРИТИЧЕСКИ ВАЖНО:** Railway должен использовать папку `robokassa-api` как корневую
   - В настройках проекта Railway найдите "Root Directory"
   - Установите значение: `robokassa-api`
   - Это предотвратит ошибку "next start does not work with output: export"
   - Railway должен видеть только содержимое папки `robokassa-api`, а не основной Next.js проект

### 3. Настройка переменных окружения

В панели Railway перейдите в раздел "Variables" и добавьте:

#### Обязательные переменные:
```
ROBOKASSA_LOGIN=ваш_логин_магазина
ROBOKASSA_PASSWORD1=ваш_пароль_1
ROBOKASSA_PASSWORD2=ваш_пароль_2
ROBOKASSA_TEST_PASSWORD1=ваш_тестовый_пароль_1
ROBOKASSA_TEST_PASSWORD2=ваш_тестовый_пароль_2
ROBOKASSA_TEST_MODE=true
FRONTEND_URL=https://minenkovrehab.github.io
NODE_ENV=production
```

#### Опциональные переменные:
```
PORT=3000
ALLOWED_ORIGINS=https://minenkovrehab.github.io,http://localhost:3000
```

### 4. Получение данных от Robokassa

#### Для тестового режима:
1. Зарегистрируйтесь на [Robokassa](https://robokassa.com)
2. Перейдите в "Технические настройки"
3. Создайте тестовый магазин
4. Получите:
   - Логин магазина
   - Пароль #1 (для тестов)
   - Пароль #2 (для тестов)

#### Для продакшена:
1. Пройдите модерацию магазина
2. Получите боевые пароли
3. Установите `ROBOKASSA_TEST_MODE=false`

### 5. Настройка Result URL в Robokassa

1. В панели Robokassa перейдите в "Технические настройки"
2. Установите Result URL: `https://minenkovrehab-production.up.railway.app/api/robokassa/result`
3. Установите Success URL: `https://minenkovrehab-production.up.railway.app/payment/success`
4. Установите Fail URL: `https://minenkovrehab-production.up.railway.app/payment/fail`
5. Выберите метод отправки данных: POST

### 6. Проверка деплоя

1. После деплоя Railway предоставит URL вашего приложения
2. Проверьте работоспособность:
   ```bash
   curl https://minenkovrehab-production.up.railway.app/health
   ```

3. Проверьте конфигурацию:
   ```bash
   curl https://minenkovrehab-production.up.railway.app/api/robokassa/config
   ```

### 7. Обновление фронтенда

1. Создайте `.env.local` в корне фронтенда:
   ```
   NEXT_PUBLIC_ROBOKASSA_API_URL=https://minenkovrehab-production.up.railway.app
   ```

2. Для GitHub Pages добавьте переменную в Actions secrets:
   - Имя: `NEXT_PUBLIC_ROBOKASSA_API_URL`
   - Значение: `https://minenkovrehab-production.up.railway.app`

### 8. Тестирование интеграции

1. Откройте ваш сайт
2. Попробуйте оформить платеж
3. Проверьте, что:
   - Генерируется корректный URL
   - Происходит перенаправление на Robokassa
   - После оплаты возврат на Success/Fail страницы

## 🔧 Troubleshooting

### Проблема: "next start does not work with output: export" configuration

**Симптомы:**
```
Error: "next start" does not work with "output: export" configuration. Use "npx serve@latest out" instead.
```

**Причина:**
Railway пытается запустить основной Next.js проект вместо Robokassa API.

**Решение:**
1. **Установите Root Directory в Railway:**
   - Зайдите в настройки проекта Railway
   - Найдите "Root Directory" или "Source Directory"
   - Установите значение: `robokassa-api`
   - Сохраните изменения

2. **Проверьте файлы конфигурации:**
   - `railway.json` должен быть в папке `robokassa-api`
   - `nixpacks.toml` должен быть в папке `robokassa-api`
   - `package.json` должен быть в папке `robokassa-api`

3. **Пересоздайте деплой:**
   - Нажмите "Redeploy" в Railway
   - Или сделайте новый коммит в репозиторий

### Проблема: Railway не находит файлы API

**Симптомы:**
- Railway показывает ошибки связанные с Next.js
- Не находит файлы API

**Решение:**
1. Убедитесь что Root Directory установлен как `robokassa-api`
2. Проверьте что файлы `railway.json` и `nixpacks.toml` находятся в папке `robokassa-api`
3. Пересоздайте проект на Railway если необходимо

### Проблема: 500 Internal Server Error
**Решение:** Проверьте логи в Railway и переменные окружения

### Проблема: CORS ошибки
**Решение:** Убедитесь, что `FRONTEND_URL` и `ALLOWED_ORIGINS` настроены правильно

### Проблема: Неверная подпись
**Решение:** Проверьте пароли в Robokassa и переменных окружения

### Проблема: Result URL не работает
**Решение:** 
1. Проверьте URL в настройках Robokassa
2. Убедитесь, что используется POST метод
3. Проверьте логи Railway

## 📝 Полезные команды

### Просмотр логов Railway:
```bash
railway logs
```

### Локальная разработка с Railway переменными:
```bash
railway run npm run dev
```

### Проверка переменных окружения:
```bash
curl https://minenkovrehab-production.up.railway.app/api/robokassa/config
```

## 🔐 Безопасность

1. **Никогда не коммитьте .env файлы**
2. **Используйте разные пароли для тестов и продакшена**
3. **Регулярно меняйте пароли**
4. **Мониторьте логи на подозрительную активность**

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Railway
2. Убедитесь в правильности всех URL
3. Проверьте настройки в Robokassa
4. Используйте тестовый режим для отладки