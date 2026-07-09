import type {
  MatchesData,
  MatchInfo,
  MatchState,
} from '@/app/types/domain/match';
import type {
  PlayerStats,
  PlayerStatsData,
} from '@/app/types/domain/player-stats';
import type {
  StandingsData,
  StandingsZone,
  TeamStanding,
} from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';
import type { SportomediaMatch } from '@/app/types/sportomedia/matches';
import type { SportomediaPlayer } from '@/app/types/sportomedia/players';
import type { SportomediaStanding } from '@/app/types/sportomedia/standings';
import type { SportomediaTeam } from '@/app/types/sportomedia/teams';
import { playerColumns, STANDINGS_COLUMNS } from '@/app/utils/footballColumns';
import { lastFiveForm } from '@/app/utils/form';

export function allsvenskanTeamToDomain(team: SportomediaTeam): TeamInfo {
  return {
    code: team.abbrv.toLowerCase(),
    externalId: String(team.everySportId),
    short: team.abbrv,
    long: team.displayName,
    full: team.name,
    logo: team.logoImageUrl,
  };
}

/** Match payloads carry no logos; join them in from the teams query. */
function logoByAbbrv(teams: SportomediaTeam[]): Map<string, string> {
  return new Map(teams.map((t) => [t.abbrv, t.logoImageUrl]));
}

function statusToState(status: string): MatchState {
  if (status === 'UPCOMING') return 'not-started';
  if (status === 'FINISHED') return 'finished';
  return 'live';
}

function matchTeamInfo(
  abbrv: string,
  everySportId: number,
  nameFormatted: string,
  name: string,
  logos: Map<string, string>,
): TeamInfo {
  return {
    code: abbrv.toLowerCase(),
    externalId: String(everySportId),
    short: abbrv,
    long: nameFormatted,
    full: name,
    logo: logos.get(abbrv) ?? '',
  };
}

export function allsvenskanMatchesToDomain(
  matches: SportomediaMatch[],
  teams: SportomediaTeam[],
): MatchesData {
  const logos = logoByAbbrv(teams);
  const domainMatches: MatchInfo[] = matches.map((m) => ({
    uuid: String(m.id),
    startDateTime: m.startDate,
    state: statusToState(m.status),
    homeTeamInfo: {
      teamInfo: matchTeamInfo(
        m.homeTeamAbbrv,
        m.homeTeamEverySportId,
        m.homeTeamNameFormatted,
        m.homeTeamName,
        logos,
      ),
      score: m.homeTeamScore,
    },
    awayTeamInfo: {
      teamInfo: matchTeamInfo(
        m.visitingTeamAbbrv,
        m.visitingTeamEverySportId,
        m.visitingTeamNameFormatted,
        m.visitingTeamName,
        logos,
      ),
      score: m.visitingTeamScore,
    },
    venueInfo: { name: m.arenaName.trim() },
    round: m.round,
    roundLabel: `Omgång ${m.round}`,
  }));

  return {
    matches: domainMatches.sort((a, b) =>
      a.startDateTime.localeCompare(b.startDateTime),
    ),
  };
}

/**
 * Allsvenskan zones (16 teams): champions + Europe qualifiers at the top,
 * position 14 to the relegation play-off, 15-16 straight down.
 */
function allsvenskanZone(
  position: number,
  total: number,
): StandingsZone | undefined {
  if (position === 1) return 'title';
  if (position <= 3) return 'europe';
  if (position === total - 2) return 'relegationPlayoff';
  if (position > total - 2) return 'relegation';
  return undefined;
}

/** Stats arrive as named string cells: gp, w, t, l, gf, ga, d, pts. */
function statNum(standing: SportomediaStanding, name: string): number {
  const cell = standing.stats.find((s) => s.name === name);
  return cell ? Number(cell.value) : 0;
}

export function allsvenskanStandingsToDomain(
  standings: SportomediaStanding[],
  teams: SportomediaTeam[],
  matchesData: MatchesData,
): StandingsData {
  const teamByAbbrv = new Map(teams.map((t) => [t.abbrv, t]));

  const stats: TeamStanding[] = standings
    .map((entry) => {
      const team = teamByAbbrv.get(entry.teamAbbrv);
      const info: TeamInfo = team
        ? allsvenskanTeamToDomain(team)
        : {
            code: entry.teamAbbrv.toLowerCase(),
            externalId: String(entry.teamId),
            short: entry.teamAbbrv,
            long: entry.teamName,
            full: entry.teamName,
            logo: '',
          };
      return {
        Rank: entry.position,
        GP: statNum(entry, 'gp'),
        W: statNum(entry, 'w'),
        D: statNum(entry, 't'),
        L: statNum(entry, 'l'),
        GF: statNum(entry, 'gf'),
        GA: statNum(entry, 'ga'),
        GD: statNum(entry, 'd'),
        Points: statNum(entry, 'pts'),
        zone: allsvenskanZone(entry.position, standings.length),
        form: lastFiveForm(matchesData.matches, info.code),
        info,
      };
    })
    .sort((a, b) => (a.Rank ?? 0) - (b.Rank ?? 0));

  return { dataColumns: STANDINGS_COLUMNS, stats };
}

export function allsvenskanPlayersToDomain(
  players: SportomediaPlayer[],
): PlayerStatsData {
  const stats: PlayerStats[] = players.map((p) => ({
    Rank: null,
    GP: p.matchesPlayed,
    G: p.goals,
    A: p.assists,
    TP: p.goals + p.assists,
    YC: p.yellowCards,
    RC: p.redCards,
    PG: p.penaltyGoals,
    info: {
      uuid: String(p.fogisId),
      fullName: p.displayName,
      firstName: p.givenName,
      lastName: p.surName,
      nationality: p.nationality ?? undefined,
      position: p.position ?? undefined,
      birthDate: p.birthDate ?? undefined,
      photo: p.playerImage || undefined,
      team: {
        externalId: p.teamAbbrv ?? '',
        name: p.teamDisplayName ?? '',
        code: p.teamAbbrv?.toLowerCase() ?? '',
        logo: p.teamLogo || undefined,
      },
    },
  }));

  return {
    dataColumns: playerColumns('G'),
    defaultSortKey: { name: 'G', order: 'desc' },
    stats,
  };
}
