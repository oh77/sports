import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The app lives inside the gameday repo alongside kickoff/faceoff — pin the
  // workspace root so Next doesn't infer the wrong lockfile.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Team logos come from whatever provider CDNs kickoff and faceoff pass
    // through, and are rendered at 20–32px. Serving them as-is avoids
    // mirroring both apps' remotePatterns lists here.
    unoptimized: true,
  },
};

export default nextConfig;
