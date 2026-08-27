/**
 * Базовый URL API для клиента.
 * Прод: https://api.minenkovrehab.ru (VPS → Railway)
 * Локально в браузере: '' → относительные /api/*
 */
export const DEFAULT_API_BASE_URL = 'https://api.minenkovrehab.ru';

// Старый fallback:
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

/**
 * Относительные /api/... (HLS master/segment) на статическом сайте
 * иначе открываются с minenkovrehab.ru и таймаутятся.
 * Абсолютные *.railway.app → api.minenkovrehab.ru (без VPN).
 */
export function resolveApiMediaUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.endsWith('railway.app')) {
        // Старый ответ API с Host Railway — подменяем на публичный домен
        parsed.protocol = 'https:';
        parsed.host = new URL(DEFAULT_API_BASE_URL).host;
        return parsed.toString();
      }
    } catch {
      // ignore
    }
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    const base = getRailwayApiBaseUrl();
    return base ? `${base}${trimmed}` : trimmed;
  }

  return trimmed;
}
