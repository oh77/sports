import {TeamInfo} from "@/app/types/domain/team";

export interface TeamStats {
    Rank: number | null;
    Team: number;
    GP: number;
    W: number;
    T: number;
    L: number;
    G: number;
    GPG: string;
    GA: number;
    GAPG: string;
    OTW: number;
    OTL: number;
    SOW: number;
    SOL: number;
    info: TeamInfo;
}

export interface DataColumn {
    name: string;
    type: string;
    highlighted: boolean;
    group: string;
}

export interface StandingsData {
    dataColumns: DataColumn[];
    stats: TeamStats[];
}
