import type {
  GameInfo,
  GameState,
  LeagueResponse,
} from '../../types/domain/game';
import type { GoalieStats } from '../../types/domain/goalie-stats';
import type { PlayerInfo, PlayerStats } from '../../types/domain/player-stats';
import type { RosterPlayer } from '../../types/domain/roster';
import type { TeamInfo } from '../../types/domain/team';
import type { NHLGame, NHLGameTeam } from '../../types/nhl/game';
import type {
  NhlRosterPlayer,
  NhlRosterResponse,
} from '../../types/nhl/roster';
import type { NhlGoalieSummary, NhlSkaterSummary } from '../../types/nhl/stats';
import { countryCodeToAlpha2 } from '../countryCode';

function translateNHLTeam(team: NHLGameTeam): TeamInfo {
  const full = [team.placeName, team.commonName].filter(Boolean).join(' ');

  return {
    code: team.abbrev,
    externalId: String(team.id),
    short: team.commonName,
    long: full,
    full,
    logo: team.logo,
  };
}

export function translateNHLGameToDomain(nhlGame: NHLGame): GameInfo {
  const state: GameState =
    nhlGame.status === 'finished'
      ? 'finished'
      : nhlGame.status === 'live'
        ? 'live'
        : 'not-started';

  return {
    uuid: nhlGame.id,
    startDateTime: nhlGame.startDate,
    state,
    homeTeamInfo: {
      teamInfo: translateNHLTeam(nhlGame.homeTeam),
      score: nhlGame.scores?.home ?? 0,
    },
    awayTeamInfo: {
      teamInfo: translateNHLTeam(nhlGame.awayTeam),
      score: nhlGame.scores?.away ?? 0,
    },
    venueInfo: {
      name: nhlGame.venue,
    },
    overtime: nhlGame.overtime ?? false,
    shootout: nhlGame.shootout ?? false,
  };
}

export function translateNHLGamesToDomainResponse(
  nhlGames: NHLGame[],
): LeagueResponse {
  return {
    gameInfo: nhlGames.map(translateNHLGameToDomain),
    teamList: [],
  };
}

/**
 * Build a domain `PlayerInfo` from an NHL summary row. The summary feed carries
 * no jersey number, nationality, birth data or media — those come from the
 * club-roster feed, passed in as `roster` when the player was found there.
 * Without it they stay stubbed (mirroring how the CHL translator fills gaps).
 * `teamAbbrevs` (e.g. "EDM", or "EDM,LAK" when traded) is the only club
 * identifier the summary feed offers.
 */
function buildNhlPlayerInfo(opts: {
  playerId: number;
  fullName: string;
  lastName: string;
  position: string;
  shoots: string | null;
  teamAbbrevs: string;
  roster?: RosterPlayer;
}): PlayerInfo {
  const {
    playerId,
    fullName,
    lastName,
    position,
    shoots,
    teamAbbrevs,
    roster,
  } = opts;
  const firstName = fullName.endsWith(lastName)
    ? fullName.slice(0, fullName.length - lastName.length).trim()
    : fullName;

  return {
    uuid: String(playerId),
    fullName,
    firstName,
    lastName,
    birthDate: roster?.birthDate ?? '',
    nationality: roster?.nationality ?? '',
    number: roster?.number ?? 0,
    position,
    shoots,
    gender: '',
    weight: roster
      ? { value: roster.weightKg, format: 'kg' }
      : { value: 0, format: '' },
    height: roster
      ? { value: roster.heightCm, format: 'cm' }
      : { value: 0, format: '' },
    playerMedia: roster?.headshot
      ? {
          id: playerId,
          mediaString: roster.headshot,
          type: 'headshot',
          sortOrder: 0,
        }
      : { id: 0, mediaString: '', type: '', sortOrder: 0 },
    team: {
      uuid: '',
      name: teamAbbrevs,
      code: teamAbbrevs,
      media: '',
      ownerInstanceId: '',
      siteDisplayName: teamAbbrevs,
    },
    teamCode: 0,
    teamId: '',
  };
}

export function translateNhlSkaterStatsToDomain(
  row: NhlSkaterSummary,
  rank: number | null,
  roster?: RosterPlayer,
): PlayerStats {
  return {
    Rank: rank,
    Player: row.playerId,
    Team: 0,
    GP: row.gamesPlayed,
    TP: row.points,
    G: row.goals,
    A: row.assists,
    PPG: row.ppGoals,
    PPA: row.ppPoints - row.ppGoals,
    PPTP: row.ppPoints,
    SHG: row.shGoals,
    SHA: row.shPoints - row.shGoals,
    SHTP: row.shPoints,
    info: buildNhlPlayerInfo({
      playerId: row.playerId,
      fullName: row.skaterFullName,
      lastName: row.lastName,
      position: row.positionCode,
      shoots: row.shootsCatches,
      teamAbbrevs: row.teamAbbrevs,
      roster,
    }),
  };
}

export function translateNhlGoalieStatsToDomain(
  row: NhlGoalieSummary,
  rank: number | null,
  roster?: RosterPlayer,
): GoalieStats {
  return {
    Rank: rank,
    Player: row.playerId,
    Team: 0,
    GP: row.gamesPlayed,
    SVS: row.saves,
    GA: row.goalsAgainst,
    // Store as a percentage number string ("91.23") to match the CHL format;
    // the display appends "%" and sorts via Number(...).
    SVSPerc: (row.savePct * 100).toFixed(2),
    GAA: row.goalsAgainstAverage.toFixed(2),
    SO: row.shutouts,
    info: buildNhlPlayerInfo({
      playerId: row.playerId,
      fullName: row.goalieFullName,
      lastName: row.lastName,
      position: 'G',
      shoots: row.shootsCatches,
      teamAbbrevs: row.teamAbbrevs,
      roster,
    }),
  };
}

/** Translate one NHL roster entry into the domain roster contract. */
function translateNhlRosterPlayer(
  player: NhlRosterPlayer,
  teamCode: string,
): RosterPlayer {
  const firstName = player.firstName.default;
  const lastName = player.lastName.default;

  return {
    uuid: String(player.id),
    fullName: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    // The feed omits `sweaterNumber` for players without an assigned number.
    number: player.sweaterNumber ?? null,
    position: player.positionCode,
    shoots: player.shootsCatches ?? null,
    nationality: countryCodeToAlpha2(player.birthCountry ?? ''),
    nationalityCode: player.birthCountry ?? '',
    birthDate: player.birthDate ?? '',
    birthCity: player.birthCity?.default ?? '',
    headshot: player.headshot ?? '',
    heightCm: player.heightInCentimeters ?? 0,
    weightKg: player.weightInKilograms ?? 0,
    teamCode,
  };
}

/**
 * Flatten an NHL roster response (three position groups) into domain players,
 * tagged with the club they were fetched for.
 */
export function translateNhlRosterToDomain(
  response: NhlRosterResponse,
  teamCode: string,
): RosterPlayer[] {
  return [
    ...(response.forwards ?? []),
    ...(response.defensemen ?? []),
    ...(response.goalies ?? []),
  ].map((player) => translateNhlRosterPlayer(player, teamCode));
}
