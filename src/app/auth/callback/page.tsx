'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

function getRailwayApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }
  }

  return (
    process.env.NEXT_PUBLIC_RAILWAY_API_URL ||
    'https://minenkovrehab-production-15cc.up.railway.app'
  );
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const exchangeSupabaseSession = async (accessToken: string) => {
      const response = await fetch(
        `${getRailwayApiBaseUrl()}/api/auth/exchange-supabase`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessToken }),
        }
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        const message =
          payload?.error ||
          'Не удалось завершить авторизацию. Попробуйте позже.';
        throw new Error(message);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('mr-auth-changed'));
      }
    };

    const handleCallback = async () => {
      // The supabase client handles the hash fragment automatically
      // We just need to wait for the session to be established
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        setError(sessionError.message);
        setTimeout(() => {
          if (mounted) router.push('/login?error=callback_failed');
        }, 3000);
        return;
      }

      if (session) {
        // Successful login
        try {
          await exchangeSupabaseSession(session.access_token);
        } catch (e: any) {
          setError(e?.message || 'Не удалось завершить авторизацию');
          setTimeout(() => {
            if (mounted) router.push('/login?error=callback_failed');
          }, 3000);
          return;
        }
        router.push('/dashboard');
      } else {
        // If no session found immediately, listen for auth state change
        const { data } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session: Session | null) => {
            if (event === 'SIGNED_IN' && session && mounted) {
              exchangeSupabaseSession(session.access_token)
                .then(() => {
                  router.push('/dashboard');
                })
                .catch((e: any) => {
                  setError(e?.message || 'Не удалось завершить авторизацию');
                  setTimeout(() => {
                    if (mounted) router.push('/login?error=callback_failed');
                  }, 3000);
                });
            }
          }
        );
        authSubscription = data.subscription;
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [router, supabase]);

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center p-8 bg-white rounded-lg shadow-md'>
          <h2 className='text-red-600 text-xl font-bold mb-4'>
            Ошибка авторизации
          </h2>
          <p className='text-gray-700'>{error}</p>
          <p className='text-gray-500 mt-4 text-sm'>
            Перенаправление на страницу входа...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4'></div>
        <p className='text-gray-600'>Завершение авторизации...</p>
      </div>
    </div>
  );
}
