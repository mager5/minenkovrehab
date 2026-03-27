import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '';

  if (!path) {
    return NextResponse.json(
      { success: false, message: 'path обязателен' },
      { status: 400 }
    );
  }

  const cookie = req.headers.get('cookie') || '';
  const authMeUrl = new URL('/api/auth/me', req.url).toString();
  const response = await fetch(authMeUrl, {
    method: 'GET',
    headers: cookie ? { cookie } : {},
    cache: 'no-store',
  }).catch(() => null);
  const payload = response ? await response.json().catch(() => null) : null;
  const user = payload?.data?.user as { id?: string } | undefined;

  if (!response?.ok || !payload?.success || !user?.id) {
    return NextResponse.json(
      { success: false, message: 'Auth session missing!' },
      { status: 401 }
    );
  }

  if (!path.startsWith(`${user.id}/`)) {
    return NextResponse.json(
      { success: false, message: 'Недопустимый путь файла' },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(path, 3600);

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Не удалось создать URL' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { signedUrl: data.signedUrl },
  });
}
