import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CookieBanner from '@/components/CookieBanner';
// import HeyGenWidget from '@/components/shared/HeyGenWidget';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

// Альтернативная конфигурация с явными fallback-шрифтами, если понадобится вернуться:
// const inter = Inter({
//   subsets: ['latin', 'cyrillic'],
//   variable: '--font-inter',
//   display: 'swap',
//   fallback: ['system-ui', 'sans-serif'],
//   adjustFontFallback: false,
// });

export const metadata: Metadata = {
  title: 'Миненков Вадим | Физический реабилитолог',
  description:
    'Персональные восстановительные программы и программы тренировок от врача ЛФК Миненкова Вадима. Восстановление после травм и операций.',
  keywords:
    'физическая реабилитация, реабилитолог, Миненков Вадим, восстановление, травмы, операции, дегенератика, онлайн-консультации, ФОРМУЛА ДВИЖЕНИЯ, восстановительные программы',
  metadataBase: new URL('https://minekovrehab.ru'),
  applicationName: 'Миненков Вадим',
  authors: [{ name: 'Вадим Миненков', url: 'https://minekovrehab.ru' }],
  creator: 'Вадим Миненков',
  publisher: 'Миненков Вадим',
  manifest: '/manifest.json',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: 'website',
    title: 'МиненковRehab | Физический реабилитолог',
    description:
      'Профессиональный подход к физической реабилитации людей среднего и старшего возраста с травмами, операциями и дегенеративными изменениями.',
    url: 'https://minekovrehab.ru',
    siteName: 'МиненковRehab',
    locale: 'ru_RU',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'МиненковRehab - Физическая реабилитация',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'МиненковRehab | Физический реабилитолог',
    description:
      'Профессиональный подход к физической реабилитации людей среднего и старшего возраста с травмами, операциями и дегенеративными изменениями.',
    images: ['/images/og-image.jpg'],
    creator: '@minekovrehab',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#19bd90' },
    { media: '(prefers-color-scheme: dark)', color: '#0e9673' },
  ],
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/favicons/apple-touch-icon.png', type: 'image/png' }],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicons/safari-pinned-tab.svg',
        color: '#0063A5',
      },
      {
        rel: 'android-chrome-192x192',
        url: '/favicons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/favicons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  alternates: {
    canonical: 'https://minekovrehab.ru',
  },
  verification: {
    yandex: 'xxxxxxxx',
    google: 'xxxxxxxx',
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
      className={`${inter.variable} font-sans h-full overflow-x-hidden overflow-y-auto`}
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
        <link rel='icon' href='/favicons/favicon.ico' />
        <link rel='icon' type='image/svg+xml' href='/favicons/favicon.svg' />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicons/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicons/favicon-16x16.png'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/favicons/apple-touch-icon.png'
        />
        <link rel='manifest' href='/manifest.json' />
        <link
          rel='mask-icon'
          href='/favicons/safari-pinned-tab.svg'
          color='#0063A5'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='192x192'
          href='/favicons/android-chrome-192x192.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='512x512'
          href='/favicons/android-chrome-512x512.png'
        />
        <meta name='theme-color' content='#0063A5' />
        <meta name='msapplication-TileColor' content='#0063A5' />
        <meta
          name='msapplication-config'
          content='/favicons/browserconfig.xml'
        />
        {/* Preload мобильного фонового изображения для быстрой загрузки */}
        <link
          rel='preload'
          as='image'
          href='/images/hero/section-banner.jpg'
          media='(max-width: 768px)'
        />
      </head>
      <body className='antialiased min-h-screen flex flex-col h-full overflow-x-hidden overflow-y-auto'>
        <div className='flex flex-col min-h-screen overflow-x-hidden'>
          <a
            href='#main-content'
            className='sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-primary focus:text-white focus:z-50'
          >
            Перейти к основному содержанию
          </a>
          <Header />
          <main id='main-content' className='flex-grow' tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
