'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_OPEN_EVENT,
  isCookieConsentSettled,
  type CookieConsentValue,
} from '@/lib/cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      // Старое cookieConsent=true не сбрасываем: пользователь уже принял cookies.
      if (!isCookieConsentSettled(consent)) setVisible(true);
    }

    const handleOpenSettings = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpenSettings);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpenSettings);
    };
  }, []);

  // Старый вариант (одна кнопка «Принять» → cookieConsent=true):
  // const acceptCookies = () => {
  //   localStorage.setItem('cookieConsent', 'true');
  //   setVisible(false);
  // };

  const saveConsent = (value: CookieConsentValue) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className='fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none'
      data-testid='cookie-banner'
      role='dialog'
      aria-label='Настройки cookie'
    >
      <div className='pointer-events-auto max-w-2xl w-full mx-4 mb-6 px-6 py-4 bg-gray-900 text-white rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-4 animate-fade-in'>
        <span className='flex-1 text-sm sm:text-base'>
          Мы используем cookie для работы сайта. Необязательные cookie
          (аналитика) подключаются только после вашего выбора. Подробнее в нашей{' '}
          <Link
            href='/policy'
            className='underline text-accent hover:text-accent-dark transition-colors'
            target='_blank'
          >
            политике конфиденциальности
          </Link>
          .
        </span>
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0'>
          <button
            type='button'
            onClick={() => saveConsent('necessary')}
            className='w-full sm:w-auto bg-transparent border border-white/40 hover:border-white text-white font-semibold px-5 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent'
          >
            Только необходимые
          </button>
          <button
            type='button'
            onClick={() => saveConsent('all')}
            className='w-full sm:w-auto bg-accent hover:bg-accent-dark text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-accent'
          >
            Принять все
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
