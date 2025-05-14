import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
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
    unoptimized: true,
  },
  
  webpack(config) {
    return config;
  },
  
  assetPrefix: '',
};

export default nextConfig;
