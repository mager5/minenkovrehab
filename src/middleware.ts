import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Проверяем, что это продакшен и запрос к админке
  if (process.env.NODE_ENV === 'production' && request.nextUrl.pathname.startsWith('/admin')) {
    // Перенаправляем на главную страницу
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: '/admin/:path*',
} 