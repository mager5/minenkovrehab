/** @type {import('next').NextConfig} */
module.exports = {
  // Migration uses SSR; API routing is handled by an explicit server proxy.
  images: { unoptimized: true, remotePatterns: [
    { protocol:'https',hostname:'images.unsplash.com' },
    { protocol:'https',hostname:'*.googleusercontent.com' },
    { protocol:'https',hostname:'*.cloudinary.com' },
  ] },
  experimental: { cpus: 2 },
  async headers(){return [{source:'/(.*)',headers:[
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'no-referrer'},
    {key:'X-Frame-Options',value:'DENY'},
  ]}];},
};
