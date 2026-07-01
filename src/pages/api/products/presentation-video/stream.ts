import type { NextApiRequest, NextApiResponse } from 'next';

const PRESENTATION_VIDEO_PATH = 'My Bucket/Resection/Presentation.mp4';

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url) {
    throw new Error('SUPABASE_URL is not set');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return { url, serviceRoleKey };
}

function encodeStoragePath(objectPath: string) {
  return String(objectPath)
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { url, serviceRoleKey } = getSupabaseConfig();
    const encodedPath = encodeStoragePath(PRESENTATION_VIDEO_PATH);
    const upstreamUrl = `${url.replace(/\/$/, '')}/storage/v1/object/videos/${encodedPath}`;

    const headers: Record<string, string> = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    };

    const rangeHeader = req.headers.range;
    if (typeof rangeHeader === 'string' && rangeHeader) {
      headers.Range = rangeHeader;
    }

    const upstream = await fetch(upstreamUrl, { method: 'GET', headers });
    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).send('Upstream Error');
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    const acceptRanges = upstream.headers.get('accept-ranges');
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(buffer);
  } catch (error) {
    return res
      .status(500)
      .send(error instanceof Error ? error.message : 'Internal Server Error');
  }
}
