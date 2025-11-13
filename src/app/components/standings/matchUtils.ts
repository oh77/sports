import type { GameInfo } from '@/app/types/domain/game';

export interface LargestWin {
  homeTeam: string;
  homeTeamFull: string;
  homeTeamLogo: string | null;
  awayTeam: string;
  awayTeamFull: string;
  awayTeamLogo: string | null;
  homeScore: number;
  awayScore: number;
  goalDifference: number;
  date: string;
}

export function calculateLargestWins(games: GameInfo[]): {
  homeWins: LargestWin[];
  awayWins: LargestWin[];
} {
  const finishedGames = games.filter((game) => game.state === 'finished');

  const homeWins: LargestWin[] = [];
  const awayWins: LargestWin[] = [];

  finishedGames.forEach((game) => {
    const homeScore = game.homeTeamInfo.score;
    const awayScore = game.awayTeamInfo.score;
    const goalDiff = Math.abs(homeScore - awayScore);

    if (homeScore > awayScore) {
      // Home team won
      homeWins.push({
        homeTeam: game.homeTeamInfo.teamInfo.short,
        homeTeamFull: game.homeTeamInfo.teamInfo.full,
        homeTeamLogo: game.homeTeamInfo.teamInfo.logo || null,
        awayTeam: game.awayTeamInfo.teamInfo.short,
        awayTeamFull: game.awayTeamInfo.teamInfo.full,
        awayTeamLogo: game.awayTeamInfo.teamInfo.logo || null,
        homeScore,
        awayScore,
        goalDifference: goalDiff,
        date: game.startDateTime,
      });
    } else if (awayScore > homeScore) {
      // Away team won
      awayWins.push({
        homeTeam: game.homeTeamInfo.teamInfo.short,
        homeTeamFull: game.homeTeamInfo.teamInfo.full,
        homeTeamLogo: game.homeTeamInfo.teamInfo.logo || null,
        awayTeam: game.awayTeamInfo.teamInfo.short,
        awayTeamFull: game.awayTeamInfo.teamInfo.full,
        awayTeamLogo: game.awayTeamInfo.teamInfo.logo || null,
        homeScore,
        awayScore,
        goalDifference: goalDiff,
        date: game.startDateTime,
      });
    }
  });

  // Sort by goal difference descending, then by total goals scored descending
  homeWins.sort((a, b) => {
    // First sort by goal difference descending
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    // If same difference, sort by total goals scored descending
    const aTotalGoals = a.homeScore + a.awayScore;
    const bTotalGoals = b.homeScore + b.awayScore;
    return bTotalGoals - aTotalGoals;
  });

  awayWins.sort((a, b) => {
    // First sort by goal difference descending
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    // If same difference, sort by total goals scored descending
    const aTotalGoals = a.homeScore + a.awayScore;
    const bTotalGoals = b.homeScore + b.awayScore;
    return bTotalGoals - aTotalGoals;
  });

  return {
    homeWins: homeWins.slice(0, 10),
    awayWins: awayWins.slice(0, 10),
  };
}
