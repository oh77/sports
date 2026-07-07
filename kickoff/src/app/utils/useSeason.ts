'use client';

import { useParams } from 'next/navigation';

/**
 * Read the active season key from the route (`/[league]/[season]/...`).
 * Returns undefined before navigation has a season segment.
 */
export function useSeason(): string | undefined {
  const season = useParams()?.season;
  return typeof season === 'string' ? season : undefined;
}
