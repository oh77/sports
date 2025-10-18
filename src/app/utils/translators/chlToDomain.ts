import { CHLGame, CHLTeamInfo } from '../../types/chl/game';
import { GameInfo, LeagueResponse } from '../../types/domain/game';
import { TeamInfo } from '../../types/domain/team';

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
