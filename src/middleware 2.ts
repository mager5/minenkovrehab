import { NextRequest, NextResponse } from 'next/server';
import { rateLimitConfig } from '@/lib/security';

// Простая реализация rate limiting в памяти
// В production лучше использовать Redis или другое внешнее хранилище
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  // Используем IP адрес для идентификации клиента
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    // Новое окно или первый запрос
    requestCounts.set(key, {
      count: 1,
      resetTime: now + rateLimitConfig.windowMs,
    });
    return false;
  }

  if (record.count >= rateLimitConfig.max) {
    return true;
  }

  record.count++;
  return false;
}

// Очистка старых записей каждые 5 минут
setInterval(
  () => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
      if (now > record.resetTime) {
        requestCounts.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Rate limiting для API маршрутов
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);

    if (isRateLimited(key)) {
      return new NextResponse(
        JSON.stringify({ error: rateLimitConfig.message }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(rateLimitConfig.windowMs / 1000)),
          },
        }
      );
    }
  }

  // Заголовки безопасности
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // CSP заголовок
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://vercel.live https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://images.unsplash.com https://*.unsplash.com https://*.googleusercontent.com https://*.cloudinary.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.telegram.org https://vercel.live",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // Дополнительные заголовки безопасности
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Удаление заголовков, раскрывающих информацию о сервере
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  return response;
}

export const config = {
  matcher: [
    /*
     * Применяется ко всем маршрутам кроме:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
