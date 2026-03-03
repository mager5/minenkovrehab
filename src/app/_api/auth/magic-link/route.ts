import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyMagicToken } from '@/lib/auth/magic-link';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const siteUrl = (() => {
    try {
      const origin = new URL(req.url).origin;
      return (
        origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://minenkovrehab.ru'
      );
    } catch {
      return process.env.NEXT_PUBLIC_SITE_URL || 'https://minenkovrehab.ru';
    }
  })();

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/login?error=invalid_link`);
  }

  let payload: { email: string; password: string; exp: number } | null = null;

  try {
    payload = verifyMagicToken(token);
  } catch (error) {
    console.error('Magic link verify error:', error);
    return NextResponse.redirect(`${siteUrl}/login?error=invalid_link`);
  }

  if (!payload) {
    return NextResponse.redirect(`${siteUrl}/login?error=invalid_link`);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      console.error('Magic link login error:', error);
      return NextResponse.redirect(`${siteUrl}/login?error=link_login_failed`);
    }

    return NextResponse.redirect(`${siteUrl}/dashboard`);
  } catch (error) {
    console.error('Magic link handler error:', error);
    return NextResponse.redirect(`${siteUrl}/login?error=server_error`);
  }
}
