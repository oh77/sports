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
        // Team badges, built by plBadgeUrl().
        protocol: 'https',
        hostname: 'resources.premierleague.com',
        pathname: '/premierleague25/badges/**',
      },
      {
        // Allsvenskan/Superettan team logos, straight from the Sportomedia
        // payload — the path shape is theirs, so this stays broad.
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
        // UEFA competition logos, team logos, country flags and player photos.
        protocol: 'https',
        hostname: 'img.uefa.com',
        pathname: '/imgml/**',
      },
      {
        protocol: 'https',
        hostname: 'allsvenskan.se',
        pathname: '/wp-content/themes/sef-leagues/**',
      },
      {
        protocol: 'https',
        hostname: 'superettan.se',
        pathname: '/wp-content/themes/sef-leagues/**',
      },
    ],
    // The only local images are the three league logos in public/assets.
    localPatterns: [{ pathname: '/assets/**', search: '' }],

    // Badges and league logos are versioned by the provider, so a month-long
    // cache floor is safe. Next's default is 4 hours.
    minimumCacheTTL: 2678400,
    qualities: [75],

    // Nothing renders above 72px (TeamBadge 'lg'), so the 1920/2048/3840 tail
    // only ever produced renditions nobody asked for.
    imageSizes: [32, 48, 64, 96, 128, 256],
    deviceSizes: [640, 828, 1080],

    // Team badges are SVGs served by the providers.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
