import type { PulselivePagination } from '@/app/types/pulselive/matches';

export interface PulselivePlayerMetadata {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  knownName?: string;
  position?: string;
  currentTeam: {
    name: string;
    id: string;
    shortName: string;
  };
  country?: {
    isoCode: string;
    country: string;
    demonym?: string;
  };
}

export interface PulselivePlayerEntry {
  playerMetadata: PulselivePlayerMetadata;
  /**
   * Large flat bag of per-season numbers (floats). Keys we rely on:
   * gamesPlayed/appearances, goals, goalAssists, yellowCards, totalRedCards,
   * timePlayed, penaltyGoals. Absent entirely for seasons that have not
   * started yet.
   */
  stats?: Record<string, number | undefined>;
}

export interface PulselivePlayersResponse {
  pagination: PulselivePagination;
  data: PulselivePlayerEntry[];
}
