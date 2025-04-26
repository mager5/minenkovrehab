import React from 'react';
import Head from 'next/head';

const Favicons: React.FC = () => {
  return (
    <Head>
      {/* Основные фавиконы */}
      <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
      <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
      
      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
      
      {/* PWA manifest */}
      <link rel="manifest" href="/favicons/site.webmanifest" />
      
      {/* Microsoft */}
      <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#0063A5" />
      <meta name="msapplication-TileColor" content="#0063A5" />
      <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#0063A5" />
    </Head>
  );
};

export default Favicons; 