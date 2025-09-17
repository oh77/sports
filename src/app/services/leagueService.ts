import { TeamInfo, GameInfo, LeagueResponse } from '../types/game';

export class LeagueService {
  private readonly API_URL: string;
  private readonly STORAGE_KEY: string;
  private readonly league: 'shl' | 'sdhl';

  constructor(league: 'shl' | 'sdhl') {
    this.API_URL = `/api/${league}-games`;
    this.STORAGE_KEY = `${league}_games`;
    this.league = league;
  }

  private getTeamCode(teamInfo: TeamInfo): string {
    // Use names.code for both leagues, fallback to code
    return teamInfo.names?.code || teamInfo.code;
  }

  async fetchGames(): Promise<GameInfo[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LeagueResponse = await response.json();
      const games = data.gameInfo || [];
      
      // Extract teams from games or use teamList if available
      const teams = data.teamList || this.extractTeamsFromGames(games);
      
      // Store in localStorage
      this.storeGames(games);
      this.storeTeams(teams);
      
      return games;
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
      return stored ? JSON.parse(stored) : [];
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
      const gameDate = new Date(game.startDateTime);
      const isHomeTeam = this.getTeamCode(game.homeTeamInfo) === teamCode;
      const isAwayTeam = this.getTeamCode(game.awayTeamInfo) === teamCode;
      
      return (isHomeTeam || isAwayTeam) && gameDate > now;
    });
    
    return nextGame || null;
  }

  getPreviousGamesForTeam(teamCode: string, limit: number = 3): GameInfo[] {
    const games = this.getStoredGames();
    const now = new Date();
    
    // Get all previous games for this team (home or away)
    const previousGames = games
      .filter(game => {
        const gameDate = new Date(game.startDateTime);
        const isHomeTeam = this.getTeamCode(game.homeTeamInfo) === teamCode;
        const isAwayTeam = this.getTeamCode(game.awayTeamInfo) === teamCode;
        
        return (isHomeTeam || isAwayTeam) && gameDate < now;
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
        const gameDate = new Date(game.startDateTime);
        const isHomeTeam = this.getTeamCode(game.homeTeamInfo) === teamCode;
        const isAwayTeam = this.getTeamCode(game.awayTeamInfo) === teamCode;
        
        return (isHomeTeam || isAwayTeam) && gameDate > now;
      })
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
      .slice(1, limit + 1); // Skip the first one (next game) and get the next 3
    
    return upcomingGames;
  }

  async refreshGames(): Promise<GameInfo[]> {
    return this.fetchGames();
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

  private extractTeamsFromGames(games: GameInfo[]): TeamInfo[] {
    const teamMap = new Map<string, TeamInfo>();
    
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
