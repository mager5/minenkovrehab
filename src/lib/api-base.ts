// Browser requests always use the same-origin, explicitly configured server proxy.
export const DEFAULT_API_BASE_URL = '';
export function getRailwayApiBaseUrl(): string { return ''; }
export function getRobokassaPaymentUrl(): string { return '/api/checkout'; }
export function resolveApiMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const value=url.trim();
  // No automatic public Railway/Supabase/working API fallback.
  if(value.startsWith('/api/'))return value;
  return null;
}
