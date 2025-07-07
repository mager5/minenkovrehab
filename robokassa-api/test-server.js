const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Простой health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Корневой роут
app.get('/', (req, res) => {
  res.json({
    message: 'Test server is running',
    port: PORT
  });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Ошибка запуска сервера:', err);
    process.exit(1);
  }
  console.log(`🚀 Тестовый сервер запущен на порту ${PORT}`);
  console.log(`🌐 Доступен по адресу: http://localhost:${PORT}`);
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
  console.error('❌ Необработанная ошибка:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение промиса:', reason);
  process.exit(1);
});

module.exports = app;