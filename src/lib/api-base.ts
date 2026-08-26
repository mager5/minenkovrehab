/**
 * Базовый URL Railway/API для клиента и серверных прокси.
 * Прод: https://api.minenkovrehab.ru (Cloudflare → Railway)
 * Локально в браузере: '' → относительные /api/* через Next rewrites/pages.
 */
export const DEFAULT_API_BASE_URL = 'https://api.minenkovrehab.ru';

// Старый fallback (оставлен для истории):
// export const DEFAULT_API_BASE_URL =
//   'https://minenkovrehab-production-15cc.up.railway.app';

export function getRailwayApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }
  }

  const fromEnv = (process.env.NEXT_PUBLIC_RAILWAY_API_URL || '').trim();
  return fromEnv || DEFAULT_API_BASE_URL;
}

export function getRobokassaPaymentUrl(): string {
  const base = getRailwayApiBaseUrl();
  return `${base}/api/robokassa/generate-payment-url`;
}
