const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const robokassaRoutes = require('./routes/robokassa');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для безопасности
app.use(helmet());

// CORS настройки
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://minenkovrehab.github.io',
  'https://minenkovrehab.ru'
];

// Добавляем Railway домен если он есть
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}

app.use(cors({
  origin: allowedOrigins,
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
app.use('/payment', paymentRoutes);

// Статический файл для перехватчика редиректов
app.get('/redirect-interceptor', (req, res) => {
  res.sendFile(path.join(__dirname, 'redirect-interceptor.html'));
});

// JavaScript-файл перехватчика для встраивания
app.get('/robokassa-redirect-interceptor.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'robokassa-redirect-interceptor.js'));
});



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
      createPayment: 'POST /api/robokassa/create-payment',
      resultCallback: 'POST /api/robokassa/result',
      verifySignature: 'GET /api/robokassa/verify-signature',
      trackRedirect: 'GET /api/robokassa/track-redirect',
      redirectInterceptor: 'GET /redirect-interceptor',
      successPage: 'GET /payment/success',
      failPage: 'GET /payment/fail'
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
  const corsOrigins = allowedOrigins.join(', ');
  console.log(`🌐 CORS разрешен для: ${corsOrigins}`);
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(`🚂 Railway домен: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  }
});

module.exports = app;