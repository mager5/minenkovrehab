import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Миненков Вадим | Физический реабилитолог",
  description: "Профессиональный подход к физической реабилитации людей среднего и старшего возраста с травмами, операциями и дегенеративными изменениями. Онлайн-консультации, программы и протоколы восстановления.",
  keywords: "физическая реабилитация, реабилитолог, Миненков Вадим, восстановление, травмы, операции, дегенератика, онлайн-консультации, ФОРМУЛА ДВИЖЕНИЯ, реабилитационные протоколы",
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
    description: 'Профессиональный подход к физической реабилитации людей среднего и старшего возраста с травмами, операциями и дегенеративными изменениями.',
    url: 'https://minekovrehab.ru',
    siteName: 'МиненковRehab',
    locale: 'ru_RU',
    images: [
      {
        url: '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'МиненковRehab - Физическая реабилитация',
        type: 'image/svg+xml',
      },
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
    description: 'Профессиональный подход к физической реабилитации людей среднего и старшего возраста с травмами, операциями и дегенеративными изменениями.',
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
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png', type: 'image/png' },
    ],
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
        type: 'image/png'
      },
      {
        rel: 'android-chrome-512x512',
        url: '/favicons/android-chrome-512x512.png', 
        sizes: '512x512',
        type: 'image/png'
      }
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#19bd90' },
    { media: '(prefers-color-scheme: dark)', color: '#0E9673' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full overflow-x-hidden overflow-y-auto">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="icon" href="/favicons/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#0063A5" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicons/android-chrome-512x512.png" />
        <meta name="theme-color" content="#0063A5" />
        <meta name="msapplication-TileColor" content="#0063A5" />
        <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col h-full overflow-x-hidden overflow-y-auto`}>
        <div className="flex flex-col min-h-screen overflow-x-hidden">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-primary focus:text-white focus:z-50">
            Перейти к основному содержанию
          </a>
          <Header />
          <main id="main-content" className="flex-grow" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
