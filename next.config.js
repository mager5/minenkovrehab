/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Отключено для поддержки API роутов
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
    domains: ['images.unsplash.com', '*.unsplash.com', '*.googleusercontent.com', '*.cloudinary.com'],
  },
  // TypeScript и ESLint проверки включены для безопасности
  // Заголовки безопасности добавляются через middleware.ts
  
  // CSP заголовки для поддержки HeyGen StreamingAvatar SDK
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; connect-src 'self' https://api.heygen.com https://*.livekit.cloud wss://*.livekit.cloud; img-src * data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src * data: blob:; worker-src 'self' blob:; frame-src 'self' http://localhost:3001;",
          },
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*",
          },
        ],
      },
    ];
  },
 }

module.exports = nextConfig