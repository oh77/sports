import { plBadgeUrl } from '@/app/config/pulselive';
import type {
  MatchesData,
  MatchInfo,
  MatchState,
} from '@/app/types/domain/match';
import type {
  PlayerInfo,
  PlayerStats,
  PlayerStatsData,
} from '@/app/types/domain/player-stats';
import type {
  StandingsData,
  StandingsZone,
  TeamStanding,
} from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import type { PulseliveMatch } from '@/app/types/pulselive/matches';
import type { PulselivePlayerEntry } from '@/app/types/pulselive/players';
import type { PulseliveStandingsResponse } from '@/app/types/pulselive/standings';
import type { PulseliveTeam } from '@/app/types/pulselive/teams';
import { zonedTimeToIso } from '@/app/utils/dateUtils';
import { playerColumns, STANDINGS_COLUMNS } from '@/app/utils/footballColumns';

interface PulseliveTeamRef {
  name: string;
  id: string;
  shortName: string;
  abbr?: string;
}

function teamInfoFromRef(ref: PulseliveTeamRef): TeamInfo {
  const short = ref.abbr ?? ref.shortName;
  return {
    code: short.toLowerCase().replace(/\s+/g, '-'),
    externalId: ref.id,
    short,
    long: ref.shortName,
    full: ref.name,
    logo: plBadgeUrl(ref.id),
  };
}

export function plTeamToDomain(team: PulseliveTeam): TeamInfo {
  return teamInfoFromRef(team);
}

function plPeriodToState(period: string): MatchState {
  if (period === 'PreMatch') return 'not-started';
  if (period === 'FullTime') return 'finished';
  // FirstHalf / HalfTime / SecondHalf / anything else means the ball is
  // rolling or about to be.
  return 'live';
}

export function plMatchToDomain(match: PulseliveMatch): MatchInfo {
  return {
    uuid: match.matchId,
    startDateTime: zonedTimeToIso(
      match.kickoff,
      match.kickoffTimezoneString ?? 'Europe/London',
    ),
    state: plPeriodToState(match.period),
    homeTeamInfo: {
      teamInfo: teamInfoFromRef(match.homeTeam),
      score: match.homeTeam.score ?? 0,
    },
    awayTeamInfo: {
      teamInfo: teamInfoFromRef(match.awayTeam),
      score: match.awayTeam.score ?? 0,
    },
    venueInfo: { name: match.ground },
    ...(match.matchWeek !== undefined
      ? { round: match.matchWeek, roundLabel: `Omgång ${match.matchWeek}` }
      : {}),
  };
}

export function plMatchesToDomain(matches: PulseliveMatch[]): MatchesData {
  return {
    matches: matches
      .map(plMatchToDomain)
      .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime)),
  };
}

/** PL qualification/relegation zones: 1 title, 2-4 CL, 5 Europa, bottom 3 down. */
function plZone(position: number, total: number): StandingsZone | undefined {
  if (position === 1) return 'title';
  if (position <= 4) return 'championsLeague';
  if (position === 5) return 'europe';
  if (position > total - 3) return 'relegation';
  return undefined;
}

export function plStandingsToDomain(
  response: PulseliveStandingsResponse,
): StandingsData {
  const entries = response.tables.flatMap((t) => t.entries);
  const stats: TeamStanding[] = entries
    .map((entry) => {
      const overall = entry.overall;
      return {
        Rank: overall.position,
        GP: overall.played,
        W: overall.won,
        D: overall.drawn,
        L: overall.lost,
        GF: overall.goalsFor,
        GA: overall.goalsAgainst,
        GD: overall.goalsFor - overall.goalsAgainst,
        Points: overall.points,
        zone: plZone(overall.position, entries.length),
        info: teamInfoFromRef(entry.team),
      };
    })
    .sort((a, b) => (a.Rank ?? 0) - (b.Rank ?? 0));

  return { dataColumns: STANDINGS_COLUMNS, stats };
}

/** Stats arrive as floats ("9.0"); many keys are absent when zero. */
function num(value: number | undefined): number {
  return Math.round(value ?? 0);
}

function plPlayerInfo(entry: PulselivePlayerEntry): PlayerInfo {
  const md = entry.playerMetadata;
  return {
    uuid: md.id,
    fullName: md.knownName ?? md.name,
    firstName: md.firstName,
    lastName: md.lastName,
    nationality: md.country?.isoCode,
    position: md.position,
    team: {
      externalId: md.currentTeam.id,
      name: md.currentTeam.name,
      code: md.currentTeam.shortName.toLowerCase().replace(/\s+/g, '-'),
      logo: plBadgeUrl(md.currentTeam.id),
    },
  };
}

export function plPlayersToDomain(
  entries: PulselivePlayerEntry[],
  highlight: 'G' | 'A' | 'YC',
): PlayerStatsData {
  const stats: PlayerStats[] = entries.map((entry, i) => {
    // Seasons that haven't started yet have no stats bag at all.
    const s = entry.stats ?? {};
    const goals = num(s.goals);
    const assists = num(s.goalAssists);
    return {
      Rank: i + 1,
      GP: num(s.gamesPlayed ?? s.appearances),
      G: goals,
      A: assists,
      TP: goals + assists,
      YC: num(s.yellowCards),
      RC: num(s.totalRedCards),
      MIN: num(s.timePlayed),
      PG: num(s.penaltyGoals),
      info: plPlayerInfo(entry),
    };
  });

  return {
    dataColumns: playerColumns(highlight),
    defaultSortKey: { name: highlight, order: 'desc' },
    stats,
  };
}
