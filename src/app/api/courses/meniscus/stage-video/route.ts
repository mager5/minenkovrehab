import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const STAGE_VIDEO_PATHS: Record<string, string> = {
  '1': '6639a601-4007-46d8-a058-fe2cd2086fa1/1771875320518_1_HLh9prrm_mp4.mp4',
};

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
  const url = new URL(req.url);
  const stage = url.searchParams.get('stage') || '';
  const path = STAGE_VIDEO_PATHS[stage];

  if (!path) {
    return NextResponse.json(
      { success: false, message: 'Неизвестный этап' },
      { status: 400 }
    );
  }

  const ok = await isAuthorized(req);
  if (!ok) {
    return NextResponse.json(
      { success: false, message: 'Auth session missing!' },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Не удалось создать ссылку',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { signedUrl: data.signedUrl },
  });
}
