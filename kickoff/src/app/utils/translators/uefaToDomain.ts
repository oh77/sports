import {
  uefaCountryFlagUrl,
  uefaCountryName,
  uefaPlayerPhotoUrl,
} from '@/app/config/uefa';
import type { DataColumn } from '@/app/types/domain/data-table';
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
import type {
  UefaMatch,
  UefaScorePair,
  UefaTeam,
} from '@/app/types/uefa/matches';
import type { UefaPlayerRankingRow } from '@/app/types/uefa/players';
import type { UefaStandingsGroup } from '@/app/types/uefa/standings';
import { STANDINGS_COLUMNS } from '@/app/utils/footballColumns';
import { lastFiveForm, sideRecordFor } from '@/app/utils/form';

export function clTeamToDomain(team: UefaTeam): TeamInfo {
  const short =
    team.teamCode ?? team.internationalName.slice(0, 3).toUpperCase();
  return {
    code: (team.teamCode ?? team.id).toLowerCase(),
    externalId: team.id,
    short,
    long: team.internationalName,
    full: team.translations?.displayOfficialName?.EN ?? team.internationalName,
    logo: team.logoUrl ?? team.mediumLogoUrl ?? '',
    ...(team.countryCode
      ? {
          country: {
            code: team.countryCode,
            name: uefaCountryName(team.countryCode),
            flag: uefaCountryFlagUrl(team.countryCode),
          },
        }
      : {}),
  };
}

function statusToState(m: UefaMatch): MatchState {
  const status = m.status?.toUpperCase() ?? '';
  if (status === 'UPCOMING') return 'not-started';
  if (status === 'FINISHED') return 'finished';
  // In-progress matches are LIVE (with half-time/second-half variants).
  if (status === 'LIVE' || status.startsWith('LIVE')) return 'live';
  // ABANDONED: a void/awarded qualifying tie (e.g. a walkover that was never
  // actually played) that still carries an awarded score. It is a decided, not
  // a live, result — group it with played matches.
  if (status === 'ABANDONED') return 'finished';
  // Any other unrecognised status: decide from the data rather than defaulting
  // to "live", which would strand a played game in the live section
  // indefinitely — a match with a result has been played.
  const played = m.score?.total !== undefined || m.score?.regular !== undefined;
  return played ? 'finished' : 'not-started';
}

/** "MD17" → 17. */
function matchdayNumber(name?: string): number | undefined {
  const match = name?.match(/^MD(\d+)$/);
  return match ? Number(match[1]) : undefined;
}

/**
 * Swedish names for the knockout rounds, keyed on a normalised
 * `round.metaData.name`. That field is the provider's English display name —
 * captured payloads show `Final`, `Semi-finals` and `League phase`; the rest
 * follow UEFA's own naming. An unmapped round keeps the provider's label and
 * is not treated as a knockout round, so a name we don't know yet degrades to
 * today's behaviour rather than to English text in a Swedish UI.
 */
const KNOCKOUT_ROUNDS: Record<string, string> = {
  final: 'Final',
  semifinal: 'Semifinal',
  quarterfinal: 'Kvartsfinal',
  roundof16: 'Åttondelsfinal',
  knockoutplayoff: 'Slutspelskval',
  knockoutroundplayoff: 'Slutspelskval',
};

/** "Semi-finals" → "semifinal": case, punctuation and plural all dropped. */
function normalisedRoundName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/s$/, '');
}

function knockoutRound(m: UefaMatch): string | undefined {
  // `round.mode` is machine-readable where `metaData.name` is localizable, so
  // the final is keyed off the mode and never depends on the name matching.
  if (m.round?.mode === 'FINAL') return KNOCKOUT_ROUNDS.final;
  const name = m.round?.metaData?.name;
  return name ? KNOCKOUT_ROUNDS[normalisedRoundName(name)] : undefined;
}

function roundLabel(m: UefaMatch): string | undefined {
  const knockout = knockoutRound(m);
  if (knockout) return knockout;
  const roundName = m.round?.metaData?.name;
  if (roundName === 'League phase') {
    return m.matchday?.longName ?? roundName;
  }
  return roundName ?? m.matchday?.longName;
}

function venueName(m: UefaMatch): string {
  const stadium = m.stadium?.translations?.officialName?.EN;
  const city = m.stadium?.city?.translations?.name?.EN;
  if (stadium && city) return `${stadium}, ${city}`;
  return stadium ?? city ?? '';
}

/** UEFA ties run over two legs; the provider only says first or second. */
const LEGS_PER_TIE = 2;

function legNumber(m: UefaMatch): number | undefined {
  if (m.leg?.number) return m.leg.number;
  if (m.type === 'FIRST_LEG') return 1;
  if (m.type === 'SECOND_LEG') return 2;
  return undefined;
}

/** Key shared by both legs of a tie: the round plus the two teams. */
function tieKey(m: UefaMatch): string | undefined {
  const home = m.homeTeam?.id;
  const away = m.awayTeam?.id;
  if (!home || !away) return undefined;
  const round = m.round?.id ?? m.matchday?.id ?? '';
  return `${round}|${[home, away].sort().join('-')}`;
}

/**
 * Running tie totals, keyed by match id. The provider only backfills
 * `score.aggregate` once a tie is decided, so until then we add the other
 * leg's result to this leg's current score ourselves — that is what an
 * upcoming or live second leg needs to show.
 */
function runningTieTotals(matches: UefaMatch[]): Map<string, UefaScorePair> {
  const firstLegs = new Map<string, UefaMatch>();
  for (const m of matches) {
    const key = legNumber(m) === 1 ? tieKey(m) : undefined;
    if (key) firstLegs.set(key, m);
  }

  const totals = new Map<string, UefaScorePair>();
  for (const m of matches) {
    if (legNumber(m) !== 2) continue;
    const key = tieKey(m);
    const firstLeg = key ? firstLegs.get(key) : undefined;
    if (!firstLeg) continue;
    // Nothing to carry over until the first leg has actually been played.
    if (statusToState(firstLeg) === 'not-started') continue;
    const first = firstLeg.score?.total ?? firstLeg.score?.regular;
    if (!first) continue;
    // The teams normally swap ends between legs, but orient by team id rather
    // than assuming it.
    const flipped = firstLeg.homeTeam?.id === m.awayTeam?.id;
    const second = m.score?.total ?? m.score?.regular;
    totals.set(m.id, {
      home: (flipped ? first.away : first.home) + (second?.home ?? 0),
      away: (flipped ? first.home : first.away) + (second?.away ?? 0),
    });
  }
  return totals;
}

export function clMatchesToDomain(matches: UefaMatch[]): MatchesData {
  const runningTotals = runningTieTotals(matches);
  const domainMatches: MatchInfo[] = matches
    // Knockout fixtures without decided participants can't be rendered yet.
    .filter((m) => m.homeTeam && m.awayTeam && m.kickOffTime?.dateTime)
    .map((m) => {
      const home = m.homeTeam as UefaTeam;
      const away = m.awayTeam as UefaTeam;
      const score = m.score?.total ?? m.score?.regular;
      const matchReason = m.winner?.match?.reason;
      const aggregateReason = m.winner?.aggregate?.reason;
      // A shoot-out belongs to the leg that has a penalty score. The
      // aggregate reason is backfilled onto BOTH legs of a tie, so it may
      // only inform the deciding (second) leg.
      const decidingLeg = m.type !== 'FIRST_LEG';
      const penalties =
        m.score?.penalty !== undefined || matchReason === 'WIN_ON_PENALTIES';
      const extraTime =
        penalties ||
        matchReason === 'WIN_ON_EXTRA_TIME' ||
        (decidingLeg && aggregateReason === 'WIN_ON_EXTRA_TIME');
      // The provider's aggregate is authoritative wherever it exists; our own
      // running total only fills the gap before the tie is decided.
      const state = statusToState(m);
      const aggregate = m.score?.aggregate ?? runningTotals.get(m.id);
      const leg = legNumber(m);
      const round = matchdayNumber(m.matchday?.name);
      const label = roundLabel(m);
      const knockout = knockoutRound(m) !== undefined;
      const qualifying =
        m.competitionPhase === 'QUALIFYING' ||
        m.matchday?.phase === 'QUALIFYING';
      // `round.mode` is the machine-readable round identifier; the display
      // name is localizable, so the mode is what we key the final off.
      const isFinal = m.round?.mode === 'FINAL';

      return {
        uuid: m.id,
        startDateTime: m.kickOffTime?.dateTime as string,
        state,
        homeTeamInfo: {
          teamInfo: clTeamToDomain(home),
          score: score?.home ?? 0,
          ...(m.score?.penalty ? { penaltyScore: m.score.penalty.home } : {}),
          ...(aggregate ? { aggregateScore: aggregate.home } : {}),
        },
        awayTeamInfo: {
          teamInfo: clTeamToDomain(away),
          score: score?.away ?? 0,
          ...(m.score?.penalty ? { penaltyScore: m.score.penalty.away } : {}),
          ...(aggregate ? { aggregateScore: aggregate.away } : {}),
        },
        venueInfo: { name: venueName(m) },
        ...(round !== undefined ? { round } : {}),
        ...(leg !== undefined
          ? { leg: { number: leg, of: LEGS_PER_TIE } }
          : {}),
        ...(label ? { roundLabel: label } : {}),
        ...(knockout ? { knockout } : {}),
        ...(extraTime ? { extraTime } : {}),
        ...(penalties ? { penalties } : {}),
        ...(qualifying ? { qualifying } : {}),
        ...(isFinal ? { isFinal } : {}),
      };
    });

  return {
    matches: domainMatches.sort((a, b) =>
      a.startDateTime.localeCompare(b.startDateTime),
    ),
  };
}

/**
 * League-phase zones: top `teamsQualifiedNumber` straight to the knockouts;
 * in the 36-team format ranks 9-24 reach the knockout play-offs.
 */
function clZone(
  rank: number,
  qualified: number,
  total: number,
): StandingsZone | undefined {
  if (rank <= qualified) return 'knockout';
  if (total >= 30 && rank <= 24) return 'knockoutPlayoff';
  return undefined;
}

export function clStandingsToDomain(
  groups: UefaStandingsGroup[],
  matchesData?: MatchesData,
): StandingsData {
  const multipleGroups = groups.length > 1;

  const stats: TeamStanding[] = groups.flatMap((group) =>
    group.items.map((item) => {
      const info = clTeamToDomain(item.team);
      return {
        Rank: item.rank,
        GP: item.played,
        W: item.won,
        D: item.drawn,
        L: item.lost,
        GF: item.goalsFor,
        GA: item.goalsAgainst,
        GD: item.goalDifference,
        Points: item.points,
        zone: clZone(
          item.rank,
          group.group.teamsQualifiedNumber ?? 8,
          group.items.length,
        ),
        ...(multipleGroups
          ? { group: group.group.translations?.name?.EN }
          : {}),
        ...(matchesData
          ? {
              form: lastFiveForm(matchesData.matches, info.code),
              homeRecord: sideRecordFor(matchesData.matches, info.code, 'home'),
              awayRecord: sideRecordFor(matchesData.matches, info.code, 'away'),
            }
          : {}),
        info,
      };
    }),
  );

  return { dataColumns: STANDINGS_COLUMNS, stats };
}

function clPlayerInfo(
  row: UefaPlayerRankingRow,
  competitionId: string,
  seasonYear: string,
): PlayerInfo {
  const p = row.player ?? {};
  const name = p.internationalName ?? 'Okänd spelare';
  const [firstName, ...rest] = name.split(' ');
  const team = row.team;
  return {
    uuid: p.id ?? '',
    fullName: name,
    firstName,
    lastName: rest.join(' '),
    nationality: p.countryCode,
    position: p.fieldPosition,
    photo:
      p.imageUrl ??
      (p.id ? uefaPlayerPhotoUrl(competitionId, p.id, seasonYear) : undefined),
    team: {
      externalId: team?.id ?? '',
      name: team?.internationalName ?? '',
      code: team?.teamCode?.toLowerCase() ?? '',
      logo: team?.logoUrl,
    },
  };
}

function singleStatColumn(name: string): DataColumn[] {
  return [{ name, type: 'number', highlighted: true, group: '' }];
}

/**
 * The ranking endpoint returns one metric per request, so a CL stats view
 * shows just that metric's column.
 */
export function clRankingToPlayers(
  rows: UefaPlayerRankingRow[],
  metric: 'G' | 'A',
  competitionId: string,
  seasonYear: string,
): PlayerStatsData {
  const stats: PlayerStats[] = rows
    .filter((row) => row.player?.id)
    .map((row, i) => ({
      Rank: row.rank ?? i + 1,
      GP: 0,
      G: metric === 'G' ? (row.value ?? 0) : 0,
      A: metric === 'A' ? (row.value ?? 0) : 0,
      TP: row.value ?? 0,
      YC: 0,
      RC: 0,
      info: clPlayerInfo(row, competitionId, seasonYear),
    }));

  return {
    dataColumns: singleStatColumn(metric),
    defaultSortKey: { name: metric, order: 'desc' },
    stats,
  };
}

/** Cards view: merge the yellow- and red-card rankings by player id. */
export function clCardsToPlayers(
  yellowRows: UefaPlayerRankingRow[],
  redRows: UefaPlayerRankingRow[],
  competitionId: string,
  seasonYear: string,
): PlayerStatsData {
  const redByPlayer = new Map(
    redRows
      .filter((row) => row.player?.id)
      .map((row) => [row.player?.id, row.value ?? 0]),
  );

  const stats: PlayerStats[] = yellowRows
    .filter((row) => row.player?.id)
    .map((row) => ({
      Rank: null,
      GP: 0,
      G: 0,
      A: 0,
      TP: 0,
      YC: row.value ?? 0,
      RC: redByPlayer.get(row.player?.id) ?? 0,
      info: clPlayerInfo(row, competitionId, seasonYear),
    }))
    .sort((a, b) => b.YC + b.RC * 2 - (a.YC + a.RC * 2))
    .map((row, i) => ({ ...row, Rank: i + 1 }));

  return {
    dataColumns: [
      { name: 'YC', type: 'number', highlighted: true, group: '' },
      { name: 'RC', type: 'number', highlighted: false, group: '' },
    ],
    defaultSortKey: { name: 'YC', order: 'desc' },
    stats,
  };
}
