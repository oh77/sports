import type { UefaTeam, UefaTranslations } from '@/app/types/uefa/matches';

export interface UefaStandingItem {
  rank: number;
  previousRank?: number;
  rankTrend?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualified?: boolean;
  isQualifying?: boolean;
  isLive?: boolean;
  isTied?: boolean;
  team: UefaTeam;
}

export interface UefaStandingsGroup {
  group: {
    id?: string;
    competitionId?: string;
    phase?: string;
    roundId?: string;
    seasonYear?: string;
    teamsQualifiedNumber?: number;
    translations?: { name?: UefaTranslations };
  };
  items: UefaStandingItem[];
}
