import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',  // Включаем статический экспорт для GitHub Pages
  
  // Установка basePath для GitHub Pages
  // При использовании кастомного домена устанавливаем пустую строку
  basePath: '',
  
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
  
  // Установка пустого префикса для асетов при использовании кастомного домена
  assetPrefix: '',
};

export default nextConfig;
