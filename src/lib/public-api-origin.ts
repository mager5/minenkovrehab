import type { NextApiRequest } from 'next';

/**
 * Публичный origin API для абсолютных HLS URL в m3u8.
 * Браузер на GitHub Pages не должен резолвить /api/... относительно сайта.
 */
export function getPublicApiOrigin(req?: NextApiRequest): string {
  const fromEnv = (
    process.env.NEXT_PUBLIC_RAILWAY_API_URL ||
    process.env.PUBLIC_API_BASE_URL ||
    ''
  )
    .trim()
    .replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (req) {
    const xfHost = String(req.headers['x-forwarded-host'] || '')
      .split(',')[0]
      .trim();
    const host = xfHost || String(req.headers.host || '').trim();
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const proto =
        String(req.headers['x-forwarded-proto'] || '')
          .split(',')[0]
          .trim() || 'https';
      return `${proto}://${host}`;
    }
  }

  return 'https://api.minenkovrehab.ru';
}
