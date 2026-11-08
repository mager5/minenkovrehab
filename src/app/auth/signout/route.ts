import { NextResponse } from 'next/server';
// Logout is a CSRF-protected POST /api/auth/logout; GET never mutates a session.
export function GET() { return new NextResponse('Используйте выход в меню аккаунта.',{status:405}); }
