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
      <div className='pointer-events-auto isolate w-full max-w-[400px] bg-white text-ink rounded-[24px] shadow-pop px-5 py-4 animate-fade-in'>
        <p
          id='cookie-banner-title'
          className='m-0 text-[16px] font-extrabold text-navy'
        >
          Мы используем cookie
        </p>
        <p
          id='cookie-banner-text'
          className='mt-1 mb-0 text-[15px] leading-[1.5] text-muted'
        >
          Необходимые cookie помогают сайту работать: сохраняют вход в аккаунт и
          ваши настройки. Аналитика может включаться только с вашего согласия.
        </p>
        <Link
          href='/policy'
          className='mt-1.5 inline-block text-[15px] font-semibold text-brand hover:text-navy underline underline-offset-2'
          target='_blank'
        >
          Подробнее в политике конфиденциальности
        </Link>
        <div className='mt-3 flex flex-col sm:flex-row gap-2'>
          <button
            type='button'
            onClick={() => saveConsent('necessary')}
            className='flex-1 min-h-[48px] px-4 py-2 rounded-full bg-sky text-navy hover:bg-[#d5e6f3] transition-colors border-0 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30'
          >
            <span className='block text-[15px] font-bold leading-tight'>
              Только необходимые
            </span>
            <span className='block text-[15px] font-medium text-muted leading-tight mt-0.5'>
              Без аналитики
            </span>
          </button>
          <button
            type='button'
            onClick={() => saveConsent('all')}
            className='flex-1 min-h-[48px] px-4 py-2 rounded-full bg-brand hover:bg-navy text-white font-bold text-[15px] border-0 cursor-pointer transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30'
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
