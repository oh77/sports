interface TeamInfo {
  code: string;
  names: {
    short: string;
    long: string;
    full: string;
  };
  icon: string;
  score: string;
}

interface VenueInfo {
  name: string;
}

interface GameInfo {
  uuid: string;
  startDateTime: string;
  state: string;
  homeTeamInfo: TeamInfo;
  awayTeamInfo: TeamInfo;
  venueInfo: VenueInfo;
}

interface SHLResponse {
  gameInfo: GameInfo[];
}

export class SHLService {
  private readonly API_URL = '/api/shl-games';
  private readonly STORAGE_KEY = 'shl_games';

  async fetchGames(): Promise<GameInfo[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SHLResponse = await response.json();
      const games = data.gameInfo || [];
      
      // Store in localStorage
      this.storeGames(games);
      
      return games;
    } catch (error) {
      console.error('Error fetching SHL games:', error);
      // Return cached data if available
      return this.getStoredGames();
    }
  }

  private storeGames(games: GameInfo[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error('Error storing games in localStorage:', error);
    }
  }

  getStoredGames(): GameInfo[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading games from localStorage:', error);
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
      const isHomeTeam = game.homeTeamInfo.code === teamCode;
      const isAwayTeam = game.awayTeamInfo.code === teamCode;
      
      return (isHomeTeam || isAwayTeam) && gameDate > now;
    });
    
    return nextGame || null;
  }

  async refreshGames(): Promise<GameInfo[]> {
    return this.fetchGames();
  }
}
