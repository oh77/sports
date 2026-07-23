import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Team logos for SHL/SDHL/HA are SVGs; allow the optimizer to serve them so
    // they load same-origin (needed for the next-game logo color extraction to
    // read canvas pixels without CORS taint). The CSP neutralizes any scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
      {
        protocol: 'https',
        hostname: 'assets.nhle.com',
        port: '',
        pathname: '/logos/**',
      },
    ],
  },
};

export default nextConfig;
