#!/bin/bash

# Примеры использования скриптов проверки сайта
# Этот файл содержит готовые команды для различных сценариев

echo "🚀 Примеры использования скриптов проверки сайта"
echo "================================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода заголовков
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Функция для вывода команд
print_command() {
    echo -e "${GREEN}$ $1${NC}"
}

# Функция для вывода описания
print_description() {
    echo -e "${YELLOW}📝 $1${NC}"
}

print_header "Базовые команды"

print_description "Быстрая проверка перед коммитом (рекомендуется)"
print_command "npm run check"

print_description "Полная проверка с E2E тестами (перед важными релизами)"
print_command "npm run check:full"

print_description "Быстрая проверка без сборки (для отладки)"
print_command "npm run check:fast"

print_description "Только E2E тесты"
print_command "npm run test:e2e"

print_header "Расширенные команды"

print_description "Полная проверка с подробным выводом"
print_command "node scripts/pre-commit-check.js --e2e --verbose"

print_description "Проверка без сборки с подробным выводом"
print_command "node scripts/pre-commit-check.js --skip-build --verbose"

print_description "Показать справку по опциям"
print_command "node scripts/pre-commit-check.js --help"

print_header "Сценарии использования"

print_description "Перед каждым коммитом"
echo "git add ."
print_command "npm run check"
echo "git commit -m 'Ваше сообщение'"

print_description "Перед важным релизом"
print_command "npm run check:full"
echo "# Если все ОК, то:"
echo "git tag v1.0.0"
echo "git push origin v1.0.0"

print_description "При разработке новой функции"
print_command "npm run check:fast"
echo "# Быстрая проверка без долгой сборки"

print_description "Отладка проблем"
print_command "npm run check -- --verbose"
echo "# Подробный вывод для диагностики"

print_header "Установка зависимостей"

print_description "Для E2E тестов (если еще не установлено)"
print_command "npm install --save-dev playwright"
print_command "npx playwright install"

print_description "Для автоматических проверок при коммите"
print_command "npm install --save-dev husky"
print_command "npx husky install"
print_command "npx husky add .husky/pre-commit \"npm run check\""

print_header "Полезные алиасы для .bashrc/.zshrc"

echo "# Добавьте эти алиасы в ваш .bashrc или .zshrc:"
echo "alias check='npm run check'"
echo "alias checkfull='npm run check:full'"
echo "alias checkfast='npm run check:fast'"
echo "alias teste2e='npm run test:e2e'"

print_header "Интеграция с IDE"

print_description "VS Code - добавьте в tasks.json"
echo '{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Проверка сайта",
      "type": "shell",
      "command": "npm run check",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}'

print_header "Автоматизация"

print_description "Ежедневная проверка через cron"
echo "# Добавьте в crontab (crontab -e):"
echo "0 9 * * * cd /path/to/your/project && npm run check:full > /tmp/daily-check.log 2>&1"

print_description "Проверка при изменении файлов (с помощью nodemon)"
print_command "npm install --save-dev nodemon"
echo "# Добавьте в package.json:"
echo '"watch": "nodemon --watch src --ext js,jsx,ts,tsx --exec \"npm run check:fast\""

print_header "Отладка проблем"

print_description "Если порт 3000 занят"
print_command "lsof -ti:3000 | xargs kill -9"
echo "# Или:"
print_command "PORT=3001 npm run check"

print_description "Если проблемы с зависимостями"
print_command "rm -rf node_modules package-lock.json"
print_command "npm install"

print_description "Если ошибки TypeScript"
print_command "npx tsc --noEmit"
print_command "npm update @types/node @types/react"

print_description "Проверка логов E2E тестов"
print_command "node scripts/e2e-tests.js 2>&1 | tee e2e-logs.txt"

print_header "Мониторинг производительности"

print_description "Измерение времени выполнения"
print_command "time npm run check"

print_description "Профилирование сборки"
print_command "ANALYZE=true npm run build"

print_description "Проверка размера бандла"
print_command "npm install --save-dev @next/bundle-analyzer"

print_header "Кастомизация"

print_description "Создание собственного скрипта проверки"
echo "# Создайте файл scripts/custom-check.js:"
echo 'const { PreCommitChecker } = require("./pre-commit-check.js");

class CustomChecker extends PreCommitChecker {
  async checkCustomFeature() {
    // Ваша логика
  }
}

const checker = new CustomChecker();
checker.run();'

print_header "CI/CD интеграция"

print_description "GitHub Actions"
echo "# .github/workflows/test.yml:"
echo 'name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run check:full'

print_description "GitLab CI"
echo "# .gitlab-ci.yml:"
echo 'stages:
  - test

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run check:full'

print_header "Полезные команды для разработки"

print_description "Запуск только линтера"
print_command "npm run lint"

print_description "Автоисправление линтера"
print_command "npm run lint -- --fix"

print_description "Проверка типов TypeScript"
print_command "npx tsc --noEmit"

print_description "Анализ безопасности"
print_command "npm audit"
print_command "npm audit fix"

print_description "Обновление зависимостей"
print_command "npm outdated"
print_command "npm update"

print_header "Заключение"

echo -e "${GREEN}✅ Регулярное использование этих команд поможет:${NC}"
echo "   • Поддерживать высокое качество кода"
echo "   • Избегать ошибок в продакшене"
echo "   • Ускорить процесс разработки"
echo "   • Обеспечить стабильность сайта"

echo -e "\n${BLUE}📚 Для получения дополнительной информации:${NC}"
echo "   • Читайте scripts/README.md"
echo "   • Изучайте код скриптов"
echo "   • Настраивайте под свои нужды"

echo -e "\n${YELLOW}🎯 Рекомендуемый workflow:${NC}"
echo "   1. npm run check:fast (во время разработки)"
echo "   2. npm run check (перед коммитом)"
echo "   3. npm run check:full (перед релизом)"

echo -e "\n${GREEN}Удачной разработки! 🚀${NC}"