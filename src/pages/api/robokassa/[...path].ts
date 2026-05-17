import type { NextApiRequest, NextApiResponse } from 'next';

const REMOTE_BASE =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL ||
  'https://minenkovrehab-production-15cc.up.railway.app';

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', err => reject(err));
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pathParts = req.query.path;
  const path = Array.isArray(pathParts)
    ? pathParts.join('/')
    : String(pathParts || '');
  const targetUrl = new URL(
    `/api/robokassa/${path}`,
    REMOTE_BASE.endsWith('/') ? REMOTE_BASE : `${REMOTE_BASE}/`
  );

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    const lower = key.toLowerCase();
    if (
      lower === 'host' ||
      lower === 'content-length' ||
      lower === 'connection' ||
      lower === 'origin' ||
      lower === 'referer'
    )
      continue;
    headers[key] = Array.isArray(value) ? value.join(',') : String(value);
  }

  let body: Buffer | undefined;
  const method = (req.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = String(req.headers['content-type'] || '');
    if (contentType.includes('application/json')) {
      body = Buffer.from(JSON.stringify(req.body ?? {}), 'utf8');
    } else if (typeof req.body === 'string') {
      body = Buffer.from(req.body, 'utf8');
    } else if (Buffer.isBuffer(req.body)) {
      body = req.body;
    } else if (req.body && typeof req.body === 'object') {
      body = Buffer.from(JSON.stringify(req.body), 'utf8');
      if (!headers['Content-Type'])
        headers['Content-Type'] = 'application/json';
    } else {
      body = await getRawBody(req);
    }
  }

  const init: RequestInit = { method, headers, redirect: 'manual' };
  if (body) {
    init.body = new Uint8Array(body);
  }

  const upstream = await fetch(targetUrl.toString(), init);

  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'set-cookie') return;
    if (lower.startsWith('access-control-')) return;
    res.setHeader(key, value);
  });

  res.status(upstream.status);
  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.send(buffer);
}
