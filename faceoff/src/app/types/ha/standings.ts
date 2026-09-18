/** A row of the `stats.league-standings` block. Every value is a string. */
export interface HaStandingsRow {
  rank: string;
  /** Display code, e.g. "MORA". */
  teamCode: string;
  /** Statnet id, e.g. "MIK"; matches `homeStatNetId` on games. */
  teamId: string;
  games_played: string;
  wins: string;
  losses: string;
  ties: string;
  overtime_wins: string;
  overtime_losses: string;
  shootouts_wins: string;
  shootouts_losses: string;
  goals: string;
  goals_against: string;
  goal_difference: string;
  total_points: string;
}
