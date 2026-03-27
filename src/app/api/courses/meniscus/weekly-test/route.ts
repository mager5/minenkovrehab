import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';

async function isAuthorized(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const authMeUrl = new URL('/api/auth/me', req.url).toString();
  const response = await fetch(authMeUrl, {
    method: 'GET',
    headers: cookie ? { cookie } : {},
    cache: 'no-store',
  }).catch(() => null);
  const payload = response ? await response.json().catch(() => null) : null;
  return !!(response?.ok && payload?.success && payload?.data?.user?.id);
}

export async function GET(req: NextRequest) {
  const ok = await isAuthorized(req);
  if (!ok) {
    return NextResponse.json(
      { success: false, message: 'Auth session missing!' },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('videos')
    .select('file_path,title,created_at')
    .eq('user_id', INSTRUCTOR_USER_ID)
    .ilike('title', '%еженедель%')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  const filePath = data?.[0]?.file_path || null;
  if (!filePath) {
    const { data: fallback, error: fallbackError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .ilike('title', '%тест%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fallbackError) {
      return NextResponse.json(
        { success: false, message: fallbackError.message },
        { status: 500 }
      );
    }

    const fallbackPath = fallback?.[0]?.file_path || null;
    if (!fallbackPath) {
      return NextResponse.json(
        { success: false, message: 'Видео не найдено' },
        { status: 404 }
      );
    }

    const { data: signedFallback, error: signedError } = await supabase.storage
      .from('videos')
      .createSignedUrl(fallbackPath, 3600);

    if (signedError || !signedFallback?.signedUrl) {
      return NextResponse.json(
        {
          success: false,
          message: signedError?.message || 'Не удалось создать ссылку',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { signedUrl: signedFallback.signedUrl, filePath: fallbackPath },
    });
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from('videos')
    .createSignedUrl(filePath, 3600);

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json(
      {
        success: false,
        message: signedError?.message || 'Не удалось создать ссылку',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { signedUrl: signed.signedUrl, filePath },
  });
}
