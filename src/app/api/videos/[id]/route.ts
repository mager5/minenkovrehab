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
  const user = payload?.data?.user as { id?: string } | undefined;
  if (!response?.ok || !payload?.success || !user?.id) return null;
  return { id: user.id };
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const body = await req.json().catch(() => null);
  const description = (body?.description as string | undefined) ?? null;

  if (typeof description !== 'string') {
    return NextResponse.json(
      { success: false, message: 'description обязателен' },
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

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('videos')
    .update({ description })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { success: false, message: 'Видео не найдено' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: { video: data } });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const req = _req;
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Auth session missing!' },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const { data: video, error: findError } = await supabase
    .from('videos')
    .select('id,file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (findError) {
    return NextResponse.json(
      { success: false, message: findError.message },
      { status: 500 }
    );
  }

  if (!video?.file_path) {
    return NextResponse.json(
      { success: false, message: 'Видео не найдено' },
      { status: 404 }
    );
  }

  const { error: storageError } = await supabase.storage
    .from('videos')
    .remove([video.file_path]);

  if (storageError) {
    return NextResponse.json(
      { success: false, message: storageError.message },
      { status: 500 }
    );
  }

  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json(
      { success: false, message: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
