"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookieConsent');
      if (!consent) setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto max-w-2xl w-full mx-4 mb-6 px-6 py-4 bg-gray-900 text-white rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
        <span className="flex-1 text-sm sm:text-base">
          Мы используем cookie для улучшения работы сайта. Подробнее в нашей{' '}
          <Link href="/policy" className="underline text-accent hover:text-accent-dark transition-colors" target="_blank">политике конфиденциальности</Link>.
        </span>
        <button
          onClick={acceptCookies}
          className="bg-accent hover:bg-accent-dark text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Принять
        </button>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 