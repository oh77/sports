import {StatnetGameTeamInfo, StatnetGameInfo} from '../../types/statnet/game';
import {GameInfo} from '../../types/domain/game';
import { TeamStats } from '../../types/domain/standings';
import {StatnetTeamInfo, StatnetTeamStats} from "@/app/types/statnet/standings";
import {TeamInfo} from "@/app/types/domain/team";
import { PlayerStats, PlayerInfo } from '../../types/domain/player-stats';
import { StatnetPlayerStats, StatnetPlayerInfo } from '../../types/statnet/player-stats';

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

export function translateStatnetTeamStatsToDomain(statnetStats: StatnetTeamStats): TeamStats {
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
      info: translateStatnetStandingsTeamToDomain(statnetStats.info)
  };
}

export function translateStatnetPlayerInfoToDomain(statnetInfo: StatnetPlayerInfo): PlayerInfo {
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
    teamId: statnetInfo.teamId
  };
}

export function translateStatnetPlayerStatsToDomain(statnetStats: StatnetPlayerStats): PlayerStats {
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
    info: translateStatnetPlayerInfoToDomain(statnetStats.info)
  };
}
