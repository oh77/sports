import { StatnetGameTeamInfo, StatnetGameInfo, StatnetLeagueResponse } from '../types/statnet/game';
import { GameInfo } from '../types/domain/game';
import { TeamInfo } from '../types/domain/team';
import { translateStatnetGameToDomain, translateStatnetGameTeamToDomain, translateStatnetResponseToDomain } from '../utils/translators/statnetToDomain';
import { League } from '../types/domain/league';

export class LeagueService {
  private readonly API_URL: string;
  private readonly STORAGE_KEY: string;
  private readonly league: League;

  constructor(league: League) {
    this.API_URL = `/api/${league}-games`;
    this.STORAGE_KEY = `${league}_games`;
    this.league = league;
  }

  private getTeamCode(teamInfo: StatnetGameTeamInfo): string {
    // Use names.code for both leagues, fallback to code
    return teamInfo.names?.code || teamInfo.code;
  }

  async fetchGames(): Promise<GameInfo[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StatnetLeagueResponse = await response.json();
      const statnetGames = data.gameInfo || [];

      // Extract teams from games or use teamList if available
      const statnetTeams = data.teamList || this.extractTeamsFromStatnetGames(statnetGames);

      // Convert to domain types
      const domainGames = statnetGames.map(translateStatnetGameToDomain);
      const domainTeams = statnetTeams.map(translateStatnetGameTeamToDomain);

      // Store in localStorage
      this.storeGames(domainGames);
      this.storeTeams(domainTeams);

      return domainGames;
    } catch (error) {
      console.error(`Error fetching ${this.STORAGE_KEY} games:`, error);
      // Return cached data if available
      return this.getStoredGames();
    }
  }

  private storeGames(games: GameInfo[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error(`Error storing games in localStorage:`, error);
    }
  }

  getStoredGames(): GameInfo[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const games = JSON.parse(stored);

      // Validate that the stored data has the correct domain structure
      if (games.length > 0 && games[0].homeTeamInfo && !games[0].homeTeamInfo.teamInfo) {
        console.warn('Stored games have incorrect structure, clearing cache');
        localStorage.removeItem(this.STORAGE_KEY);
        return [];
      }

      return games;
    } catch (error) {
      console.error(`Error reading games from localStorage:`, error);
      return [];
    }
  }

  getFirstGame(): GameInfo | null {
    const games = this.getStoredGames();
    return games.length > 0 ? games[0] : null;
  }

  getNextGameForTeam(teamCode: string): GameInfo | null {
    const games = this.getStoredGames();
    const now = new Date();

    // Find the next game for this team (home or away)
    const nextGame = games.find(game => {
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
    const games = this.getStoredGames();
    const now = new Date();

    // Get all previous games for this team (home or away)
    const previousGames = games
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
    const games = this.getStoredGames();
    const now = new Date();

    // Get all upcoming games for this team (home or away)
    const upcomingGames = games
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

  async refreshGames(): Promise<GameInfo[]> {
    return this.fetchGames();
  }

  clearCache(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(`${this.STORAGE_KEY}_teams`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  getTeamList(): TeamInfo[] {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_teams`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error reading teams from localStorage:`, error);
      return [];
    }
  }

  private storeTeams(teams: TeamInfo[]): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_teams`, JSON.stringify(teams));
    } catch (error) {
      console.error(`Error storing teams in localStorage:`, error);
    }
  }

  private extractTeamsFromStatnetGames(games: StatnetGameInfo[]): StatnetGameTeamInfo[] {
    const teamMap = new Map<string, StatnetGameTeamInfo>();

    games.forEach(game => {
      // Add home team
      const homeTeamCode = this.getTeamCode(game.homeTeamInfo);
      if (!teamMap.has(homeTeamCode)) {
        teamMap.set(homeTeamCode, game.homeTeamInfo);
      }

      // Add away team
      const awayTeamCode = this.getTeamCode(game.awayTeamInfo);
      if (!teamMap.has(awayTeamCode)) {
        teamMap.set(awayTeamCode, game.awayTeamInfo);
      }
    });

    return Array.from(teamMap.values());
  }
}
