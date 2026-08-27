import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPublicApiOrigin } from '@/lib/public-api-origin';

const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';
const ALLOWED_VIDEO_PATH_PREFIXES = [`${INSTRUCTOR_USER_ID}/`, 'My Bucket/'];
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

type CacheEntry = { signedUrl: string; expiresAtMs: number };
const segmentUrlCache = new Map<string, CacheEntry>();

function isAllowedVideoPath(objectPath: string) {
  return ALLOWED_VIDEO_PATH_PREFIXES.some(prefix =>
    String(objectPath || '').startsWith(prefix)
  );
}

function getDirname(p: string) {
  const idx = p.lastIndexOf('/');
  if (idx === -1) return '';
  return p.slice(0, idx);
}

function joinStoragePath(baseDir: string, relative: string) {
  const base = String(baseDir || '').replace(/\/+$/, '');
  const rel = String(relative || '').replace(/^\/+/, '');
  if (!base) return rel;
  if (!rel) return base;
  return `${base}/${rel}`;
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

async function fetchStorageObjectText(bucket: string, objectPath: string) {
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ||
    '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) {
    throw new Error('Supabase env missing');
  }
  const encoded = String(objectPath || '')
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
  const url = `${base.replace(/\/$/, '')}/storage/v1/object/${bucket}/${encoded}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Storage fetch failed: ${res.status}`);
  }
  return res.text();
}

async function getSignedSegmentUrl(
  supabase: ReturnType<typeof createAdminClient>,
  segmentPath: string
) {
  const now = Date.now();
  const cached = segmentUrlCache.get(segmentPath);
  if (cached && cached.expiresAtMs - now > 60_000) {
    return cached.signedUrl;
  }
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(segmentPath, SIGNED_URL_EXPIRES_IN_SECONDS);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Failed to sign segment');
  }
  segmentUrlCache.set(segmentPath, {
    signedUrl: data.signedUrl,
    expiresAtMs: now + SIGNED_URL_EXPIRES_IN_SECONDS * 1000,
  });
  return data.signedUrl;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  const ok = await isAuthorized(req);
  if (!ok) {
    return res.status(401).send('Unauthorized');
  }

  const playlistPath = typeof req.query.path === 'string' ? req.query.path : '';
  if (!playlistPath || !isAllowedVideoPath(playlistPath)) {
    return res.status(400).send('Bad Request');
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(playlistPath, 60);

  if (error?.message?.toLowerCase().includes('object not found') || !data) {
    return res.status(404).send('Not Found');
  }

  const text = await fetchStorageObjectText('videos', playlistPath);
  const baseDir = getDirname(playlistPath);
  const apiOrigin = getPublicApiOrigin(req);

  const lines = text.split(/\r?\n/);
  const rewrittenLines = await Promise.all(
    lines.map(async line => {
      if (!line || line.startsWith('#')) return line;
      if (/^https?:\/\//i.test(line)) return line;
      const segmentPath = joinStoragePath(baseDir, line);
      try {
        // Старый вариант (оставлен для истории): отдавали прямые signed URL на Supabase,
        // но в некоторых браузерах это приводит к ORB/CORS блокировке сегментов.
        // return await getSignedSegmentUrl(supabase, segmentPath);

        // Старый относительный /api/... — на статическом сайте таймаут
        // return `/api/courses/meniscus/hls/segment?path=...`;
        return `${apiOrigin}/api/courses/meniscus/hls/segment?path=${encodeURIComponent(
          segmentPath
        )}`;
      } catch (_e) {
        return line;
      }
    })
  );

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).send(rewrittenLines.join('\n'));
}
