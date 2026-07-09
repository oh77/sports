export interface SportomediaTeam {
  abbrv: string;
  everySportId: number;
  displayName: string;
  name: string;
  logoImageUrl: string;
}

export interface SportomediaTeamsData {
  teamsForLeague: {
    teams: SportomediaTeam[];
  };
}
