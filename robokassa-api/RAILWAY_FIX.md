# 🔧 Быстрое исправление Railway деплоя

## Проблема
```
[stage-0 4/9] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d 
"nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d" did not complete successfully: exit code: 1
```

## ✅ Решение применено

### 1. Создан Dockerfile
- Использует Node.js 18 Alpine
- Оптимизирован для production
- Включает health check
- Запускается от непривилегированного пользователя

### 2. Обновлен railway.json
- Переключен на DOCKERFILE builder
- Убраны конфликтующие настройки Nixpacks

### 3. Создан .dockerignore
- Исключает ненужные файлы из образа
- Уменьшает размер образа

### 4. Упрощен nixpacks.toml
- На случай если Railway попытается использовать Nixpacks
- Убраны проблемные настройки

## 🚀 Следующие шаги

1. **Закоммитьте изменения:**
```bash
cd robokassa-api
git add .
git commit -m "fix: Railway deployment with Docker configuration"
git push origin main
```

2. **В Railway:**
   - Проект автоматически пересоберется
   - Railway обнаружит Dockerfile и использует его
   - Если не сработает, в Settings → Deploy выберите "Docker"

3. **Проверьте деплой:**
```bash
# После успешного деплоя
curl https://your-railway-url.railway.app/health
```

## 📋 Что изменилось

- ✅ `Dockerfile` - основная конфигурация для сборки
- ✅ `railway.json` - настройки Railway с Docker
- ✅ `.dockerignore` - оптимизация сборки
- ✅ `nixpacks.toml` - упрощенная конфигурация
- ✅ `RAILWAY_DEPLOY.md` - обновленная документация

## 🔍 Если проблема сохраняется

1. Проверьте логи в Railway Dashboard
2. Убедитесь что Root Directory = `robokassa-api`
3. В Settings → Deploy принудительно выберите Docker
4. Попробуйте Manual Deploy

---

**Готово!** Теперь Railway должен успешно собрать проект с Docker.