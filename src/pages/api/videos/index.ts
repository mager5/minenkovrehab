import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

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
  if (!response?.ok || !payload?.success || !payload?.data?.user?.id) {
    return null;
  }
  return payload.data.user as { id: string };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createAdminClient();

  if (req.method === 'GET') {
    const user = await getAuthUser(req);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Auth session missing!' });
    }

    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (videosError) {
      return res
        .status(500)
        .json({ success: false, message: videosError.message });
    }

    const paths = (videos || []).map(v => v.file_path).filter(Boolean);
    const { data: signed, error: signedError } = paths.length
      ? await supabase.storage.from('videos').createSignedUrls(paths, 3600)
      : { data: [], error: null };

    if (signedError) {
      return res
        .status(500)
        .json({ success: false, message: signedError.message });
    }

    const thumbnailsById: Record<string, string> = {};
    (signed || []).forEach(item => {
      if (!item?.path || !item.signedUrl) return;
      const match = (videos || []).find(v => v.file_path === item.path);
      if (match?.id) thumbnailsById[match.id] = item.signedUrl;
    });

    return res.status(200).json({
      success: true,
      data: { videos: videos || [], thumbnailsById },
    });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const title = (body?.title as string | undefined)?.trim();
    const description = (body?.description as string | undefined)?.trim() || '';
    const filePath = (body?.filePath as string | undefined)?.trim();
    const size = Number(body?.size ?? 0);
    const mimeType = (body?.mimeType as string | undefined)?.trim() || null;

    if (!title || !filePath) {
      return res
        .status(400)
        .json({ success: false, message: 'title и filePath обязательны' });
    }

    const user = await getAuthUser(req);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Auth session missing!' });
    }

    if (!filePath.startsWith(`${user.id}/`)) {
      return res
        .status(403)
        .json({ success: false, message: 'Недопустимый путь файла' });
    }

    const { data, error } = await supabase.from('videos').insert({
      user_id: user.id,
      title,
      description,
      file_path: filePath,
      size,
      mime_type: mimeType,
    });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, data: { record: data } });
  }

  res.setHeader('Allow', 'GET, POST');
  return res
    .status(405)
    .json({ success: false, message: 'Method Not Allowed' });
}
