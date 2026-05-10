/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gymfy/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'baqxljihngymjnasrdtl.supabase.co' },
    ],
  },
};

module.exports = nextConfig;
