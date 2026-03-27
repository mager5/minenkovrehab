import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function getAuthUser(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const authMeUrl = new URL('/api/auth/me', req.url).toString();

  const response = await fetch(authMeUrl, {
    method: 'GET',
    headers: cookie ? { cookie } : {},
    cache: 'no-store',
  }).catch(() => null);

  const payload = response ? await response.json().catch(() => null) : null;

  if (!response?.ok || !payload?.success || !payload?.data?.user?.id) {
    return null;
  }

  return payload.data.user as { id: string };
}

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const user = await getAuthUser(req);

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Auth session missing!' },
      { status: 401 }
    );
  }

  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (videosError) {
    return NextResponse.json(
      { success: false, message: videosError.message },
      { status: 500 }
    );
  }

  const paths = (videos || []).map(v => v.file_path).filter(Boolean);
  const { data: signed, error: signedError } = paths.length
    ? await supabase.storage.from('videos').createSignedUrls(paths, 3600)
    : { data: [], error: null };

  if (signedError) {
    return NextResponse.json(
      { success: false, message: signedError.message },
      { status: 500 }
    );
  }

  const thumbnailsById: Record<string, string> = {};
  (signed || []).forEach(item => {
    if (!item?.path || !item.signedUrl) return;
    const match = (videos || []).find(v => v.file_path === item.path);
    if (match?.id) {
      thumbnailsById[match.id] = item.signedUrl;
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      videos: videos || [],
      thumbnailsById,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = (body?.title as string | undefined)?.trim();
  const description = (body?.description as string | undefined)?.trim() || '';
  const filePath = (body?.filePath as string | undefined)?.trim();
  const size = Number(body?.size ?? 0);
  const mimeType = (body?.mimeType as string | undefined)?.trim() || null;

  if (!title || !filePath) {
    return NextResponse.json(
      { success: false, message: 'title и filePath обязательны' },
      { status: 400 }
    );
  }

  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Auth session missing!' },
      { status: 401 }
    );
  }

  if (!filePath.startsWith(`${user.id}/`)) {
    return NextResponse.json(
      { success: false, message: 'Недопустимый путь файла' },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('videos').insert({
    user_id: user.id,
    title,
    description,
    file_path: filePath,
    size,
    mime_type: mimeType,
  });

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { record: data } });
}
