import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import type { StandingsData, TeamStats } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';

export const getTeamCode = (team: TeamStats): string => team.info.code;

export const getTeamName = (team: TeamStats): string => team.info.short;

export const getTeamLogo = (team: TeamStats): string => team.info.logo;

export const getRankDisplay = (rank: number | null): string =>
  rank === null ? '-' : rank.toString();

export const getRankBorderClass = (
  league: League,
  tablePosition: number,
  totalTeams: number,
): string => {
  if (league === 'shl') {
    // SHL: playoff (top 6), playoff qualification (next 4), relegation (last 2)
    if (tablePosition <= 6) return 'border-r-4 border-yellow-400'; // Playoff spots
    if (tablePosition <= 10) return 'border-r-4 border-blue-400'; // Playoff qualification
    if (tablePosition >= totalTeams - 1) return 'border-r-4 border-red-400'; // Relegation zone
  } else if (league === 'sdhl') {
    // SDHL: playoff (top 8), no playoff qualification, relegation (last 2)
    if (tablePosition <= 8) return 'border-r-4 border-yellow-400'; // Playoff spots
    if (tablePosition >= totalTeams - 1) return 'border-r-4 border-red-400'; // Relegation zone
  } else if (league === 'chl') {
    // CHL: playoff (top 16), no playoff qualification, no relegation
    if (tablePosition <= 16) return 'border-r-4 border-yellow-400'; // Playoff spots
  }
  return '';
};

export function calculateStandingsFromGames(
  games: GameInfo[],
  filter: 'home' | 'away',
): StandingsData {
  // Filter games by finished state
  const finishedGames = games.filter((game) => game.state === 'finished');

  // Extract unique teams from games
  const teamMap = new Map<string, TeamInfo>();
  finishedGames.forEach((game) => {
    const homeTeam = game.homeTeamInfo.teamInfo;
    const awayTeam = game.awayTeamInfo.teamInfo;
    if (!teamMap.has(homeTeam.code)) {
      teamMap.set(homeTeam.code, homeTeam);
    }
    if (!teamMap.has(awayTeam.code)) {
      teamMap.set(awayTeam.code, awayTeam);
    }
  });

  // Calculate stats for each team
  const teamStatsMap = new Map<string, TeamStats>();

  // Initialize stats for all teams
  teamMap.forEach((team) => {
    teamStatsMap.set(team.code, {
      Rank: null,
      Team: 0,
      GP: 0,
      W: 0,
      L: 0,
      G: 0,
      GPG: '0.00',
      GA: 0,
      GAPG: '0.00',
      SOW: 0,
      SOL: 0,
      Points: 0,
      OTW: 0,
      OTL: 0,
      info: team,
    });
  });

  // Process games - only count stats for teams playing at home (if filter='home') or away (if filter='away')
  finishedGames.forEach((game) => {
    const teamToProcess =
      filter === 'home' ? game.homeTeamInfo : game.awayTeamInfo;
    const opponent = filter === 'home' ? game.awayTeamInfo : game.homeTeamInfo;

    const teamCode = teamToProcess.teamInfo.code;

    // Skip if team not in our teams list
    if (!teamStatsMap.has(teamCode)) return;

    const stats = teamStatsMap.get(teamCode);
    if (!stats) return;
    const teamGoals = teamToProcess.score;
    const oppGoals = opponent.score;

    stats.GP++;
    stats.G += teamGoals;
    stats.GA += oppGoals;

    const won = teamGoals > oppGoals;
    const wentOT = Boolean(game.overtime || game.shootout);

    if (won) {
      if (wentOT) {
        stats.OTW = (stats.OTW ?? 0) + 1;
      } else {
        stats.W++;
      }
    } else if (teamGoals < oppGoals) {
      if (wentOT) {
        stats.OTL = (stats.OTL ?? 0) + 1;
      } else {
        stats.L++;
      }
    }

    // Calculate points: win=3, overtime win=2, overtime loss=1
    stats.Points = stats.W * 3 + (stats.OTW ?? 0) * 2 + (stats.OTL ?? 0) * 1;
  });

  // Convert to array and sort by points, then goal difference
  const teamStats = Array.from(teamStatsMap.values()).sort((a, b) => {
    // First by points
    if (b.Points !== a.Points) {
      return b.Points - a.Points;
    }
    // Then by goal difference
    const aGoalDiff = a.G - a.GA;
    const bGoalDiff = b.G - b.GA;
    return bGoalDiff - aGoalDiff;
  });

  // Assign ranks
  teamStats.forEach((stat, index) => {
    stat.Rank = index + 1;
  });

  return {
    dataColumns: [],
    stats: teamStats,
  };
}

export function calculateStandingsFromLastNGames(
  games: GameInfo[],
  n: number,
): StandingsData {
  // Filter games by finished state and sort by date (most recent first)
  const finishedGames = games
    .filter((game) => game.state === 'finished')
    .sort((a, b) => {
      // Sort by date descending (most recent first)
      return (
        new Date(b.startDateTime).getTime() -
        new Date(a.startDateTime).getTime()
      );
    });

  // Extract unique teams from games
  const teamMap = new Map<string, TeamInfo>();
  finishedGames.forEach((game) => {
    const homeTeam = game.homeTeamInfo.teamInfo;
    const awayTeam = game.awayTeamInfo.teamInfo;
    if (!teamMap.has(homeTeam.code)) {
      teamMap.set(homeTeam.code, homeTeam);
    }
    if (!teamMap.has(awayTeam.code)) {
      teamMap.set(awayTeam.code, awayTeam);
    }
  });

  // Calculate stats for each team
  const teamStatsMap = new Map<string, TeamStats>();

  // Initialize stats for all teams
  teamMap.forEach((team) => {
    teamStatsMap.set(team.code, {
      Rank: null,
      Team: 0,
      GP: 0,
      W: 0,
      L: 0,
      G: 0,
      GPG: '0.00',
      GA: 0,
      GAPG: '0.00',
      SOW: 0,
      SOL: 0,
      Points: 0,
      OTW: 0,
      OTL: 0,
      info: team,
    });
  });

  // For each team, get their last N games
  teamMap.forEach((team) => {
    const teamCode = team.code;
    // Get all games where this team played (home or away)
    const teamGames = finishedGames
      .filter(
        (game) =>
          game.homeTeamInfo.teamInfo.code === teamCode ||
          game.awayTeamInfo.teamInfo.code === teamCode,
      )
      .slice(0, n); // Get only the last N games (already sorted by date descending)

    // Calculate stats from these games
    const stats = teamStatsMap.get(teamCode);
    if (!stats) return;

    teamGames.forEach((game) => {
      const isHome = game.homeTeamInfo.teamInfo.code === teamCode;
      const teamToProcess = isHome ? game.homeTeamInfo : game.awayTeamInfo;
      const opponent = isHome ? game.awayTeamInfo : game.homeTeamInfo;

      const teamGoals = teamToProcess.score;
      const oppGoals = opponent.score;

      stats.GP++;
      stats.G += teamGoals;
      stats.GA += oppGoals;

      const won = teamGoals > oppGoals;
      const wentOT = Boolean(game.overtime || game.shootout);

      if (won) {
        if (wentOT) {
          stats.OTW = (stats.OTW ?? 0) + 1;
        } else {
          stats.W++;
        }
      } else if (teamGoals < oppGoals) {
        if (wentOT) {
          stats.OTL = (stats.OTL ?? 0) + 1;
        } else {
          stats.L++;
        }
      }
    });

    // Calculate points: win=3, overtime win=2, overtime loss=1
    stats.Points = stats.W * 3 + (stats.OTW ?? 0) * 2 + (stats.OTL ?? 0) * 1;
  });

  // Convert to array and sort by points, then goal difference
  const teamStats = Array.from(teamStatsMap.values()).sort((a, b) => {
    // First by points
    if (b.Points !== a.Points) {
      return b.Points - a.Points;
    }
    // Then by goal difference
    const aGoalDiff = a.G - a.GA;
    const bGoalDiff = b.G - b.GA;
    return bGoalDiff - aGoalDiff;
  });

  // Assign ranks
  teamStats.forEach((stat, index) => {
    stat.Rank = index + 1;
  });

  return {
    dataColumns: [],
    stats: teamStats,
  };
}

export function getAvailableMonths(games: GameInfo[]): string[] {
  const finishedGames = games.filter((game) => game.state === 'finished');

  const monthSet = new Set<number>();
  finishedGames.forEach((game) => {
    const date = new Date(game.startDateTime);
    const monthNum = date.getMonth() + 1; // 1-12
    monthSet.add(monthNum);
  });

  // Convert to month codes and sort chronologically (month01, month02, ..., month12)
  return Array.from(monthSet)
    .sort((a, b) => a - b)
    .map((monthNum) => `month${String(monthNum).padStart(2, '0')}`);
}

export function formatMonthLabel(monthKey: string): string {
  // Extract month number from "month01", "month02", etc.
  const monthNum = parseInt(monthKey.replace('month', ''), 10);
  const monthNames = [
    'Januari',
    'Februari',
    'Mars',
    'April',
    'Maj',
    'Juni',
    'Juli',
    'Augusti',
    'September',
    'Oktober',
    'November',
    'December',
  ];
  return monthNames[monthNum - 1];
}

export function formatMonthShortLabel(monthKey: string): string {
  // Extract month number from "month01", "month02", etc.
  const monthNum = parseInt(monthKey.replace('month', ''), 10);
  const monthShortNames = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAJ',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OKT',
    'NOV',
    'DEC',
  ];
  return monthShortNames[monthNum - 1];
}

export function calculateStandingsForMonth(
  games: GameInfo[],
  monthKey: string,
): StandingsData {
  // Extract month number from "month01", "month02", etc.
  const monthNum = parseInt(monthKey.replace('month', ''), 10);

  // Filter games by finished state and specific month (regardless of year)
  const finishedGames = games.filter((game) => {
    if (game.state !== 'finished') return false;
    const date = new Date(game.startDateTime);
    return date.getMonth() + 1 === monthNum;
  });

  // Extract unique teams from games
  const teamMap = new Map<string, TeamInfo>();
  finishedGames.forEach((game) => {
    const homeTeam = game.homeTeamInfo.teamInfo;
    const awayTeam = game.awayTeamInfo.teamInfo;
    if (!teamMap.has(homeTeam.code)) {
      teamMap.set(homeTeam.code, homeTeam);
    }
    if (!teamMap.has(awayTeam.code)) {
      teamMap.set(awayTeam.code, awayTeam);
    }
  });

  // Calculate stats for each team
  const teamStatsMap = new Map<string, TeamStats>();

  // Initialize stats for all teams
  teamMap.forEach((team) => {
    teamStatsMap.set(team.code, {
      Rank: null,
      Team: 0,
      GP: 0,
      W: 0,
      L: 0,
      G: 0,
      GPG: '0.00',
      GA: 0,
      GAPG: '0.00',
      SOW: 0,
      SOL: 0,
      Points: 0,
      OTW: 0,
      OTL: 0,
      info: team,
    });
  });

  // Process games - count all games for each team in this month
  finishedGames.forEach((game) => {
    // Process home team
    const homeTeamCode = game.homeTeamInfo.teamInfo.code;
    const homeStats = teamStatsMap.get(homeTeamCode);
    if (homeStats) {
      homeStats.GP++;
      homeStats.G += game.homeTeamInfo.score;
      homeStats.GA += game.awayTeamInfo.score;

      const won = game.homeTeamInfo.score > game.awayTeamInfo.score;
      const wentOT = Boolean(game.overtime || game.shootout);

      if (won) {
        if (wentOT) {
          homeStats.OTW = (homeStats.OTW ?? 0) + 1;
        } else {
          homeStats.W++;
        }
      } else if (game.homeTeamInfo.score < game.awayTeamInfo.score) {
        if (wentOT) {
          homeStats.OTL = (homeStats.OTL ?? 0) + 1;
        } else {
          homeStats.L++;
        }
      }

      homeStats.Points =
        homeStats.W * 3 + (homeStats.OTW ?? 0) * 2 + (homeStats.OTL ?? 0) * 1;
    }

    // Process away team
    const awayTeamCode = game.awayTeamInfo.teamInfo.code;
    const awayStats = teamStatsMap.get(awayTeamCode);
    if (awayStats) {
      awayStats.GP++;
      awayStats.G += game.awayTeamInfo.score;
      awayStats.GA += game.homeTeamInfo.score;

      const won = game.awayTeamInfo.score > game.homeTeamInfo.score;
      const wentOT = Boolean(game.overtime || game.shootout);

      if (won) {
        if (wentOT) {
          awayStats.OTW = (awayStats.OTW ?? 0) + 1;
        } else {
          awayStats.W++;
        }
      } else if (game.awayTeamInfo.score < game.homeTeamInfo.score) {
        if (wentOT) {
          awayStats.OTL = (awayStats.OTL ?? 0) + 1;
        } else {
          awayStats.L++;
        }
      }

      awayStats.Points =
        awayStats.W * 3 + (awayStats.OTW ?? 0) * 2 + (awayStats.OTL ?? 0) * 1;
    }
  });

  // Convert to array and sort by points, then goal difference
  const teamStats = Array.from(teamStatsMap.values()).sort((a, b) => {
    // First by points
    if (b.Points !== a.Points) {
      return b.Points - a.Points;
    }
    // Then by goal difference
    const aGoalDiff = a.G - a.GA;
    const bGoalDiff = b.G - b.GA;
    return bGoalDiff - aGoalDiff;
  });

  // Assign ranks
  teamStats.forEach((stat, index) => {
    stat.Rank = index + 1;
  });

  return {
    dataColumns: [],
    stats: teamStats,
  };
}
