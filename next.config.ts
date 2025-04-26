import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',  // Включаем статический экспорт для GitHub Pages
  
  // При использовании на GitHub Pages с кастомным доменом, basePath не нужен
  // Если бы сайт размещался по пути username.github.io/minenkovrehab, то нужно было бы указать:
  // basePath: process.env.NODE_ENV === 'production' ? '/minenkovrehab' : '',
  
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
  
  // Установите базовый путь для фавиконов
  assetPrefix: undefined,
};

export default nextConfig;
