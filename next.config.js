/** @type {import('next').NextConfig} */
module.exports = {
  // Migration uses SSR; API routing is handled by an explicit server proxy.
  images: { unoptimized: true, remotePatterns: [
    { protocol:'https',hostname:'images.unsplash.com' },
    { protocol:'https',hostname:'*.googleusercontent.com' },
    { protocol:'https',hostname:'*.cloudinary.com' },
  ] },
  experimental: { cpus: 2 },
  // Старые адреса программ — постоянный редирект 301.
  async redirects(){return [
    {source:'/products/personal-program',destination:'/products/meniscus-resection',statusCode:301},
    {source:'/products/rehabilitation-protocols',destination:'/products/rehab-programs',statusCode:301},
  ];},
  async headers(){return [{source:'/(.*)',headers:[
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'no-referrer'},
    {key:'X-Frame-Options',value:'DENY'},
  ]}];},
};
