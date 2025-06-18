# Скрипты проверки сайта

Этот каталог содержит скрипты для комплексной проверки функциональности сайта перед коммитом.

## 📋 Обзор

### Основные скрипты:

1. **`pre-commit-check.js`** - Основной скрипт комплексной проверки
2. **`e2e-tests.js`** - E2E тесты с использованием Playwright

## 🚀 Быстрый старт

### Базовая проверка
```bash
npm run check
```

### Полная проверка с E2E тестами
```bash
npm run check:full
```

### Быстрая проверка (без сборки)
```bash
npm run check:fast
```

### Только E2E тесты
```bash
npm run test:e2e
```

## 📖 Подробное описание

### pre-commit-check.js

Основной скрипт проверки, который включает:

#### ✅ Проверки окружения
- Наличие Node.js и npm
- Проверка зависимостей
- Валидация package.json

#### 🔍 Линтинг и сборка
- ESLint проверка кода
- TypeScript компиляция
- Next.js сборка проекта

#### 🌐 Проверка страниц
- Доступность всех основных страниц
- Проверка статус кодов
- Время загрузки страниц

#### 🔗 API тестирование
- Проверка API эндпоинтов
- Валидация ответов
- Тестирование форм обратной связи

#### 📁 Статические ресурсы
- Проверка изображений
- Валидация CSS/JS файлов
- Проверка favicon и манифеста

#### 🎯 SEO проверки
- Title и meta описания
- H1 заголовки
- Open Graph теги
- Структурированные данные

#### 📝 Формы и интерактивность
- Структура контактных форм
- Валидация полей
- Модальные окна

### e2e-tests.js

E2E тесты с использованием Playwright:

#### 🖱️ Интерактивные тесты
- Заполнение и отправка форм
- Открытие/закрытие модальных окон
- Навигация по сайту
- Cookie баннер

#### 📱 Адаптивность
- Тестирование на разных разрешениях
- Mobile, Tablet, Desktop
- Проверка отображения элементов

#### ♿ Доступность
- Alt атрибуты изображений
- Навигация с клавиатуры
- Семантическая разметка
- ARIA атрибуты

## ⚙️ Опции запуска

### Для pre-commit-check.js:

```bash
# Полная проверка с E2E тестами
node scripts/pre-commit-check.js --e2e
node scripts/pre-commit-check.js --full

# Пропустить сборку проекта
node scripts/pre-commit-check.js --skip-build

# Подробный вывод
node scripts/pre-commit-check.js --verbose
node scripts/pre-commit-check.js -v

# Показать справку
node scripts/pre-commit-check.js --help
node scripts/pre-commit-check.js -h

# Комбинирование опций
node scripts/pre-commit-check.js --e2e --verbose --skip-build
```

## 📦 Установка зависимостей

### Для E2E тестов (опционально):

```bash
# Установка Playwright
npm install --save-dev playwright

# Установка браузеров
npx playwright install
```

## 🔧 Настройка

### Интеграция с Git hooks

Добавьте в `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npm run check
```

Или используйте husky:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run check"
```

### Настройка CI/CD

Для GitHub Actions добавьте в `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run check:full
```

## 📊 Интерпретация результатов

### ✅ Успешное выполнение
```
🎉 Все проверки прошли успешно! Готово к коммиту. ✨
✅ Включая E2E тесты - сайт полностью функционален!
```

### ⚠️ Предупреждения
```
⚠️ Коммит возможен, но рекомендуется исправить предупреждения.
```

### ❌ Ошибки
```
❌ Коммит заблокирован. Исправьте ошибки перед коммитом.
```

### 📊 Статистика
```
📊 Статистика проверки:
  • Критические ошибки: 0
  • Предупреждения: 2
  • E2E тесты: выполнены
  • Сборка: выполнена
```

## 🐛 Устранение неполадок

### Частые проблемы:

#### 1. Ошибка запуска dev сервера
```bash
# Проверьте, не занят ли порт 3000
lsof -ti:3000 | xargs kill -9

# Или используйте другой порт
PORT=3001 npm run check
```

#### 2. Playwright не установлен
```bash
npm install --save-dev playwright
npx playwright install
```

#### 3. Ошибки TypeScript
```bash
# Проверьте конфигурацию
npx tsc --noEmit

# Обновите типы
npm update @types/node @types/react
```

#### 4. Проблемы с зависимостями
```bash
# Очистите кэш и переустановите
rm -rf node_modules package-lock.json
npm install
```

## 🔄 Автоматизация

### Ежедневные проверки

Добавьте в crontab для ежедневной проверки:

```bash
# Каждый день в 9:00
0 9 * * * cd /path/to/project && npm run check:full
```

### Проверка перед деплоем

В скрипте деплоя:

```bash
#!/bin/bash
set -e

echo "Запуск проверок перед деплоем..."
npm run check:full

echo "Проверки прошли успешно, начинаем деплой..."
# Ваш код деплоя
```

## 📝 Кастомизация

### Добавление новых проверок

В `pre-commit-check.js` добавьте новый метод:

```javascript
async checkCustomFeature() {
  log.header('Проверка кастомной функции');
  
  try {
    // Ваша логика проверки
    log.success('Кастомная функция работает');
  } catch (error) {
    this.errors.push(`Ошибка кастомной функции: ${error.message}`);
  }
}
```

И вызовите в методе `run()`:

```javascript
await this.checkCustomFeature();
```

### Настройка E2E тестов

В `e2e-tests.js` добавьте новые тесты:

```javascript
async testCustomComponent() {
  log.header('Тестирование кастомного компонента');
  
  try {
    await this.page.goto(this.baseUrl + '/custom-page');
    // Ваши тесты
    log.success('Кастомный компонент работает');
  } catch (error) {
    this.errors.push(`Ошибка кастомного компонента: ${error.message}`);
  }
}
```

## 📚 Дополнительные ресурсы

- [Next.js документация](https://nextjs.org/docs)
- [Playwright документация](https://playwright.dev/)
- [ESLint правила](https://eslint.org/docs/rules/)
- [TypeScript конфигурация](https://www.typescriptlang.org/tsconfig)

## 🤝 Вклад в развитие

Для улучшения скриптов:

1. Создайте issue с описанием проблемы или предложения
2. Форкните репозиторий
3. Создайте ветку для изменений
4. Внесите изменения и протестируйте
5. Создайте pull request

---

**Примечание:** Эти скрипты предназначены для обеспечения качества кода и функциональности сайта. Регулярное использование поможет избежать проблем в продакшене.