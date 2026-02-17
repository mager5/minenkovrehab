import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const isStaticExport = process.env.IS_STATIC_EXPORT === '1';

export async function GET(request: Request) {
  if (isStaticExport) {
    return new Response(null, { status: 204 });
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
