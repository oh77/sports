export interface SportomediaPlayer {
  displayName: string;
  givenName: string;
  surName: string;
  nationality: string | null;
  position: string | null;
  birthDate: string | null;
  /** Team fields are null for players without a current league team. */
  teamAbbrv: string | null;
  teamDisplayName: string | null;
  teamLogo: string | null;
  playerImage: string | null;
  fogisId: number;
  matchesPlayed: number;
  penaltyGoals: number;
  yellowCards: number;
  redCards: number;
  goals: number;
  assists: number;
}

export interface SportomediaStatisticsData {
  statistics: {
    player: SportomediaPlayer[];
  };
}
