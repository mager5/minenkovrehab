import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
  },
  
  // Конфигурация для статических ресурсов
  webpack(config) {
    return config;
  },
  
  // Установите базовый путь для фавиконов
  assetPrefix: undefined,
};

export default nextConfig;
