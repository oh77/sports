import type { GameInfo } from '@/app/types/domain/game';
import type { League } from '@/app/types/domain/league';
import type { StandingsData, TeamStats } from '@/app/types/domain/standings';
import type {
  MonthFilter,
  StandingsFilter,
} from '@/app/types/domain/standingsFilter';
import type { TeamInfo } from '@/app/types/domain/team';

/**
 * Points awarded for a team's record, which differs by league: the Swedish
 * leagues and the CHL play 3-2-1-0 (regulation win, overtime win, overtime
 * loss), the NHL 2-2-1-0.
 */
export type PointsRule = (stats: TeamStats) => number;

const SWEDISH_POINTS: PointsRule = (s) =>
  s.W * 3 + (s.OTW ?? 0) * 2 + (s.OTL ?? 0) * 1;

const NHL_POINTS: PointsRule = (s) =>
  (s.W + (s.OTW ?? 0)) * 2 + (s.OTL ?? 0) * 1;

/** The points rule a league's computed tables should use. */
export function pointsRuleFor(league: League): PointsRule {
  return league === 'nhl' ? NHL_POINTS : SWEDISH_POINTS;
}

/** Options shared by the game-derived table builders. */
type CalcOptions = {
  /** Defaults to the 3-2-1-0 rule the Swedish leagues and the CHL use. */
  points?: PointsRule;
};

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
    if (tablePosition <= 6) return 'border-l-[3px] border-win'; // Playoff spots
    if (tablePosition <= 10) return 'border-l-[3px] border-otl'; // Playoff qualification
    if (tablePosition >= totalTeams - 1) return 'border-l-[3px] border-loss'; // Relegation zone
  } else if (league === 'sdhl') {
    // SDHL: playoff (top 8), no playoff qualification, relegation (last 2)
    if (tablePosition <= 8) return 'border-l-[3px] border-win'; // Playoff spots
    if (tablePosition >= totalTeams - 1) return 'border-l-[3px] border-loss'; // Relegation zone
  } else if (league === 'chl') {
    // CHL: playoff (top 16), no playoff qualification, no relegation
    if (tablePosition <= 16) return 'border-l-[3px] border-win'; // Playoff spots
  }
  return 'border-l-[3px] border-transparent';
};

export function calculateStandingsFromGames(
  games: GameInfo[],
  filter: 'home' | 'away',
  { points = SWEDISH_POINTS }: CalcOptions = {},
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

    stats.Points = points(stats);
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
  { points = SWEDISH_POINTS }: CalcOptions = {},
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

    stats.Points = points(stats);
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

/** The `YYYY-MM` key a game belongs to. */
function monthKeyOf(game: GameInfo): MonthFilter {
  const date = new Date(game.startDateTime);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}` as MonthFilter;
}

/** True for a `YYYY-MM` month key, false for the fixed filters. */
export function isMonthFilter(filter: string): filter is MonthFilter {
  return /^\d{4}-\d{2}$/.test(filter);
}

/**
 * The months that have played games, oldest first.
 *
 * Keys carry the year, so a season running from September into March orders
 * chronologically rather than putting January first.
 */
export function getAvailableMonths(games: GameInfo[]): MonthFilter[] {
  const months = new Set<MonthFilter>();
  for (const game of games) {
    if (game.state === 'finished') months.add(monthKeyOf(game));
  }
  return Array.from(months).sort();
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const monthNum = parseInt(month, 10);
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
  return `${monthNames[monthNum - 1]} ${year}`;
}

/** Short month label; the year is left off, as a season never repeats a month. */
export function formatMonthShortLabel(monthKey: string): string {
  const monthNum = parseInt(monthKey.split('-')[1], 10);
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
  monthKey: MonthFilter,
  { points = SWEDISH_POINTS }: CalcOptions = {},
): StandingsData {
  const finishedGames = games.filter(
    (game) => game.state === 'finished' && monthKeyOf(game) === monthKey,
  );

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

      homeStats.Points = points(homeStats);
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

      awayStats.Points = points(awayStats);
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

/**
 * The table a filter asks for: the league's own table for `season`, otherwise
 * one computed from the played games.
 *
 * Computed rows are re-joined with the league table by team code, so the
 * conference and division a club belongs to survive a filter that only knows
 * about games.
 */
export function applyStandingsFilter({
  filter,
  league,
  standings,
  games,
}: {
  filter: StandingsFilter;
  league: League;
  standings: StandingsData | null;
  games: GameInfo[];
}): StandingsData | null {
  if (filter === 'season' || games.length === 0) return standings;

  const options = { points: pointsRuleFor(league) };
  let computed: StandingsData | null = null;
  if (filter === 'home' || filter === 'away') {
    computed = calculateStandingsFromGames(games, filter, options);
  } else if (filter === 'last5' || filter === 'last10' || filter === 'last15') {
    const n = filter === 'last5' ? 5 : filter === 'last10' ? 10 : 15;
    computed = calculateStandingsFromLastNGames(games, n, options);
  } else if (isMonthFilter(filter)) {
    computed = calculateStandingsForMonth(games, filter, options);
  }
  if (!computed) return standings;

  return withLeagueTableInfo(computed, standings);
}

/** Carry club identity and grouping from the league table onto computed rows. */
function withLeagueTableInfo(
  computed: StandingsData,
  standings: StandingsData | null,
): StandingsData {
  if (!standings) return computed;

  const byCode = new Map(
    standings.stats.map((team) => [team.info.code.toUpperCase(), team]),
  );
  return {
    ...computed,
    stats: computed.stats.map((team) => {
      const listed = byCode.get(team.info.code.toUpperCase());
      if (!listed) return team;
      return {
        ...team,
        info: listed.info,
        conference: listed.conference,
        division: listed.division,
      };
    }),
  };
}
