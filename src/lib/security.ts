/**
 * Настройки безопасности для приложения
 */

/**
 * Content Security Policy (CSP) настройки
 */
export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Временно для Next.js, в production лучше использовать nonce
    "'unsafe-eval'", // Необходимо для Next.js в режиме разработки
    'https://vercel.live',
    'https://www.googletagmanager.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Для Tailwind CSS
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'https://images.unsplash.com',
    'https://*.unsplash.com',
    'https://*.googleusercontent.com',
    'https://*.cloudinary.com',
  ],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.telegram.org', 'https://vercel.live', 'https://api.heygen.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
};

/**
 * Генерация CSP строки
 */
export const generateCSP = (): string => {
  return Object.entries(cspDirectives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

/**
 * Заголовки безопасности для Next.js
 */
export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: generateCSP(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
];

/**
 * Валидация и санитизация входящих данных
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>"'&]/g, match => {
      const entityMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entityMap[match] || match;
    })
    .trim();
};

/**
 * Проверка на безопасность URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Rate limiting конфигурация
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за окно
  message: 'Слишком много запросов, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
};
