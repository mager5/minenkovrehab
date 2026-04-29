import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';

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

  const ok = await isAuthorized(req);
  if (!ok) {
    return res
      .status(401)
      .json({ success: false, message: 'Auth session missing!' });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('videos')
    .select('file_path,title,created_at')
    .eq('user_id', INSTRUCTOR_USER_ID)
    .ilike('title', '%еженедель%')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const filePath = data?.[0]?.file_path || null;
  const pickPath = async () => {
    if (filePath) return filePath;

    // Приоритет: тест разгибания (без водяного знака / оригинальный размер может быть последней версией)
    const { data: extension, error: extensionError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .ilike('title', '%разгиб%')
      .order('created_at', { ascending: false })
      .limit(1);
    if (extensionError) throw new Error(extensionError.message);
    if (extension?.[0]?.file_path) return extension[0].file_path;

    // Старый fallback (оставлен для истории):
    // const { data: fallback, error: fallbackError } = await supabase
    //   .from('videos')
    //   .select('file_path,title,created_at')
    //   .eq('user_id', INSTRUCTOR_USER_ID)
    //   .ilike('title', '%тест%')
    //   .order('created_at', { ascending: false })
    //   .limit(1);
    // if (fallbackError) throw new Error(fallbackError.message);
    // return fallback?.[0]?.file_path || null;

    const { data: fallback, error: fallbackError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .ilike('title', '%тест%')
      .order('created_at', { ascending: false })
      .limit(1);
    if (fallbackError) throw new Error(fallbackError.message);
    return fallback?.[0]?.file_path || null;
  };

  const path = await pickPath();
  if (!path) {
    return res
      .status(404)
      .json({ success: false, message: 'Видео не найдено' });
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from('videos')
    .createSignedUrl(path, 3600);

  if (signedError || !signed?.signedUrl) {
    return res.status(500).json({
      success: false,
      message: signedError?.message || 'Не удалось создать ссылку',
    });
  }

  return res.status(200).json({
    success: true,
    data: { signedUrl: signed.signedUrl, filePath: path },
  });
}
