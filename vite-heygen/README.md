# HeyGen Avatar - Vite Version

Это версия HeyGen StreamingAvatar SDK, адаптированная для работы с Vite вместо Next.js. Vite обеспечивает более простую настройку и отсутствие проблем с Content Security Policy (CSP).

## Преимущества Vite версии

- ✅ Нет проблем с CSP (Content Security Policy)
- ✅ Быстрая разработка с Hot Module Replacement
- ✅ Простая конфигурация
- ✅ Лучшая совместимость с WebRTC и LiveKit
- ✅ Нет серверных зависимостей для фронтенда

## Установка и настройка

### 1. Установите зависимости

```bash
cd vite-heygen
npm install
```

### 2. Настройте переменные окружения

```bash
cp .env.example .env
```

Отредактируйте файл `.env` и добавьте ваш HeyGen API ключ:

```env
VITE_HEYGEN_API_KEY=your_actual_api_key_here
VITE_HEYGEN_AVATAR_ID=d3eaed1ea1dd4766952e2fdbeb6bd0d4
VITE_HEYGEN_VOICE_ID=bae2d9c6057d4c85a9ac8b4b76a9e874
```

### 3. Получите HeyGen API ключ

1. Зайдите на [HeyGen Dashboard](https://app.heygen.com/settings)
2. Перейдите в раздел "API Keys"
3. Создайте новый API ключ
4. Скопируйте ключ в файл `.env`

### 4. Запустите приложение

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3001

## Основные отличия от Next.js версии

### 1. Прямое получение токена

Вместо использования Next.js API routes (`/api/heygen/token`), Vite версия получает токен напрямую от HeyGen API:

```typescript
const getHeyGenToken = async (): Promise<string> => {
  const apiKey = import.meta.env.VITE_HEYGEN_API_KEY;
  
  const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.data.token;
};
```

### 2. Переменные окружения

- Next.js: `process.env.NEXT_PUBLIC_*`
- Vite: `import.meta.env.VITE_*`

### 3. Нет CSP ограничений

Vite не накладывает строгих CSP ограничений, поэтому HeyGen SDK может свободно подключаться к LiveKit серверам.

## Безопасность

⚠️ **ВАЖНО**: В production версии API ключ HeyGen должен храниться на бэкенде, а не в клиентском коде!

Для production рекомендуется:

1. Создать бэкенд endpoint для получения токенов
2. Хранить API ключ на сервере
3. Использовать аутентификацию для доступа к endpoint

## Структура проекта

```
vite-heygen/
├── src/
│   ├── HeyGenAvatar.tsx    # Основной компонент аватара
│   ├── App.tsx             # Главный компонент приложения
│   ├── main.tsx            # Точка входа
│   └── index.css           # Стили
├── package.json            # Зависимости
├── vite.config.ts          # Конфигурация Vite
├── tsconfig.json           # Конфигурация TypeScript
└── .env.example            # Пример переменных окружения
```

## Возможные проблемы и решения

### 1. Ошибка "Token not found"

- Проверьте правильность API ключа в `.env`
- Убедитесь, что файл `.env` находится в корне проекта
- Перезапустите dev сервер после изменения `.env`

### 2. Ошибка подключения к LiveKit

- В Vite такие проблемы возникают реже благодаря отсутствию CSP
- Проверьте консоль браузера на наличие CORS ошибок

### 3. Видео не отображается

- Убедитесь, что браузер поддерживает WebRTC
- Проверьте права доступа к камере/микрофону
- Откройте DevTools и проверьте Network tab

## Команды

```bash
# Разработка
npm run dev

# Сборка для production
npm run build

# Предварительный просмотр production сборки
npm run preview

# Линтинг
npm run lint
```

## Поддержка

Если у вас возникли проблемы с Vite версией, проверьте:

1. Консоль браузера на наличие ошибок
2. Network tab в DevTools
3. Правильность настройки переменных окружения
4. Актуальность HeyGen API ключа