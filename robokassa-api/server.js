const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const robokassaRoutes = require('./routes/robokassa');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для безопасности
app.use(helmet());

// CORS настройки
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://minenkovrehab.github.io',
    'https://minenkovrehab.ru'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware для парсинга JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Основные роуты
app.use('/api/robokassa', robokassaRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    testMode: process.env.ROBOKASSA_TEST_MODE === 'true'
  });
});

// Корневой роут
app.get('/', (req, res) => {
  res.json({
    message: 'Robokassa API для minenkovrehab.ru',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      generatePaymentUrl: 'POST /api/robokassa/generate-payment-url',
      resultCallback: 'POST /api/robokassa/result',
      verifySignature: 'GET /api/robokassa/verify-signature'
    }
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Robokassa API запущен на порту ${PORT}`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🧪 Тестовый режим Robokassa: ${process.env.ROBOKASSA_TEST_MODE === 'true' ? 'ВКЛ' : 'ВЫКЛ'}`);
  console.log(`🌐 CORS разрешен для: ${process.env.FRONTEND_URL || 'localhost'}`);
});

module.exports = app;