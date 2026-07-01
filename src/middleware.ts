import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimitConfig } from '@/lib/security';

// Простая реализация rate limiting в памяти
// В production лучше использовать Redis или другое внешнее хранилище
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  // Используем IP адрес для идентификации клиента
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return ip as string;
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

export async function middleware(request: NextRequest) {
  // Исключаем статические файлы из обработки middleware
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.startsWith('/api/robokassa') ||
    request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const isLocalhost =
    request.nextUrl.hostname === 'localhost' ||
    request.nextUrl.hostname === '127.0.0.1';
  if (isLocalhost) {
    return NextResponse.next();
  }

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

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://images.unsplash.com https://*.unsplash.com https://*.googleusercontent.com https://*.cloudinary.com https://*.supabase.co",
    "media-src 'self' blob: https://*.supabase.co https://api.minenkovrehab.ru https://*.railway.app https://*.up.railway.app",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://api.telegram.org https://vercel.live https://api.heygen.com https://*.supabase.co https://api.minenkovrehab.ru https://*.railway.app https://*.up.railway.app",
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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });

          const newResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Copy headers from previous response
          response.headers.forEach((value, key) => {
            newResponse.headers.set(key, value);
          });

          response = newResponse;

          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });

          const newResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Copy headers from previous response
          response.headers.forEach((value, key) => {
            newResponse.headers.set(key, value);
          });

          response = newResponse;

          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Защита маршрутов личного кабинета
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Редирект авторизованных пользователей со страницы входа и регистрации
  if (
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register')) &&
    user
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};
