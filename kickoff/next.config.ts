import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The app lives inside the gameday repo, which has its own lockfile at the
  // repo root — pin the workspace root so Next doesn't infer the wrong one.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resources.premierleague.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'data-20ca4.kxcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'information-20ca4.kxcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.uefa.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'allsvenskan.se',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.premierleague.com',
        pathname: '/**',
      },
    ],
    // Team badges are SVGs served by the providers.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
