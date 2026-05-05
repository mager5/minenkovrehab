import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const STAGE_VIDEO_PATHS: Record<string, string> = {
  '1': '6639a601-4007-46d8-a058-fe2cd2086fa1/1771875320518_1_HLh9prrm_mp4.mp4',
  '2': '6639a601-4007-46d8-a058-fe2cd2086fa1/1774614743708_mHTR6x8C_mp4.mp4',
  '3': '6639a601-4007-46d8-a058-fe2cd2086fa1/1774895893009________________________________________________4_8________.mp4',
};
const STAGE_PREFERRED_PATHS: Record<string, string[]> = {
  '1': ['My Bucket/Resection/ostry-etap-0-2-nedeli.kf2s.mp4'],
  '2': [
    'My Bucket/Resection/ranniy-vosstanovitelnyy-etap-2-4-nedeli.kf2s.mp4',
    'My Bucket/Resection/ranniy-etap-2-4-nedeli.kf2s.mp4',
  ],
};

function toHlsMasterPath(mp4Path: string) {
  return mp4Path.replace(/\.mp4$/i, '_hls/master.m3u8');
}

function toHlsVariantPlaylistPaths(masterPath: string) {
  const baseDir = String(masterPath || '')
    .split('/')
    .slice(0, -1)
    .join('/');
  return ['v0/prog.m3u8', 'v1/prog.m3u8', 'v2/prog.m3u8'].map(rel =>
    baseDir ? `${baseDir}/${rel}` : rel
  );
}

async function canSignPath(
  supabase: ReturnType<typeof createAdminClient>,
  path: string
) {
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(path, 60);
  return !error && !!data?.signedUrl;
}

async function resolveStagePath(
  stage: string,
  supabase: ReturnType<typeof createAdminClient>
) {
  const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';

  if (stage === '1') {
    const candidates: string[] = [...(STAGE_PREFERRED_PATHS['1'] || [])];
    const { data: acuteData, error: acuteError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .ilike('title', '%острый%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!acuteError && acuteData?.[0]?.file_path) {
      candidates.push(acuteData[0].file_path);
    }

    const { data: byWeeks, error: byWeeksError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .or('title.ilike.%0-2%,title.ilike.%0–2%,title.ilike.%0 2%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!byWeeksError && byWeeks?.[0]?.file_path) {
      candidates.push(byWeeks[0].file_path);
    }

    candidates.push(STAGE_VIDEO_PATHS['1'] || '');

    for (const candidate of candidates) {
      if (!candidate) continue;
      const exists = await canSignPath(supabase, candidate);
      if (exists) return candidate;
    }

    return null;
  }

  if (stage === '3') {
    const candidates: string[] = [];
    const { data: lateData, error: lateError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .ilike('title', '%поздний%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!lateError && lateData?.[0]?.file_path) {
      candidates.push(lateData[0].file_path);
    }

    const { data: byWeeks, error: byWeeksError } = await supabase
      .from('videos')
      .select('file_path,title,created_at')
      .eq('user_id', INSTRUCTOR_USER_ID)
      .or('title.ilike.%4-8%,title.ilike.%4–8%,title.ilike.%4 8%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!byWeeksError && byWeeks?.[0]?.file_path) {
      candidates.push(byWeeks[0].file_path);
    }

    candidates.push(STAGE_VIDEO_PATHS['3'] || '');

    for (const candidate of candidates) {
      if (!candidate) continue;
      const exists = await canSignPath(supabase, candidate);
      if (exists) return candidate;
    }

    return null;
  }

  if (stage !== '2') {
    const stagePath = STAGE_VIDEO_PATHS[stage] || null;
    if (!stagePath) return null;
    const exists = await canSignPath(supabase, stagePath);
    return exists ? stagePath : null;
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

  const { data: looseData, error: looseError } = await supabase
    .from('videos')
    .select('file_path,title,created_at')
    .eq('user_id', INSTRUCTOR_USER_ID)
    .ilike('title', '%ранний%')
    .order('created_at', { ascending: false })
    .limit(1);

  const candidates: string[] = [...(STAGE_PREFERRED_PATHS['2'] || [])];
  if (!strictError && strictData?.[0]?.file_path) {
    candidates.push(strictData[0].file_path);
  }
  if (!looseError && looseData?.[0]?.file_path) {
    candidates.push(looseData[0].file_path);
  }
  candidates.push(STAGE_VIDEO_PATHS['2'] || '');

  for (const candidate of candidates) {
    if (!candidate) continue;
    const exists = await canSignPath(supabase, candidate);
    if (exists) return candidate;
  }

  return null;
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

  const path = (await resolveStagePath(stage, supabase)) || null;

  if (!path) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'Видео не найдено',
    });
  }

  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(path, 60 * 60 * 6);

  if (error?.message?.toLowerCase().includes('object not found')) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'Видео не найдено',
    });
  }

  if (error || !data?.signedUrl) {
    return res.status(500).json({
      success: false,
      message: error?.message || 'Не удалось создать ссылку',
    });
  }

  let hlsMasterUrl: string | null = null;
  let hlsMasterPath: string | null = null;
  if (/\.mp4$/i.test(path)) {
    const candidateHlsMasterPath = toHlsMasterPath(path);
    const variantPaths = toHlsVariantPlaylistPaths(candidateHlsMasterPath);
    const checks = await Promise.all(
      [candidateHlsMasterPath, ...variantPaths].map(p =>
        canSignPath(supabase, p)
      )
    );
    if (checks.every(Boolean)) {
      hlsMasterPath = candidateHlsMasterPath;
      hlsMasterUrl = `/api/courses/meniscus/hls/master?path=${encodeURIComponent(
        candidateHlsMasterPath
      )}`;
    }
  }

  // Старый return (оставлен для истории):
  // return res.status(200).json({ success: true, data: { signedUrl: data.signedUrl, filePath: path } });

  return res.status(200).json({
    success: true,
    data: {
      signedUrl: data.signedUrl,
      filePath: path,
      hlsMasterUrl,
      hlsMasterPath,
    },
  });
}
