# 🚀 План реализации интеграции Robokassa

## 📋 Общий обзор

Интеграция платежной системы Robokassa с использованием гибридной архитектуры:
- **Frontend**: GitHub Pages (статические страницы)
- **Backend**: Railway (API для обработки платежей)

---

## 🎯 Этап 1: Подготовка и настройка Railway

### 1.1 Создание проекта на Railway
- [ ] Зарегистрироваться на [Railway.app](https://railway.app)
- [ ] Создать новый проект для Robokassa API
- [ ] Выбрать план (Free tier для тестирования, Hobby $5/месяц для продакшена)
- [ ] Получить URL проекта (формат: `your-app.up.railway.app`)

### 1.2 Настройка переменных окружения на Railway
- [ ] `ROBOKASSA_LOGIN` - ID магазина (Shop ID)
- [ ] `ROBOKASSA_PASSWORD1` - Пароль #1 (для инициализации платежей)
- [ ] `ROBOKASSA_PASSWORD2` - Пароль #2 (для получения результатов)
- [ ] `ROBOKASSA_TEST_PASSWORD1` - Тестовый пароль #1
- [ ] `ROBOKASSA_TEST_PASSWORD2` - Тестовый пароль #2
- [ ] `ROBOKASSA_TEST_MODE` - `true` для тестирования, `false` для продакшена
- [ ] `FRONTEND_URL` - URL GitHub Pages сайта
- [ ] `NODE_ENV` - `production`

---

## 🛠 Этап 2: Разработка API на Railway

### 2.1 Создание структуры проекта
- [ ] Создать папку `robokassa-api/` в корне проекта
- [ ] Инициализировать Node.js проект (`package.json`)
- [ ] Установить зависимости:
  - [ ] `express` - веб-сервер
  - [ ] `cors` - для CORS политики
  - [ ] `crypto` - для генерации подписей MD5
  - [ ] `dotenv` - для переменных окружения
  - [ ] `helmet` - для безопасности

### 2.2 Основные API endpoints
- [ ] `POST /api/robokassa/generate-payment-url` - генерация URL для оплаты
- [ ] `POST /api/robokassa/result` - обработка Result URL от Robokassa
- [ ] `GET /api/robokassa/verify-signature` - проверка подписи
- [ ] `GET /health` - проверка состояния сервиса

### 2.3 Реализация функций безопасности
- [ ] Функция генерации MD5 подписи
- [ ] Функция проверки входящих подписей
- [ ] Валидация параметров запросов
- [ ] Логирование операций

---

## 🌐 Этап 3: Настройка фронтенда (GitHub Pages)

### 3.1 Создание статических страниц
- [ ] Создать `src/app/payment/success/page.tsx` (страница успешной оплаты)
- [ ] Создать `src/app/payment/fail/page.tsx` (страница неудачной оплаты)
- [ ] Добавить JavaScript для обработки GET параметров от Robokassa

### 3.2 Интеграция формы оплаты
- [ ] Создать компонент формы оплаты
- [ ] Добавить функцию отправки данных на Railway API
- [ ] Реализовать редирект на страницу Robokassa

### 3.3 Обработка параметров на Success/Fail страницах
- [ ] Извлечение параметров из URL:
  - [ ] `OutSum` - сумма платежа
  - [ ] `InvId` - ID заказа
  - [ ] `SignatureValue` - подпись
- [ ] Отображение информации о платеже
- [ ] Кнопка возврата на главную страницу

---

## ⚙️ Этап 4: Настройка Robokassa

### 4.1 Регистрация и настройка магазина
- [ ] Зарегистрироваться на [Robokassa.ru](https://robokassa.ru)
- [ ] Создать магазин и получить Shop ID
- [ ] Настроить пароли (основные и тестовые)

### 4.2 Технические настройки магазина
- [ ] **Result URL**: `https://your-app.up.railway.app/api/robokassa/result`
- [ ] **Success URL**: `https://your-github-pages.github.io/payment/success`
- [ ] **Fail URL**: `https://your-github-pages.github.io/payment/fail`
- [ ] **Метод передачи данных**: POST для Result URL, GET для Success/Fail URL
- [ ] **Алгоритм хеширования**: MD5

### 4.3 Настройка тестового режима
- [ ] Включить тестовый режим в настройках магазина
- [ ] Настроить тестовые пароли
- [ ] Проверить тестовые URL

---

## 🧪 Этап 5: Тестирование

### 5.1 Локальное тестирование
- [ ] Запустить Railway API локально
- [ ] Протестировать генерацию платежных URL
- [ ] Проверить обработку Result URL
- [ ] Тестировать проверку подписей

### 5.2 Интеграционное тестирование
- [ ] Развернуть API на Railway
- [ ] Обновить GitHub Pages с новыми страницами
- [ ] Провести тестовый платеж через Robokassa
- [ ] Проверить корректность редиректов
- [ ] Убедиться в получении уведомлений на Result URL

### 5.3 Тестирование безопасности
- [ ] Проверить валидацию подписей
- [ ] Тестировать обработку некорректных запросов
- [ ] Проверить CORS настройки

---

## 🚀 Этап 6: Деплой и продакшен

### 6.1 Подготовка к продакшену
- [ ] Переключить `ROBOKASSA_TEST_MODE` на `false`
- [ ] Обновить переменные окружения на Railway
- [ ] Настроить продакшен URL в Robokassa

### 6.2 Мониторинг и логирование
- [ ] Настроить логирование операций
- [ ] Добавить мониторинг доступности API
- [ ] Настроить уведомления об ошибках

### 6.3 Документация
- [ ] Создать документацию API
- [ ] Описать процесс обработки платежей
- [ ] Подготовить инструкции по поддержке

---

## 📁 Структура файлов проекта

```
minenkovrehab/
├── robokassa-api/                 # Новая папка для Railway API
│   ├── package.json
│   ├── server.js                  # Основной сервер
│   ├── routes/
│   │   └── robokassa.js          # Роуты для Robokassa
│   ├── utils/
│   │   ├── signature.js          # Функции для подписей
│   │   └── validation.js         # Валидация данных
│   └── .env.example              # Пример переменных окружения
├── src/app/payment/
│   ├── success/page.tsx          # ✅ Уже существует
│   ├── fail/page.tsx             # ✅ Уже существует
│   └── components/
│       └── PaymentForm.tsx       # Новый компонент формы оплаты
└── ROBOKASSA_INTEGRATION_PLAN.md # 📋 Этот файл
```

---

## 🔧 Технические детали

### Генерация подписи для платежа
```javascript
// MD5(MerchantLogin:OutSum:InvId:MerchantPass)
const signature = crypto
  .createHash('md5')
  .update(`${login}:${outSum}:${invId}:${password}`)
  .digest('hex');
```

### Проверка подписи Result URL
```javascript
// MD5(OutSum:InvId:MerchantPass2)
const expectedSignature = crypto
  .createHash('md5')
  .update(`${outSum}:${invId}:${password2}`)
  .digest('hex');
```

### Ответ на Result URL
```javascript
// Robokassa ожидает ответ "OK{InvId}"
res.send(`OK${invId}`);
```

---

## 💰 Стоимость решения

- **Railway Hobby Plan**: $5/месяц
- **GitHub Pages**: Бесплатно
- **Robokassa**: 2.9% с оборота + фиксированные комиссии

**Итого**: ~$5/месяц + комиссии за транзакции

---

## 📞 Поддержка и контакты

- **Robokassa Поддержка**: [support@robokassa.ru](mailto:support@robokassa.ru)
- **Railway Документация**: [docs.railway.app](https://docs.railway.app)
- **Robokassa API Документация**: [docs.robokassa.ru](https://docs.robokassa.ru)

---

## ✅ Прогресс выполнения

**Общий прогресс**: 0/50 задач выполнено (0%)

- **Этап 1**: 0/8 задач
- **Этап 2**: 0/12 задач  
- **Этап 3**: 0/8 задач
- **Этап 4**: 0/9 задач
- **Этап 5**: 0/8 задач
- **Этап 6**: 0/5 задач

---

*Последнее обновление: $(date)*
*Статус: Планирование завершено, готов к реализации*