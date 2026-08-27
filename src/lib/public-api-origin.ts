import type { NextApiRequest } from 'next';

function headerFirst(
  value: string | string[] | undefined
): string {
  if (Array.isArray(value)) return String(value[0] || '').trim();
  return String(value || '').trim();
}

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

  // Старый вариант падал на сборке: Object is possibly 'undefined' у req.headers
  // if (req) {
  //   const xfHost = String(req.headers['x-forwarded-host'] || '')
  //     .split(',')[0]
  //     .trim();
  // }
  const headers = req?.headers;
  if (headers) {
    const xfHost = headerFirst(headers['x-forwarded-host']).split(',')[0] || '';
    const host = (xfHost || headerFirst(headers.host)).trim();
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const proto =
        headerFirst(headers['x-forwarded-proto']).split(',')[0] || 'https';
      return `${proto}://${host}`;
    }
  }

  return 'https://api.minenkovrehab.ru';
}
