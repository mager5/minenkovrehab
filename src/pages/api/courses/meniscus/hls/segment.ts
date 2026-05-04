import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const INSTRUCTOR_USER_ID = '6639a601-4007-46d8-a058-fe2cd2086fa1';
const ALLOWED_VIDEO_PATH_PREFIXES = [`${INSTRUCTOR_USER_ID}/`, 'My Bucket/'];

function isAllowedVideoPath(objectPath: string) {
  return ALLOWED_VIDEO_PATH_PREFIXES.some(prefix =>
    String(objectPath || '').startsWith(prefix)
  );
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

function getContentTypeForPath(objectPath: string) {
  const p = String(objectPath || '').toLowerCase();
  if (p.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (p.endsWith('.ts')) return 'video/mp2t';
  if (p.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

async function fetchStorageObject(
  bucket: string,
  objectPath: string,
  rangeHeader?: string
) {
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

  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
  if (rangeHeader) {
    headers.Range = rangeHeader;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  return res;
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

  const objectPath = typeof req.query.path === 'string' ? req.query.path : '';
  if (!objectPath || !isAllowedVideoPath(objectPath)) {
    return res.status(400).send('Bad Request');
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(objectPath, 60);
  if (error?.message?.toLowerCase().includes('object not found') || !data) {
    return res.status(404).send('Not Found');
  }

  const rangeHeader =
    typeof req.headers.range === 'string' ? req.headers.range : undefined;
  const upstream = await fetchStorageObject('videos', objectPath, rangeHeader);
  if (!upstream.ok && upstream.status !== 206) {
    return res.status(upstream.status).send('Upstream Error');
  }

  const contentType = getContentTypeForPath(objectPath);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  const contentLength = upstream.headers.get('content-length');
  if (contentLength) {
    res.setHeader('Content-Length', contentLength);
  }
  const contentRange = upstream.headers.get('content-range');
  if (contentRange) {
    res.setHeader('Content-Range', contentRange);
  }
  const acceptRanges = upstream.headers.get('accept-ranges');
  if (acceptRanges) {
    res.setHeader('Accept-Ranges', acceptRanges);
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  return res.status(upstream.status).send(buffer);
}
