import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '../../../../lib/supabase/admin';

async function getAuthUser(req: NextApiRequest) {
  const host = req.headers.host || 'localhost:3000';
  const proto =
    (req.headers['x-forwarded-proto'] as string | undefined) || 'http';
  const authMeUrl = `${proto}://${host}/api/auth/me`;

  const cookie = req.headers.cookie || '';
  const response = await fetch(authMeUrl, {
    method: 'GET',
    headers: cookie ? { cookie } : {},
    cache: 'no-store',
  }).catch(() => null);
  const payload = response ? await response.json().catch(() => null) : null;

  const userId = payload?.data?.user?.id as string | undefined;
  if (!response?.ok || !payload?.success || !userId) return null;
  return { id: userId };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const idParam = req.query.id;
  const videoId = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!videoId) {
    return res.status(400).json({ success: false, message: 'id обязателен' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: 'Auth session missing!' });
  }

  const supabase = createAdminClient();

  if (req.method === 'PATCH') {
    const body = req.body || {};
    const description = (body?.description as string | undefined) ?? null;
    if (typeof description !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'description обязателен' });
    }

    const { data, error } = await supabase
      .from('videos')
      .update({ description })
      .eq('id', videoId)
      .eq('user_id', user.id)
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: 'Видео не найдено' });
    }

    return res.status(200).json({ success: true, data: { video: data } });
  }

  if (req.method === 'DELETE') {
    const { data: video, error: findError } = await supabase
      .from('videos')
      .select('id,file_path')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (findError) {
      return res
        .status(500)
        .json({ success: false, message: findError.message });
    }

    if (!video?.file_path) {
      return res
        .status(404)
        .json({ success: false, message: 'Видео не найдено' });
    }

    const { error: storageError } = await supabase.storage
      .from('videos')
      .remove([video.file_path]);

    if (storageError) {
      return res
        .status(500)
        .json({ success: false, message: storageError.message });
    }

    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)
      .eq('user_id', user.id);

    if (deleteError) {
      return res
        .status(500)
        .json({ success: false, message: deleteError.message });
    }

    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  return res
    .status(405)
    .json({ success: false, message: 'Method Not Allowed' });
}
