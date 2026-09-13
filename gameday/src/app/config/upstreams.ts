import type { Sport } from '@/app/types/domain/league';

export type Upstream = {
  /** Swedish label for status messages. */
  label: string;
  baseUrl: string;
};

/**
 * The sibling apps gameday reads schedules from, one per sport. Both expose
 * `GET /api/games-window`. Locally, run kickoff on :3001 and faceoff on :3002.
 */
export const UPSTREAMS: Record<Sport, Upstream> = {
  football: {
    label: 'fotboll',
    baseUrl: process.env.KICKOFF_BASE_URL ?? 'http://localhost:3001',
  },
  hockey: {
    label: 'hockey',
    baseUrl: process.env.FACEOFF_BASE_URL ?? 'http://localhost:3002',
  },
};

export const SPORTS = Object.keys(UPSTREAMS) as Sport[];
