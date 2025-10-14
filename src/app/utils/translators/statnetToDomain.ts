import {StatnetGameTeamInfo, StatnetGameInfo, StatnetLeagueResponse} from '../../types/statnet/game';
import {GameInfo, LeagueResponse} from '../../types/domain/game';
import { TeamStats } from '../../types/domain/standings';
import {StatnetTeamInfo, StatnetTeamStats} from "@/app/types/statnet/standings";
import {TeamInfo} from "@/app/types/domain/team";

export function translateStatnetGameTeamToDomain(statnetTeam: StatnetGameTeamInfo): TeamInfo {
  return {
      code: statnetTeam.names?.code || statnetTeam.code,
      externalId: statnetTeam.names?.code || statnetTeam.code,
      short: statnetTeam.names?.short || '',
      long: statnetTeam.names?.long || '',
      full: statnetTeam.names?.full || '',
      logo: statnetTeam.logo || statnetTeam.icon || ''
    };
}

export const translateStatnetStandingsTeamToDomain = (statnetTeamInfo: StatnetTeamInfo): TeamInfo =>
{
  return {
    code: statnetTeamInfo.teamNames.code,
    externalId: statnetTeamInfo.teamNames.code,
    short: statnetTeamInfo.teamNames.short,
    long: statnetTeamInfo.teamNames.long,
    full: statnetTeamInfo.teamNames.full,
    logo: statnetTeamInfo.logo
  }
};

export function translateStatnetGameToDomain(statnetGame: StatnetGameInfo): GameInfo {
  return {
    uuid: statnetGame.uuid,
    startDateTime: statnetGame.startDateTime,
    state: statnetGame.state === 'post-game' ? 'finished' : 'not-started',
    homeTeamInfo: {
      teamInfo: translateStatnetGameTeamToDomain(statnetGame.homeTeamInfo),
      score: statnetGame.homeTeamInfo.score
    },
    awayTeamInfo: {
      teamInfo: translateStatnetGameTeamToDomain(statnetGame.awayTeamInfo),
      score: statnetGame.awayTeamInfo.score
    },
    venueInfo: statnetGame.venueInfo,
    overtime: statnetGame.overtime,
    shootout: statnetGame.shootout
  };
}

export function translateStatnetResponseToDomain(statnetResponse: StatnetLeagueResponse): LeagueResponse {
  return {
    gameInfo: statnetResponse.gameInfo.map(translateStatnetGameToDomain),
    teamList: statnetResponse.teamList?.map(statnetTeam => {
          return {
            teamInfo: translateStatnetGameTeamToDomain(statnetTeam),
            score: statnetTeam.score
          }
        })
  };
}

export function translateStatnetTeamStatsToDomain(statnetStats: StatnetTeamStats): TeamStats {
  return {
    Rank: statnetStats.Rank,
    Team: statnetStats.Team,
    GP: statnetStats.GP,
    W: statnetStats.W,
    T: statnetStats.T,
    L: statnetStats.L,
    G: statnetStats.G,
    GPG: statnetStats.GPG,
    GA: statnetStats.GA,
    GAPG: statnetStats.GAPG,
    OTW: statnetStats.OTW,
    OTL: statnetStats.OTL,
    SOW: statnetStats.SOW,
    SOL: statnetStats.SOL,
    info: translateStatnetStandingsTeamToDomain(statnetStats.info)
  };
}
