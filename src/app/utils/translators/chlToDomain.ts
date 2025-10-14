import { CHLGame, CHLTeamInfo } from '../../types/chl/game';
import { CHLStandingsTeam, CHLStandingsDataTransformed } from '../../types/chl/standings';
import { GameInfo, LeagueResponse } from '../../types/domain/game';
import { TeamInfo } from '../../types/domain/team';
import { TeamStats, StandingsData } from '../../types/domain/standings';

/**
 * Construct CHL team logo URL from externalId
 */
function getCHLLogoUrl(externalId?: string): string {
  if (externalId && externalId !== 'n/a' && externalId !== '') {
    return `https://res.cloudinary.com/chl-production/image/upload/c_fit,dpr_2.0,f_webp,g_center,h_100,q_auto/v1/chl-prod/assets/teams/${externalId}`;
  }
  return '';
}

export function translateCHLTeamToDomain(chlTeam: CHLTeamInfo): TeamInfo {
  return {
    code: chlTeam.shortName,
    externalId: chlTeam.externalId,
    short: chlTeam.shortName,
    long: chlTeam.name,
    full: chlTeam.name,
    logo: getCHLLogoUrl(chlTeam.externalId)
  };
}

export function translateCHLGameToDomain(chlGame: CHLGame): GameInfo {
  // Map CHL status to domain GameState
  const state = chlGame.status === 'finished' ? 'finished' : 'not-started';
  
  return {
    uuid: chlGame.id,
    startDateTime: chlGame.startDate,
    state,
    homeTeamInfo: {
      teamInfo: {
        code: chlGame.homeTeam.shortName,
        externalId: chlGame.homeTeam.externalId,
        short: chlGame.homeTeam.shortName,
        long: chlGame.homeTeam.name,
        full: chlGame.homeTeam.name,
        logo: getCHLLogoUrl(chlGame.homeTeam.externalId)
      },
      score: chlGame.scores?.home || 0
    },
    awayTeamInfo: {
      teamInfo: {
        code: chlGame.awayTeam.shortName,
        externalId: chlGame.awayTeam.externalId,
        short: chlGame.awayTeam.shortName,
        long: chlGame.awayTeam.name,
        full: chlGame.awayTeam.name,
        logo: getCHLLogoUrl(chlGame.awayTeam.externalId)
      },
      score: chlGame.scores?.away || 0
    },
    venueInfo: {
      name: chlGame.venue
    },
    overtime: false, // CHL doesn't provide overtime info in the current structure
    shootout: false  // CHL doesn't provide shootout info in the current structure
  };
}

export function translateCHLGamesToDomainResponse(chlGames: CHLGame[]): LeagueResponse {
  return {
    gameInfo: chlGames.map(translateCHLGameToDomain),
    teamList: [] // CHL games don't include team list in the same way
  };
}

export function translateCHLStandingsTeamToDomain(chlTeam: CHLStandingsTeam): TeamStats {
  return {
    Rank: chlTeam.rank,
    Team: 0, // CHL doesn't have a Team number field
    GP: chlTeam.gamesPlayed,
    W: chlTeam.wins,
    T: chlTeam.ties,
    L: chlTeam.losses,
    G: chlTeam.goalsFor,
    GPG: chlTeam.gamesPlayed > 0 ? (chlTeam.goalsFor / chlTeam.gamesPlayed).toFixed(2) : '0.00',
    GA: chlTeam.goalsAgainst,
    GAPG: chlTeam.gamesPlayed > 0 ? (chlTeam.goalsAgainst / chlTeam.gamesPlayed).toFixed(2) : '0.00',
    OTW: 0, // CHL doesn't provide overtime wins separately
    OTL: 0, // CHL doesn't provide overtime losses separately
    SOW: 0, // CHL doesn't provide shootout wins separately
    SOL: 0, // CHL doesn't provide shootout losses separately
    info: {
      code: chlTeam.shortName,
      externalId: chlTeam.externalId,
      short: chlTeam.shortName,
      long: chlTeam.name,
      full: chlTeam.name,
      logo: getCHLLogoUrl(chlTeam.externalId)
    }
  };
}

export function translateCHLStandingsToDomain(chlStandings: CHLStandingsDataTransformed): StandingsData {
  return {
    dataColumns: [
      { name: 'Rank', type: 'number', highlighted: true, group: 'position' },
      { name: 'Team', type: 'string', highlighted: true, group: 'team' },
      { name: 'GP', type: 'number', highlighted: false, group: 'games' },
      { name: 'W', type: 'number', highlighted: false, group: 'games' },
      { name: 'T', type: 'number', highlighted: false, group: 'games' },
      { name: 'L', type: 'number', highlighted: false, group: 'games' },
      { name: 'G', type: 'number', highlighted: false, group: 'goals' },
      { name: 'GPG', type: 'string', highlighted: false, group: 'goals' },
      { name: 'GA', type: 'number', highlighted: false, group: 'goals' },
      { name: 'GAPG', type: 'string', highlighted: false, group: 'goals' }
    ],
    stats: chlStandings.teams.map(translateCHLStandingsTeamToDomain)
  };
}
