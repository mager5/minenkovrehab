'use client';
// Данные кабинета: текущий пользователь и активные покупки (те же запросы, что и раньше).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRailwayApiBaseUrl } from '@/lib/api-base';
import { authPost } from '@/lib/auth-client';

export type AccountUser = { id: string; email: string | null; full_name: string | null };
export type Purchase = {
  id: string;
  product_id: string;
  status: string;
  slug: string;
  products?: { title?: string; description?: string | null } | null;
};

export function useAccount({ withPurchases = true } = {}) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch(`${getRailwayApiBaseUrl()}/api/auth/session`, {
          method: 'GET',
          credentials: 'include',
        });
        const mePayload = await me.json().catch(() => null);
        if (!me.ok || !mePayload?.success || !mePayload?.data?.user?.id) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        if (cancelled) return;
        setUser(mePayload.data.user);
        if (withPurchases) {
          const res = await fetch(`${getRailwayApiBaseUrl()}/api/auth/purchases`, {
            method: 'GET',
            credentials: 'include',
          });
          const payload = await res.json().catch(() => null);
          if (!cancelled)
            setPurchases(res.ok && payload?.success ? payload?.data?.purchases || [] : []);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, withPurchases]);

  return { user, purchases, loading };
}

/** Выход: как в шапке — POST /api/auth/logout, затем страница входа. */
export async function logout(router: ReturnType<typeof useRouter>) {
  const response = await authPost('/api/auth/logout');
  if (!response.ok) return false;
  window.dispatchEvent(new Event('mr-auth-changed'));
  router.push('/login');
  router.refresh();
  return true;
}
