import { NextResponse, type NextRequest } from 'next/server';
import { readMigrationSession } from '@/lib/migration-config';
export async function proxy(request: NextRequest) {
  if (process.env.AI_TEST_ENABLED === '1') {
    if (
      ['/api/ai-test', '/api/ai-test/transcribe'].includes(
        request.nextUrl.pathname
      )
    )
      return NextResponse.next();
    return NextResponse.json(
      { error: 'Этот раздел отключён в AI-эксперименте.' },
      { status: 404 }
    );
  }
  if (request.nextUrl.pathname.startsWith('/api/')) return NextResponse.next();
  const session = await readMigrationSession(
    request.headers.get('cookie') || ''
  );
  if (session.status === 503)
    return new NextResponse('Сервис авторизации временно недоступен.', {
      status: 503,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session.user) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (
    session.user &&
    ['/login', '/register'].includes(request.nextUrl.pathname)
  )
    return NextResponse.redirect(new URL('/dashboard', request.url));
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/login', '/register'],
};
