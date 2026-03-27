import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

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

  const body = req.body || {};
  const originalName = (body?.fileName as string | undefined) || 'video';
  const ext =
    (body?.fileExt as string | undefined)?.trim().replace(/^\./, '') || '';

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

  const supabase = createAdminClient();

  const safeBase = sanitizeFileName(originalName.replace(/\.[^/.]+$/, ''));
  const fileName = `${Date.now()}_${safeBase}${ext ? `.${ext}` : ''}`;
  const filePath = `${user.id}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUploadUrl(filePath);

  if (error || !data) {
    return res
      .status(500)
      .json({
        success: false,
        message: error?.message || 'Не удалось создать URL',
      });
  }

  return res.status(200).json({
    success: true,
    data: {
      filePath: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    },
  });
}
