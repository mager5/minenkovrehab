import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const STAGE_VIDEO_PATHS: Record<string, string> = {
  '1': '6639a601-4007-46d8-a058-fe2cd2086fa1/1771875320518_1_HLh9prrm_mp4.mp4',
  '2': '6639a601-4007-46d8-a058-fe2cd2086fa1/1774614743708_mHTR6x8C_mp4.mp4',
  '3': '6639a601-4007-46d8-a058-fe2cd2086fa1/1774895893009________________________________________________4_8________.mp4',
};

async function resolveStagePath(
  stage: string,
  supabase: ReturnType<typeof createAdminClient>
) {
  const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';

  if (stage === '1') {
    const { data: acuteData, error: acuteError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .ilike('title', '%острый%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!acuteError && acuteData?.[0]?.file_path) {
      return acuteData[0].file_path;
    }

    const { data: byWeeks, error: byWeeksError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .or('title.ilike.%0-2%,title.ilike.%0–2%,title.ilike.%0 2%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!byWeeksError && byWeeks?.[0]?.file_path) {
      return byWeeks[0].file_path;
    }

    return STAGE_VIDEO_PATHS['1'] || null;
  }

  if (stage === '3') {
    const { data: lateData, error: lateError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .ilike('title', '%поздний%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!lateError && lateData?.[0]?.file_path) {
      return lateData[0].file_path;
    }

    const { data: byWeeks, error: byWeeksError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .or('title.ilike.%4-8%,title.ilike.%4–8%,title.ilike.%4 8%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!byWeeksError && byWeeks?.[0]?.file_path) {
      return byWeeks[0].file_path;
    }

    return STAGE_VIDEO_PATHS['3'] || null;
  }

  if (stage !== '2') {
    return STAGE_VIDEO_PATHS[stage] || null;
  }

  // Старый вариант (оставлен для истории): жестко заданный путь в мапе
  // return STAGE_VIDEO_PATHS['2'] || null;

  const { data: strictData, error: strictError } = await supabase
    .from('videos')
    .select('file_path,title,created_at')
    .eq('user_id', INSTRUCTOR_USER_ID)
    .ilike('title', '%ранний восстанов%')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!strictError && strictData?.[0]?.file_path) {
    return strictData[0].file_path;
  }

  const { data: looseData, error: looseError } = await supabase
    .from('videos')
    .select('file_path,title,created_at')
    .eq('user_id', INSTRUCTOR_USER_ID)
    .ilike('title', '%ранний%')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!looseError && looseData?.[0]?.file_path) {
    return looseData[0].file_path;
  }

  return STAGE_VIDEO_PATHS['2'] || null;
}

async function isAuthorized(req: NextApiRequest) {
  const host = req.headers.host || 'localhost:3000';
  const hostLower = host.toLowerCase();
  const isLocalHost =
    hostLower.startsWith('localhost:') || hostLower.startsWith('127.0.0.1:');
  if (process.env.NODE_ENV !== 'production' && isLocalHost) {
    return true;
  }
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
  const fallbackPath = STAGE_VIDEO_PATHS[stage];

  if (!fallbackPath) {
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

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      success: false,
      message:
        'Не настроен Supabase для выдачи signed URL (нужны NEXT_PUBLIC_SUPABASE_URL или SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY)',
    });
  }

  const supabase = createAdminClient();

  const path = (await resolveStagePath(stage, supabase)) || fallbackPath;

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
    .json({
      success: true,
      data: { signedUrl: data.signedUrl, filePath: path },
    });
}
