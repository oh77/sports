import type { TeamInfo } from '@/app/types/domain/team';
import type {
  StatnetTeamInfo,
  StatnetTeamStats,
} from '@/app/types/statnet/standings';
import type { CHLGoalieStats } from '../../types/chl/goalie-stats';
import type { CHLPlayerStats } from '../../types/chl/player-stats';
import type { GameInfo } from '../../types/domain/game';
import type { GoalieInfo, GoalieStats } from '../../types/domain/goalie-stats';
import type { PlayerInfo, PlayerStats } from '../../types/domain/player-stats';
import type { TeamStats } from '../../types/domain/standings';
import type {
  StatnetGameInfo,
  StatnetGameTeamInfo,
} from '../../types/statnet/game';
import type {
  StatnetGoalieInfo,
  StatnetGoalieStats,
} from '../../types/statnet/goalie-stats';
import type {
  StatnetPlayerInfo,
  StatnetPlayerStats,
} from '../../types/statnet/player-stats';

export function translateStatnetGameTeamToDomain(
  statnetTeam: StatnetGameTeamInfo,
): TeamInfo {
  return {
    code: statnetTeam.names?.code || statnetTeam.code,
    externalId: statnetTeam.names?.code || statnetTeam.code,
    short: statnetTeam.names?.short || '',
    long: statnetTeam.names?.long || '',
    full: statnetTeam.names?.full || '',
    logo: statnetTeam.logo || statnetTeam.icon || '',
  };
}

export const translateStatnetStandingsTeamToDomain = (
  statnetTeamInfo: StatnetTeamInfo,
): TeamInfo => {
  return {
    code: statnetTeamInfo.teamNames.code,
    externalId: statnetTeamInfo.teamNames.code,
    short: statnetTeamInfo.teamNames.short,
    long: statnetTeamInfo.teamNames.long,
    full: statnetTeamInfo.teamNames.full,
    logo: statnetTeamInfo.logo,
  };
};

export function translateStatnetGameToDomain(
  statnetGame: StatnetGameInfo,
): GameInfo {
  return {
    uuid: statnetGame.uuid,
    startDateTime: statnetGame.startDateTime,
    state: statnetGame.state === 'post-game' ? 'finished' : 'not-started',
    homeTeamInfo: {
      teamInfo: translateStatnetGameTeamToDomain(statnetGame.homeTeamInfo),
      score: statnetGame.homeTeamInfo.score,
    },
    awayTeamInfo: {
      teamInfo: translateStatnetGameTeamToDomain(statnetGame.awayTeamInfo),
      score: statnetGame.awayTeamInfo.score,
    },
    venueInfo: statnetGame.venueInfo,
    overtime: statnetGame.overtime,
    shootout: statnetGame.shootout,
  };
}

export function translateStatnetTeamStatsToDomain(
  statnetStats: StatnetTeamStats,
): TeamStats {
  return {
    T: 0,
    Rank: statnetStats.Rank,
    Team: statnetStats.Team,
    GP: statnetStats.GP,
    W: statnetStats.W,
    OTW: statnetStats.OTW,
    OTL: statnetStats.OTL,
    L: statnetStats.L,
    G: statnetStats.G,
    GPG: statnetStats.GPG,
    GA: statnetStats.GA,
    GAPG: statnetStats.GAPG,
    SOW: statnetStats.SOW,
    SOL: statnetStats.SOL,
    Points: statnetStats.Points,
    info: translateStatnetStandingsTeamToDomain(statnetStats.info),
  };
}

export function translateStatnetPlayerInfoToDomain(
  statnetInfo: StatnetPlayerInfo,
): PlayerInfo {
  return {
    uuid: statnetInfo.uuid,
    fullName: statnetInfo.fullName,
    firstName: statnetInfo.firstName,
    lastName: statnetInfo.lastName,
    birthDate: statnetInfo.birthDate,
    nationality: statnetInfo.nationality,
    number: statnetInfo.number,
    position: statnetInfo.position,
    shoots: statnetInfo.shoots,
    gender: statnetInfo.gender,
    weight: statnetInfo.weight,
    height: statnetInfo.height,
    playerMedia: statnetInfo.playerMedia,
    team: statnetInfo.team,
    teamCode: statnetInfo.teamCode,
    teamId: statnetInfo.teamId,
  };
}

export function translateStatnetPlayerStatsToDomain(
  statnetStats: StatnetPlayerStats,
): PlayerStats {
  return {
    Rank: statnetStats.Rank,
    Player: statnetStats.Player,
    Team: statnetStats.Team,
    GP: statnetStats.GP,
    TP: statnetStats.TP,
    G: statnetStats.G,
    A: statnetStats.A,
    PPG: statnetStats.PPG,
    PPA: statnetStats.PPA,
    PPTP: statnetStats.PPTP,
    SHG: statnetStats.SHG,
    SHA: statnetStats.SHA,
    SHTP: statnetStats.SHTP,
    info: translateStatnetPlayerInfoToDomain(statnetStats.info),
  };
}

export function translateStatnetGoalieInfoToDomain(
  statnetInfo: StatnetGoalieInfo,
): GoalieInfo {
  return {
    uuid: statnetInfo.uuid,
    fullName: statnetInfo.fullName,
    firstName: statnetInfo.firstName,
    lastName: statnetInfo.lastName,
    birthDate: statnetInfo.birthDate,
    nationality: statnetInfo.nationality,
    number: statnetInfo.number,
    position: statnetInfo.position,
    shoots: statnetInfo.shoots,
    gender: statnetInfo.gender,
    weight: statnetInfo.weight,
    height: statnetInfo.height,
    playerMedia: statnetInfo.playerMedia,
    team: statnetInfo.team,
    teamCode: statnetInfo.teamCode,
    teamId: statnetInfo.teamId,
  };
}

export function translateStatnetGoalieStatsToDomain(
  statnetStats: StatnetGoalieStats,
): GoalieStats {
  return {
    Rank: statnetStats.Rank,
    Player: statnetStats.Player,
    Team: statnetStats.Team,
    GP: statnetStats.GP,
    SVS: statnetStats.SVS,
    GA: statnetStats.GA,
    SVSPerc: statnetStats.SVSPerc,
    GAA: statnetStats.GAA,
    SO: statnetStats.SO,
    info: translateStatnetGoalieInfoToDomain(statnetStats.info),
  };
}

// Helper function to get stat value from CHL properties array
function getCHLStatValue(
  properties: Array<{ shortName: string; value: number | string }>,
  shortName: string,
): number {
  const prop = properties.find((p) => p.shortName === shortName);
  if (!prop) return 0;
  return typeof prop.value === 'string'
    ? parseFloat(prop.value) || 0
    : prop.value;
}

// Map CHL nationality codes to domain format (for flag display)
function mapCHLNationalityToDomain(chlCode: string): string {
  const codeMap: Record<string, string> = {
    usa: 'US',
    swe: 'SE',
    can: 'CA',
    fin: 'FI',
    cze: 'CZ',
    svk: 'SK',
    nor: 'NO',
    den: 'DK',
    ger: 'DE',
    sui: 'CH',
    aut: 'AT',
    fra: 'FR',
    ita: 'IT',
    slo: 'SI',
  };
  const lowerCode = chlCode.toLowerCase();
  return codeMap[lowerCode] || chlCode.toUpperCase();
}

export function translateCHLPlayerStatsToDomain(
  chlPlayer: CHLPlayerStats,
  rank: number | null,
): PlayerStats {
  const properties = chlPlayer.stats.properties;
  const getCHLLogoUrl = (externalId?: string): string => {
    if (externalId && externalId !== 'n/a' && externalId !== '') {
      return `https://res.cloudinary.com/chl-production/image/upload/c_fit,dpr_2.0,f_webp,g_center,h_100,q_auto/v1/chl-prod/assets/teams/${externalId}`;
    }
    return '';
  };

  return {
    Rank: rank,
    Player: 0, // CHL doesn't have Player number
    Team: 0, // CHL doesn't have Team number
    GP: getCHLStatValue(properties, 'GP'),
    TP: getCHLStatValue(properties, 'P'), // Points
    G: getCHLStatValue(properties, 'G'),
    A: getCHLStatValue(properties, 'A'),
    PPG: getCHLStatValue(properties, 'PPG'),
    PPA: 0, // CHL doesn't provide PPA separately
    PPTP: getCHLStatValue(properties, 'PPG'), // Approximate
    SHG: getCHLStatValue(properties, 'SHG'),
    SHA: 0, // CHL doesn't provide SHA separately
    SHTP: getCHLStatValue(properties, 'SHG'), // Approximate
    info: {
      uuid: chlPlayer._entityId,
      fullName: `${chlPlayer.firstName} ${chlPlayer.lastName}`,
      firstName: chlPlayer.firstName,
      lastName: chlPlayer.lastName,
      birthDate: '', // CHL doesn't provide birthDate
      nationality: mapCHLNationalityToDomain(chlPlayer.nationality.code),
      number: chlPlayer.number,
      position: chlPlayer.position.shortName,
      shoots: null,
      gender: '', // CHL doesn't provide gender
      weight: { value: 0, format: 'kg' },
      height: { value: 0, format: 'cm' },
      playerMedia: {
        id: 0,
        mediaString: '',
        type: '',
        sortOrder: 0,
      },
      team: {
        uuid: chlPlayer.team._entityId,
        name: chlPlayer.team.name,
        code: chlPlayer.team.shortName,
        media: getCHLLogoUrl(chlPlayer.team.externalId),
        ownerInstanceId: '',
        siteDisplayName: chlPlayer.team.name,
      },
      teamCode: 0,
      teamId: chlPlayer.team._entityId,
    },
  };
}

export function translateCHLGoalieStatsToDomain(
  chlGoalie: CHLGoalieStats,
  rank: number | null,
): GoalieStats {
  const properties = chlGoalie.stats.properties;
  const getCHLLogoUrl = (externalId?: string): string => {
    if (externalId && externalId !== 'n/a' && externalId !== '') {
      return `https://res.cloudinary.com/chl-production/image/upload/c_fit,dpr_2.0,f_webp,g_center,h_100,q_auto/v1/chl-prod/assets/teams/${externalId}`;
    }
    return '';
  };

  const svsPerc = getCHLStatValue(properties, 'SVS%');
  const gaa = getCHLStatValue(properties, 'GAA');

  return {
    Rank: rank,
    Player: 0, // CHL doesn't have Player number
    Team: 0, // CHL doesn't have Team number
    GP: getCHLStatValue(properties, 'GP'),
    SVS: getCHLStatValue(properties, 'SVS'),
    GA: getCHLStatValue(properties, 'GA'),
    SVSPerc: svsPerc > 0 ? svsPerc.toFixed(2) : '0.00',
    GAA: gaa > 0 ? gaa.toFixed(2) : '0.00',
    SO: getCHLStatValue(properties, 'SO'),
    info: {
      uuid: chlGoalie._entityId,
      fullName: `${chlGoalie.firstName} ${chlGoalie.lastName}`,
      firstName: chlGoalie.firstName,
      lastName: chlGoalie.lastName,
      birthDate: '', // CHL doesn't provide birthDate
      nationality: mapCHLNationalityToDomain(chlGoalie.nationality.code),
      number: chlGoalie.number,
      position: chlGoalie.position.shortName,
      shoots: null,
      gender: '', // CHL doesn't provide gender
      weight: { value: 0, format: 'kg' },
      height: { value: 0, format: 'cm' },
      playerMedia: {
        id: 0,
        mediaString: '',
        type: '',
        sortOrder: 0,
      },
      team: {
        uuid: chlGoalie.team._entityId,
        name: chlGoalie.team.name,
        code: chlGoalie.team.shortName,
        media: getCHLLogoUrl(chlGoalie.team.externalId),
        ownerInstanceId: '',
        siteDisplayName: chlGoalie.team.name,
      },
      teamCode: 0,
      teamId: chlGoalie.team._entityId,
    },
  };
}
