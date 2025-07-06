# Dockerfile для Robokassa API
# Альтернатива nixpacks для стабильного деплоя на Railway

FROM node:18-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json из robokassa-api
COPY robokassa-api/package*.json ./

# Установка зависимостей
RUN npm ci --only=production && npm cache clean --force

# Копирование исходного кода из robokassa-api
COPY robokassa-api/ .

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S robokassa -u 1001

# Изменение владельца файлов
RUN chown -R robokassa:nodejs /app
USER robokassa

# Открытие порта
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Запуск приложения
CMD ["npm", "start"]