import {TeamInfo} from "@/app/types/domain/team";

export interface GameTeamInfo {
    teamInfo: TeamInfo;
    score: number;
}

export interface VenueInfo {
    name: string;
}

export interface GameInfo {
    uuid: string;
    startDateTime: string;
    state: string;
    homeTeamInfo: GameTeamInfo;
    awayTeamInfo: GameTeamInfo;
    venueInfo: VenueInfo;
    overtime?: boolean;
    shootout?: boolean;
}

export interface LeagueResponse {
    gameInfo: GameInfo[];
    teamList?: GameTeamInfo[];
}
