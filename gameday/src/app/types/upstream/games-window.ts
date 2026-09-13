/**
 * Response of `GET /api/games-window` in kickoff and faceoff. Each app returns
 * its own domain game type (kickoff `MatchInfo`, faceoff `GameInfo`); only the
 * fields gameday reads are declared here, and both shapes satisfy them.
 */

export interface UpstreamTeamInfo {
  code: string;
  short: string;
  full: string;
  logo?: string;
}

export interface UpstreamGameTeam {
  teamInfo: UpstreamTeamInfo;
  score: number;
}

export interface UpstreamGame {
  uuid: string;
  startDateTime: string;
  state: string;
  homeTeamInfo: UpstreamGameTeam;
  awayTeamInfo: UpstreamGameTeam;
  venueInfo?: { name?: string };
  roundLabel?: string;
}

export interface GamesWindowResponse {
  from: string;
  to: string;
  games: { league: string; game: UpstreamGame }[];
}
