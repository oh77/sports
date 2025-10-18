import { GameInfo } from '../types/domain/game';
import { TeamInfo } from '../types/domain/team';
import { League } from '../types/domain/league';
import { StatnetLeagueResponse } from '../types/statnet/game';
import { translateStatnetGameToDomain, translateStatnetGameTeamToDomain } from '../utils/translators/statnetToDomain';
import { LeagueResponse } from '../types/domain/game';

export class StatnetService {
  private readonly API_URL: string;
  private readonly TEAMS_API_URL: string;
  private readonly league: League;
  private games: GameInfo[] = [];

  constructor(league: League) {
    this.API_URL = `/api/${league}-games`;
    this.TEAMS_API_URL = `/api/${league}-teams`;
    this.league = league;
  }

  async fetchGames(): Promise<GameInfo[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different API responses based on league
      if (this.league === 'chl') {
        // CHL API now returns domain models directly
        const chlData = data as LeagueResponse;
        this.games = chlData.gameInfo || [];
      } else {
        // SHL/SDHL API returns Statnet model
        const statnetData: StatnetLeagueResponse = data;
        // Transform to domain model
        this.games = (statnetData.gameInfo || []).map(translateStatnetGameToDomain);
      }

      return this.games;
    } catch (error) {
      console.error(`Error fetching games for ${this.league}:`, error);
      throw error;
    }
  }

  async fetchTeams(): Promise<TeamInfo[]> {
    try {
      const response = await fetch(this.TEAMS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different API responses based on league
      if (this.league === 'chl') {
        // CHL API now returns domain models directly
        const chlTeams = data as TeamInfo[];
        return chlTeams.filter((team: TeamInfo) => team && team.code);
      } else {
        // SHL/SDHL API returns Statnet models
        const statnetTeams = data.teams || [];

        return statnetTeams
          .map(translateStatnetGameTeamToDomain)
          .filter((team: TeamInfo) => team && team.code);
      }
    } catch (error) {
      console.error(`Error fetching teams for ${this.league}:`, error);
      throw error;
    }
  }

  getFirstGame(): GameInfo | null {
    return this.games.length > 0 ? this.games[0] : null;
  }

  getNextGameForTeam(teamCode: string): GameInfo | null {
    const now = new Date();

    // Find the next game for this team (home or away)
    const nextGame = this.games.find(game => {
      try {
        const gameDate = new Date(game.startDateTime);
        const isHomeTeam = game.homeTeamInfo?.teamInfo?.code === teamCode;
        const isAwayTeam = game.awayTeamInfo?.teamInfo?.code === teamCode;

        return (isHomeTeam || isAwayTeam) && gameDate > now;
      } catch (error) {
        console.warn('Error processing game in getNextGameForTeam:', error);
        return false;
      }
    });

    return nextGame || null;
  }

  getPreviousGamesForTeam(teamCode: string, limit: number = 3): GameInfo[] {
    const now = new Date();

    // Get all previous games for this team (home or away)
    const previousGames = this.games
      .filter(game => {
        try {
          const gameDate = new Date(game.startDateTime);
          const isHomeTeam = game.homeTeamInfo?.teamInfo?.code === teamCode;
          const isAwayTeam = game.awayTeamInfo?.teamInfo?.code === teamCode;

          return (isHomeTeam || isAwayTeam) && gameDate < now;
        } catch (error) {
          console.warn('Error processing game in getPreviousGamesForTeam:', error);
          return false;
        }
      })
      .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime())
      .slice(0, limit);

    return previousGames;
  }

  getUpcomingGamesForTeam(teamCode: string, limit: number = 3): GameInfo[] {
    const now = new Date();

    // Get all upcoming games for this team (home or away)
    const upcomingGames = this.games
      .filter(game => {
        try {
          const gameDate = new Date(game.startDateTime);
          const isHomeTeam = game.homeTeamInfo?.teamInfo?.code === teamCode;
          const isAwayTeam = game.awayTeamInfo?.teamInfo?.code === teamCode;

          return (isHomeTeam || isAwayTeam) && gameDate > now;
        } catch (error) {
          console.warn('Error processing game in getUpcomingGamesForTeam:', error);
          return false;
        }
      })
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
      .slice(1, limit + 1); // Skip the first one (next game) and get the next 3

    return upcomingGames;
  }
}
