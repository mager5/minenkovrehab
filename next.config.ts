import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',  // Включаем статический экспорт для GitHub Pages
  
  // Установка basePath для GitHub Pages
  // Если вы используете кастомный домен, установите это в пустую строку
  basePath: process.env.NODE_ENV === 'production' ? '/minenkovrehab' : '',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '**',
      },
    ],
    unoptimized: true, // Необходимо для статического экспорта
  },
  
  // Конфигурация для статических ресурсов
  webpack(config) {
    return config;
  },
  
  // Установите префикс для асетов при деплое на GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/minenkovrehab' : '',
};

export default nextConfig;
