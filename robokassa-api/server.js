const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const robokassaRoutes = require('./routes/robokassa');
const robokassaSdkRoutes = require('./routes/robokassa-sdk');
const paymentRoutes = require('./routes/payment');
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');

const app = express();
const PORT = process.env.PORT || 3000;
const STARTED_AT = new Date().toISOString();

// Middleware для безопасности
// Старый вариант (оставлен для истории):
// app.use(helmet());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

app.set('trust proxy', 1);

// CORS настройки
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
  'https://minenkovrehab.github.io',
  'https://minenkovrehab.ru',
].filter(Boolean);

// Добавляем Railway домен если он есть
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  })
);

// Middleware для парсинга JSON с обработкой ошибок
app.use(
  express.json({
    limit: '50mb',
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware для логирования сырых данных запроса
app.use('/api', (req, res, next) => {
  if (req.url.startsWith('/auth')) {
    console.log('📥 Входящий запрос (auth):', {
      method: req.method,
      url: req.url,
      contentLength: req.headers['content-length'],
    });
    return next();
  }

  console.log('📥 Входящий запрос:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    contentLength: req.headers['content-length'],
  });

  // Логируем сырые данные
  let rawData = '';
  req.on('data', chunk => {
    rawData += chunk;
    console.log('📦 Получен chunk:', chunk.length, 'байт');
  });

  req.on('end', () => {
    console.log('📋 Полные сырые данные:', rawData);
    console.log('📏 Общий размер:', rawData.length, 'байт');
  });

  next();
});

// Обработка ошибок парсинга JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Ошибка парсинга JSON:', {
      error: err.message,
      body: err.body,
      headers: req.headers,
      url: req.url,
      method: req.method,
      contentLength: req.headers['content-length'],
    });

    return res.status(400).json({
      success: false,
      error: 'Неверный формат JSON',
      details: err.message,
      receivedBody: err.body,
    });
  }
  next(err);
});

// Логирование запросов
app.use((req, res, next) => {
  const shouldRedactAuthBody = req.path.startsWith('/api/auth');
  const redactedHeaders = { ...req.headers };
  if (redactedHeaders.authorization) {
    redactedHeaders.authorization = '[REDACTED]';
  }
  if (redactedHeaders.cookie) {
    redactedHeaders.cookie = '[REDACTED]';
  }

  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', redactedHeaders);
  if (req.body && Object.keys(req.body).length > 0) {
    if (shouldRedactAuthBody) {
      const redactedBody = { ...req.body };
      if (typeof redactedBody.password === 'string') {
        redactedBody.password = '[REDACTED]';
      }
      if (typeof redactedBody.refresh_token === 'string') {
        redactedBody.refresh_token = '[REDACTED]';
      }
      console.log('Body:', redactedBody);
    } else {
      console.log('Body:', req.body);
    }
  }
  next();
});

// Основные роуты
app.use('/api/robokassa', robokassaRoutes);
app.use('/api/robokassa-sdk', robokassaSdkRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
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
    startedAt: STARTED_AT,
    environment: process.env.NODE_ENV || 'development',
    testMode: process.env.ROBOKASSA_TEST_MODE === 'true',
    gitSha:
      process.env.RAILWAY_GIT_COMMIT_SHA ||
      process.env.RAILWAY_GIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      process.env.GIT_SHA ||
      null,
  });
});

// Корневой роут
app.get('/', (req, res) => {
  res.json({
    message: 'Robokassa API для minenkovrehab.ru',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      // Оригинальные эндпоинты
      generatePaymentUrl: 'POST /api/robokassa/generate-payment-url',
      createPayment: 'POST /api/robokassa/create-payment',
      resultCallback: 'POST /api/robokassa/result',
      verifySignature: 'GET /api/robokassa/verify-signature',
      trackRedirect: 'GET /api/robokassa/track-redirect',
      // SDK эндпоинты (рекомендуемые)
      sdkGeneratePaymentUrl: 'POST /api/robokassa-sdk/generate-payment-url',
      sdkCallback: 'POST /api/robokassa-sdk/callback',
      sdkTest: 'GET /api/robokassa-sdk/test',
      // Утилиты
      redirectInterceptor: 'GET /redirect-interceptor',
      successPage: 'GET /payment/success',
      failPage: 'GET /payment/fail',
    },
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Robokassa API запущен на порту ${PORT}`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `🧪 Тестовый режим Robokassa: ${process.env.ROBOKASSA_TEST_MODE === 'true' ? 'ВКЛ' : 'ВЫКЛ'}`
  );
  const corsOrigins = allowedOrigins.join(', ');
  console.log(`🌐 CORS разрешен для: ${corsOrigins}`);
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(
      `🚂 Railway домен: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    );
  }
});

module.exports = app;
