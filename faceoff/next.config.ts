import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Nearly every image in the app is a league or team logo that the optimizer
    // can only make worse: SHL/SDHL/NHL logos are SVGs, HA's are already WebP,
    // and CHL's arrive from Cloudinary pre-transformed. Those all pass
    // `unoptimized` and go straight from the provider CDN. What is left on the
    // optimizer is NHL player headshots (PNG mugs, rendered at 36px) and the
    // 64px sample useDominantColor takes — the settings below are sized for
    // exactly those two.

    // Team logos for SHL/SDHL/HA are SVGs; allow the optimizer to serve them so
    // they load same-origin (needed for the next-game logo color extraction to
    // read canvas pixels without CORS taint). The CSP neutralizes any scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Logos change between seasons and headshots on transactions, so a month is
    // well inside their real lifetime. Next's default is 60 seconds, which
    // re-runs (and re-bills) the same transformation all day long.
    minimumCacheTTL: 2678400,

    // Without an allowlist any `q` in a /_next/image URL is transformable, so a
    // single source image can fan out to 100 renditions. 75 is what both the
    // Image component and useDominantColor ask for.
    qualities: [75],

    // Fixed-width images request `width` and `width * 2`, each snapped up to the
    // next allowed size. Leaving the 2048/3840 tail in place meant a decorative
    // background logo asked for a 3840px rendition; nothing here renders above
    // ~96px. 64 must stay — useDominantColor requests it by hand.
    imageSizes: [32, 48, 64, 96, 128, 256],
    deviceSizes: [640, 828, 1080],

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
        // SHL/SDHL/HA league and team logos. Team logo paths come from the
        // statnet payload rather than from us, so this stays broad until we
        // have a captured sample that pins the prefix down.
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
      {
        // HA team logos (Strapi media on the hockeyallsvenskan.se CMS).
        protocol: 'https',
        hostname: 'ha-media.hadigital.se',
        port: '',
        pathname: '/ha-league/**',
      },
      {
        // Player headshots on the NHL roster pages.
        protocol: 'https',
        hostname: 'assets.nhle.com',
        port: '',
        pathname: '/mugs/**',
      },
    ],
  },
};

export default nextConfig;
