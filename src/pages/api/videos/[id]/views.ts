import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res
      .status(405)
      .json({ success: false, message: 'Method Not Allowed' });
  }

  const host = req.headers.host || 'localhost:3000';
  const proto =
    (req.headers['x-forwarded-proto'] as string | undefined) || 'http';
  const authMeUrl = `${proto}://${host}/api/auth/me`;

  const cookie = req.headers.cookie || '';
  const authResponse = await fetch(authMeUrl, {
    method: 'GET',
    headers: cookie ? { cookie } : {},
    cache: 'no-store',
  }).catch(() => null);

  const authPayload = authResponse
    ? await authResponse.json().catch(() => null)
    : null;

  const userId = authPayload?.data?.user?.id as string | undefined;
  if (!authResponse?.ok || !authPayload?.success || !userId) {
    return res
      .status(401)
      .json({ success: false, message: 'Auth session missing!' });
  }

  const idParam = req.query.id;
  const videoId = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!videoId) {
    return res.status(400).json({ success: false, message: 'id обязателен' });
  }

  const supabase = createAdminClient();
  const { data: video, error: findError } = await supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) {
    return res.status(500).json({ success: false, message: findError.message });
  }

  if (!video?.id) {
    return res
      .status(404)
      .json({ success: false, message: 'Видео не найдено' });
  }

  const { error: rpcError } = await supabase.rpc('increment_video_view', {
    video_id: videoId,
  });

  if (rpcError) {
    return res.status(500).json({ success: false, message: rpcError.message });
  }

  return res.status(200).json({ success: true });
}
