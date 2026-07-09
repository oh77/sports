/** Named stat cell; known names: gp, w, t, l, gf, ga, d (goal diff), pts. */
export interface SportomediaStandingStat {
  value: string;
  name: string;
}

export interface SportomediaStanding {
  teamAbbrv: string;
  teamName: string;
  position: number;
  previousPosition: number;
  stats: SportomediaStandingStat[];
  teamId: number;
}

export interface SportomediaStandingsData {
  standingsForLeague: {
    standings: SportomediaStanding[];
  };
}
