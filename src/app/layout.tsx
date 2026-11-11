// Шрифт Manrope (400–800) раздаётся с нашего сервера через next/font (без запроса к Google Fonts
// при сборке и в браузере): вариативный woff2 с латиницей и кириллицей лежит в src/fonts.
import localFont from 'next/font/local';
import KeyboardSafe from '@/components/shared/KeyboardSafe';
import Splash from '@/components/shared/Splash';
import './globals.css';
import { Header } from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CookieBanner from '@/components/CookieBanner';
// import HeyGenWidget from '@/components/shared/HeyGenWidget';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { BRAND, SITE_URL } from '@/lib/seo';

const manrope = localFont({
  src: '../fonts/Manrope-Variable.woff2',
  weight: '200 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-manrope',
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Телефон: env(safe-area-inset-*) для нижней плашки покупки; клавиатура уменьшает область страницы (Android).
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#0D3C63',
};

// Корневые метаданные: только общее для всего сайта.
// canonical, og:title, og:url и прочее задаёт каждая страница сама (см. src/lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: BRAND,
  description:
    'Персональные восстановительные программы и онлайн-тренировки от инструктора-методиста ЛФК Вадима Миненкова. Восстановление после травм и операций.',
  applicationName: BRAND,
  // Один meta author (без дублирующего creator).
  authors: [{ name: 'Вадим Миненков', url: SITE_URL }],
  publisher: BRAND,
  manifest: '/manifest.json',
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/favicons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      {
        url: '/favicons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicons/safari-pinned-tab.svg',
        color: '#0063A5',
      },
    ],
  },
  verification: {
    yandex: '3cabca068319b035',
    google: 'NfKG4Obn62C9l819n4oDFJbwo7YBssE1xKy-rGZWLPM',
  },
  other: {
    'msapplication-TileColor': '#0D3C63',
    'msapplication-config': '/favicons/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='ru'
      className={`${manrope.variable} font-sans h-full overflow-x-hidden overflow-y-auto`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='mr_chunk_reload_attempted';var shouldReload=function(err){var msg='';try{msg=String((err&&err.message)||err||'')}catch(e){}return msg.includes('ChunkLoadError')||msg.includes('Loading chunk')||msg.includes('loading chunk')||msg.includes('chunk');};var reload=function(){try{if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');var url=new URL(window.location.href);if(!url.searchParams.get('mr_chunk_reload')){url.searchParams.set('mr_chunk_reload','1');}window.location.replace(url.toString());}catch(e){try{window.location.reload();}catch(e2){}}};window.addEventListener('error',function(e){var err=e&&e.error?e.error:e;if(shouldReload(err))reload();});window.addEventListener('unhandledrejection',function(e){var r=e&&e.reason?e.reason:e;if(shouldReload(r))reload();});}catch(e){}})();`,
          }}
        />
        <meta
          httpEquiv='Cache-Control'
          content='no-cache, no-store, must-revalidate'
        />
        <meta httpEquiv='Pragma' content='no-cache' />
        <meta httpEquiv='Expires' content='0' />
      </head>
      <body className='antialiased min-h-screen flex flex-col h-full overflow-x-hidden overflow-y-auto'>
        {/* Заставка с логотипом при загрузке страницы (как у NKX Padel) */}
        <Splash />
        {/* overflow-x-clip (а не hidden): не создаёт контейнер прокрутки, поэтому sticky-элементы работают */}
        <div className='flex flex-col min-h-screen overflow-x-clip'>
          <a
            href='#main-content'
            className='sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-brand focus:text-white focus:z-[60] focus:rounded-full focus:m-2'
          >
            Перейти к основному содержанию
          </a>
          <Header />
          <main id='main-content' className='flex-grow' tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <KeyboardSafe />
        </div>
        {/* Кнопка «Наверх» и Яндекс.Метрика (только после согласия на cookie) */}
        <Script src='/js/scroll-top.js' strategy='afterInteractive' />
        <Script src='/js/metrika.js' strategy='afterInteractive' />
      </body>
    </html>
  );
}
