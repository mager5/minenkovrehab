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
      className='fixed bottom-0 left-0 right-0 z-50 flex justify-center sm:justify-end pointer-events-none p-3 sm:p-5'
      data-testid='cookie-banner'
      role='dialog'
      aria-labelledby='cookie-banner-title'
      aria-describedby='cookie-banner-text'
    >
      <div className='pointer-events-auto isolate w-full max-w-[400px] bg-white text-dark rounded-2xl shadow-[0_16px_40px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.06] px-4 py-3 sm:px-5 sm:py-3.5 animate-fade-in'>
        <p
          id='cookie-banner-title'
          className='text-sm sm:text-[15px] font-semibold text-dark tracking-tight'
        >
          Мы используем cookie
        </p>
        <p
          id='cookie-banner-text'
          className='mt-1 text-[12.5px] sm:text-[13px] leading-[1.45] text-[#4b5563]'
        >
          Необходимые cookie помогают сайту работать: сохраняют вход в аккаунт и
          ваши настройки. Аналитика может включаться только с вашего согласия.
        </p>
        <Link
          href='/policy'
          className='mt-1.5 inline-block text-[12.5px] sm:text-[13px] font-medium text-accent hover:text-accent-dark underline-offset-2 hover:underline transition-colors'
          target='_blank'
        >
          Подробнее в политике конфиденциальности
        </Link>
        <div className='mt-3 flex flex-col sm:flex-row gap-2'>
          <button
            type='button'
            onClick={() => saveConsent('necessary')}
            className='flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 bg-white text-dark hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40'
          >
            <span className='block text-[13px] font-semibold leading-tight'>
              Только необходимые
            </span>
            <span className='block text-[11px] font-normal text-[#6b7280] leading-tight mt-0.5'>
              Без аналитики
            </span>
          </button>
          <button
            type='button'
            onClick={() => saveConsent('all')}
            className='flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white font-semibold text-[13px] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50'
          >
            Принять все
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
