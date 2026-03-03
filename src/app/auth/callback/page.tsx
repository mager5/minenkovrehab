'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

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
        router.push('/dashboard');
      } else {
        // If no session found immediately, listen for auth state change
        const { data } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session: Session | null) => {
            if (event === 'SIGNED_IN' && session && mounted) {
              router.push('/dashboard');
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
