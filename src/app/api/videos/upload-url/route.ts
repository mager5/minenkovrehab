import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const originalName = (body?.fileName as string | undefined) || 'video';
  const ext =
    (body?.fileExt as string | undefined)?.trim().replace(/^\./, '') || '';

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

  const supabase = createAdminClient();
  const safeBase = sanitizeFileName(originalName.replace(/\.[^/.]+$/, ''));
  const fileName = `${Date.now()}_${safeBase}${ext ? `.${ext}` : ''}`;
  const filePath = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUploadUrl(filePath);

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Не удалось создать URL' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      filePath: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    },
  });
}
