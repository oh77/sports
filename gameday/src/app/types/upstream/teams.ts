import type { UpstreamTeamInfo } from '@/app/types/upstream/games-window';

/**
 * Response of `GET /api/teams` in kickoff and faceoff. Leagues that failed to
 * load upstream are absent.
 */
export interface TeamsResponse {
  leagues: { league: string; teams: UpstreamTeamInfo[] }[];
}
