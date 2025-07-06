# 🔧 Исправление деплоя на Railway

## ❌ Проблема
Ошибка при деплое: `nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d` did not complete successfully: exit code: 1

## ✅ Решение

### 1. Удален nixpacks.toml
- Убран файл `nixpacks.toml` который вызывал конфликты с Nix
- Railway теперь будет использовать Dockerfile вместо Nixpacks

### 2. Используется Dockerfile
- Настроен стабильный Dockerfile с Node.js 18 Alpine
- Добавлен healthcheck на `/health`
- Настроена безопасность с непривилегированным пользователем

### 3. Railway конфигурация
- `railway.json` настроен для использования Dockerfile
- Healthcheck настроен на `/health` endpoint
- Таймаут healthcheck: 100 секунд
- Политика перезапуска: ON_FAILURE

## 🚀 Деплой

### Автоматический деплой
После коммита изменений Railway автоматически:
1. Обнаружит отсутствие nixpacks.toml
2. Использует Dockerfile для сборки
3. Запустит healthcheck на `/health`
4. Деплой должен пройти успешно

### Проверка деплоя
```bash
# Проверка здоровья сервиса
curl https://minenkovrehab-production-15cc.up.railway.app/health

# Проверка конфигурации
curl https://minenkovrehab-production-15cc.up.railway.app/api/robokassa/config
```

## 📋 Что изменено

- ❌ Удален `nixpacks.toml`
- ✅ Используется существующий `Dockerfile`
- ✅ `railway.json` настроен правильно
- ✅ Endpoint `/health` работает
- ✅ Все зависимости в `package.json` корректны

## 🔄 Следующие шаги

1. Коммит и пуш изменений
2. Railway автоматически запустит новый деплой
3. Проверить статус деплоя в Railway Dashboard
4. Протестировать API endpoints

## 🆘 Если проблемы остаются

1. Проверить логи в Railway Dashboard
2. Убедиться, что все environment variables настроены
3. Проверить, что порт 3000 используется правильно
4. Убедиться, что healthcheck проходит успешно