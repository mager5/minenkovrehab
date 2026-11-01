/** @type {import('next').NextConfig} */
module.exports = {
  // Migration uses SSR; API routing is handled by an explicit server proxy.
  images: { unoptimized: true, remotePatterns: [
    { protocol:'https',hostname:'images.unsplash.com' },
    { protocol:'https',hostname:'*.googleusercontent.com' },
    { protocol:'https',hostname:'*.cloudinary.com' },
  ] },
  experimental: { cpus: 2, agentUpgrade: 'security' },
  async headers() {
    const rules=[{source:'/(.*)',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'no-referrer'},
      {key:'X-Frame-Options',value:'DENY'},
    ]}];
    // Only the local, development-only mobile preview may frame this same origin.
    // Production and every other route retain the existing DENY policy.
    if(process.env.AI_TEST_ENABLED==='1' && process.env.NODE_ENV==='development')rules.push({source:'/',has:[{type:'query',key:'ai-preview',value:'phone'}],headers:[{key:'X-Frame-Options',value:'SAMEORIGIN'}]});
    return rules;
  },
};
