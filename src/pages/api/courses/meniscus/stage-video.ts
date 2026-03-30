import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const STAGE_VIDEO_PATHS: Record<string, string> = {
  '1': '6639a601-4007-46d8-a058-fe2cd2086fa1/1771875320518_1_HLh9prrm_mp4.mp4',
  '2': '6639a601-4007-46d8-a058-fe2cd2086fa1/1774614743708_mHTR6x8C_mp4.mp4',
  '3': '6639a601-4007-46d8-a058-fe2cd2086fa1/1774895893009________________________________________________4_8________.mp4',
};

async function isAuthorized(req: NextApiRequest) {
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
  return !!(response?.ok && payload?.success && payload?.data?.user?.id);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res
      .status(405)
      .json({ success: false, message: 'Method Not Allowed' });
  }

  const stage = (req.query.stage as string | undefined) || '';
  const path = STAGE_VIDEO_PATHS[stage];

  if (!path) {
    return res
      .status(400)
      .json({ success: false, message: 'Неизвестный этап' });
  }

  const ok = await isAuthorized(req);
  if (!ok) {
    return res
      .status(401)
      .json({ success: false, message: 'Auth session missing!' });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Не удалось создать ссылку',
    });
  }

  return res
    .status(200)
    .json({ success: true, data: { signedUrl: data.signedUrl } });
}
