import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Гарантия: не падать при SSG/SSR и в превью без env на Vercel
  const isBrowser = typeof window !== 'undefined';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isBrowser || !url || !anon) {
    const noop = () => {};
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: (_cb: any) => ({
          data: { subscription: { unsubscribe: noop } },
        }),
        signOut: async () => ({ error: null }),
      },
    } as any;
  }

  return createBrowserClient(url, anon);
}
