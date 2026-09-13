import type { Sport } from '@/app/types/domain/league';

export type Upstream = {
  /** Swedish label for status messages. */
  label: string;
  /** Environment variable holding the app's base URL. */
  envVar: string;
  /** Used when `envVar` is unset outside Vercel (local development). */
  devUrl: string;
};

/**
 * The sibling apps gameday reads schedules from, one per sport. Both expose
 * `GET /api/games-window`. Locally, run kickoff on :3001 and faceoff on :3002.
 */
export const UPSTREAMS: Record<Sport, Upstream> = {
  football: {
    label: 'fotboll',
    envVar: 'KICKOFF_BASE_URL',
    devUrl: 'http://localhost:3001',
  },
  hockey: {
    label: 'hockey',
    envVar: 'FACEOFF_BASE_URL',
    devUrl: 'http://localhost:3002',
  },
};

export const SPORTS = Object.keys(UPSTREAMS) as Sport[];

/**
 * Base URL of a sport's upstream app, without trailing slash. Read per call so
 * a deployment picks up its environment at runtime. On Vercel a missing
 * variable throws instead of silently falling back to localhost.
 */
export function upstreamBaseUrl(sport: Sport): string {
  const { envVar, devUrl } = UPSTREAMS[sport];
  const value = process.env[envVar]?.trim();
  if (value) return value.replace(/\/+$/, '');
  if (process.env.VERCEL) {
    throw new Error(
      `${envVar} is not set — add it under Vercel → Settings → Environment Variables and redeploy.`,
    );
  }
  return devUrl;
}
