import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPublicApiOrigin } from '@/lib/public-api-origin';

const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';
const ALLOWED_VIDEO_PATH_PREFIXES = [`${INSTRUCTOR_USER_ID}/`, 'My Bucket/'];

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

  const masterPath = typeof req.query.path === 'string' ? req.query.path : '';
  if (!masterPath || !isAllowedVideoPath(masterPath)) {
    return res.status(400).send('Bad Request');
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(masterPath, 60);

  if (error?.message?.toLowerCase().includes('object not found') || !data) {
    return res.status(404).send('Not Found');
  }

  const text = await fetchStorageObjectText('videos', masterPath);
  const baseDir = getDirname(masterPath);
  const apiOrigin = getPublicApiOrigin(req);

  const rewritten = text
    .split(/\r?\n/)
    .map(line => {
      if (!line || line.startsWith('#')) return line;
      const variantPath = joinStoragePath(baseDir, line);
      // Старый относительный путь ломал плеер на GitHub Pages:
      // return `/api/courses/meniscus/hls/playlist?path=...`
      return `${apiOrigin}/api/courses/meniscus/hls/playlist?path=${encodeURIComponent(
        variantPath
      )}`;
    })
    .join('\n');

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).send(rewritten);
}
