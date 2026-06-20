'use client';

import { useParams } from 'next/navigation';

/**
 * Read the active season key from the route (`/[league]/[season]/...`).
 * Returns undefined in season-less contexts (CHL, or before navigation has a
 * season segment), which the leaguePaths helpers treat as "no season segment".
 */
export function useSeason(): string | undefined {
  const season = useParams()?.season;
  return typeof season === 'string' ? season : undefined;
}
