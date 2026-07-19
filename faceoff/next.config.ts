import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.chl.hockey',
        port: '',
        pathname: '/static/img/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/chl-production/image/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'sportality.cdn.s8y.se',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
