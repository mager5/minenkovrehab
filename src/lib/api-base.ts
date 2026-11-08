// Browser requests always use the same-origin, explicitly configured server proxy.
export const DEFAULT_API_BASE_URL = '';
export function getRailwayApiBaseUrl(): string { return ''; }
export function getRobokassaPaymentUrl(): string { return '/api/checkout'; }
export function resolveApiMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const value=url.trim();
  // No automatic public Railway/Supabase/working API fallback.
  if(value.startsWith('/api/'))return value;
  if(/^https:\/\/kinescope\.io\/embed\/[A-Za-z0-9_-]{4,64}(\?[A-Za-z0-9_.~%=&-]*)?$/.test(value))return value;
  return null;
}

export const isKinescopeEmbed=(url: string | null | undefined): boolean => !!url && url.startsWith('https://kinescope.io/embed/');
