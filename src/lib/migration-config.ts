// Shared by Edge middleware, SSR and API proxy. No production fallbacks.
export function migrationBackendOrigin(): string | null {
  if (!['local', 'staging', 'private'].includes(process.env.MIGRATION_ENV || '')) return null;
  const value = process.env.MIGRATION_API_INTERNAL_URL;
  const site = process.env.MIGRATION_SITE_ORIGIN;
  if (!value || !site) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== value || url.username || url.password ||
        /minenkovrehab\.(ru|github\.io)$|supabase\./i.test(url.hostname)) return null;
    if (process.env.MIGRATION_ENV === 'local' && !['localhost','127.0.0.1','[::1]'].includes(url.hostname)) return null;
    if (process.env.MIGRATION_ENV !== 'local' && new URL(site).protocol !== 'https:') return null;
    return url.origin;
  } catch { return null; }
}

export type SessionUser = { id: string; email: string; full_name: string | null };
export async function readMigrationSession(cookie: string): Promise<{ status: number; user: SessionUser | null }> {
  const origin = migrationBackendOrigin();
  if (!origin) return { status: 503, user: null };
  try {
    const response = await fetch(`${origin}/api/auth/me`, {
      headers: { cookie }, cache: 'no-store', signal: AbortSignal.timeout(5000), redirect: 'error',
    });
    const data = await response.json();
    if (response.ok && data?.success && data?.data?.user?.id) return { status: 200, user: data.data.user };
    return { status: response.status === 401 ? 401 : 503, user: null };
  } catch { return { status: 503, user: null }; }
}
