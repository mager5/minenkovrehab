import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

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

  const path = (req.query.path as string | undefined) || '';
  if (!path) {
    return res.status(400).json({ success: false, message: 'path обязателен' });
  }

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
  const user = payload?.data?.user as { id?: string } | undefined;

  if (!response?.ok || !payload?.success || !user?.id) {
    return res
      .status(401)
      .json({ success: false, message: 'Auth session missing!' });
  }

  if (!path.startsWith(`${user.id}/`)) {
    return res
      .status(403)
      .json({ success: false, message: 'Недопустимый путь файла' });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(path, 3600);

  if (error || !data) {
    return res
      .status(500)
      .json({
        success: false,
        message: error?.message || 'Не удалось создать URL',
      });
  }

  return res
    .status(200)
    .json({ success: true, data: { signedUrl: data.signedUrl } });
}
