import { CHLApiResponse, CHLGame, CHLMatch, CHLTeamsApiResponse, CHLTeamInfo } from '../types/chl';

const CHL_API_URL = 'https://www.chl.hockey/api/s3/live?q=live-events.json';

export class CHLService {
  private static async fetchCHLData(): Promise<CHLApiResponse> {
    try {
      const response = await fetch(CHL_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching CHL data:', error);
      throw error;
    }
  }

  private static async fetchCHLTeams(): Promise<CHLTeamsApiResponse> {
    try {
      const response = await fetch('https://www.chl.hockey/api/s3?q=teams-21ec9dad81abe2e0240460d0-3c5f99fa605394cc65733fc9.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching CHL teams:', error);
      throw error;
    }
  }

  private static transformMatchToGame(match: CHLMatch, teamsMap?: Map<string, CHLTeamInfo>): CHLGame {
    const homeTeamInfo = teamsMap?.get(match.teams.home?.externalId || '');
    const awayTeamInfo = teamsMap?.get(match.teams.away?.externalId || '');

    return {
      id: match._entityId,
      externalId: match.externalId,
      startDate: match.startDate,
      status: match.status,
      venue: match.venue?.name || 'n/a',
      homeTeam: {
        name: match.teams.home?.name || 'n/a',
        shortName: match.teams.home?.shortName || 'n/a',
        externalId: match.teams.home?.externalId || 'n/a',
        country: homeTeamInfo?.country?.name || 'n/a',
      },
      awayTeam: {
        name: match.teams.away?.name || 'n/a',
        shortName: match.teams.away?.shortName || 'n/a',
        externalId: match.teams.away?.externalId || 'n/a',
        country: awayTeamInfo?.country?.name || 'n/a',
      },
      scores: match.results?.scores ? {
        home: match.results.scores.home,
        away: match.results.scores.away,
      } : undefined,
      state: match.state?.name || 'n/a',
      round: match.stage?.round?.name || 'n/a',
      group: match.stage?.group?.name || 'n/a',
    };
  }

  static async getUpcomingGames(): Promise<CHLGame[]> {
    try {
      const [data, teamsData] = await Promise.all([
        this.fetchCHLData(),
        this.fetchCHLTeams()
      ]);
      
      // Create teams map for quick lookup
      const teamsMap = new Map<string, CHLTeamInfo>();
      teamsData.data.forEach(team => {
        teamsMap.set(team.externalId, team);
      });

      const now = new Date();
      
      // Filter for upcoming games (not-started status and future dates)
      const upcomingMatches = data.data.filter(match => 
        match.status === 'not-started' && 
        new Date(match.startDate) > now
      );

      // Sort by start date
      upcomingMatches.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      // Return only the next 3 upcoming games
      return upcomingMatches.slice(0, 3).map(match => this.transformMatchToGame(match, teamsMap));
    } catch (error) {
      console.error('Error getting upcoming CHL games:', error);
      return [];
    }
  }

  static async getGamesByDate(date: string): Promise<CHLGame[]> {
    try {
      const [data, teamsData] = await Promise.all([
        this.fetchCHLData(),
        this.fetchCHLTeams()
      ]);
      
      // Create teams map for quick lookup
      const teamsMap = new Map<string, CHLTeamInfo>();
      teamsData.data.forEach(team => {
        teamsMap.set(team.externalId, team);
      });

      const targetDate = new Date(date);
      
      // Filter games for the specific date
      const gamesForDate = data.data.filter(match => {
        const matchDate = new Date(match.startDate);
        return matchDate.toDateString() === targetDate.toDateString();
      });

      // Sort by start time
      gamesForDate.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      return gamesForDate.map(match => this.transformMatchToGame(match, teamsMap));
    } catch (error) {
      console.error('Error getting CHL games by date:', error);
      return [];
    }
  }

  static async getRecentGames(): Promise<CHLGame[]> {
    try {
      const [data, teamsData] = await Promise.all([
        this.fetchCHLData(),
        this.fetchCHLTeams()
      ]);
      
      // Create teams map for quick lookup
      const teamsMap = new Map<string, CHLTeamInfo>();
      teamsData.data.forEach(team => {
        teamsMap.set(team.externalId, team);
      });

      const now = new Date();
      
      // Filter for finished games
      const finishedMatches = data.data.filter(match => 
        match.status === 'finished'
      );

      // Sort by start date (most recent first)
      finishedMatches.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      // Return only the 3 most recent games
      return finishedMatches.slice(0, 3).map(match => this.transformMatchToGame(match, teamsMap));
    } catch (error) {
      console.error('Error getting recent CHL games:', error);
      return [];
    }
  }

  static async getAllTeams(): Promise<CHLTeamInfo[]> {
    try {
      const teamsData = await this.fetchCHLTeams();
      return teamsData.data;
    } catch (error) {
      console.error('Error getting CHL teams:', error);
      return [];
    }
  }

  static async getAllGames(): Promise<CHLGame[]> {
    try {
      const [data, teamsData] = await Promise.all([
        this.fetchCHLData(),
        this.fetchCHLTeams()
      ]);
      
      // Create teams map for quick lookup
      const teamsMap = new Map<string, CHLTeamInfo>();
      teamsData.data.forEach(team => {
        teamsMap.set(team.externalId, team);
      });

      // Return ALL games (both finished and upcoming)
      return data.data.map(match => this.transformMatchToGame(match, teamsMap));
    } catch (error) {
      console.error('Error getting all CHL games:', error);
      return [];
    }
  }

  static async getAllUpcomingGames(): Promise<CHLGame[]> {
    try {
      const [data, teamsData] = await Promise.all([
        this.fetchCHLData(),
        this.fetchCHLTeams()
      ]);
      
      // Create teams map for quick lookup
      const teamsMap = new Map<string, CHLTeamInfo>();
      teamsData.data.forEach(team => {
        teamsMap.set(team.externalId, team);
      });

      const now = new Date();
      
      // Filter for upcoming games (not-started status and future dates)
      const upcomingMatches = data.data.filter(match => 
        match.status === 'not-started' && 
        new Date(match.startDate) > now
      );

      // Sort by start date
      upcomingMatches.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      // Return ALL upcoming games (not limited to 3)
      return upcomingMatches.map(match => this.transformMatchToGame(match, teamsMap));
    } catch (error) {
      console.error('Error getting all upcoming CHL games:', error);
      return [];
    }
  }

  static async getAllRecentGames(): Promise<CHLGame[]> {
    try {
      const [data, teamsData] = await Promise.all([
        this.fetchCHLData(),
        this.fetchCHLTeams()
      ]);
      
      // Create teams map for quick lookup
      const teamsMap = new Map<string, CHLTeamInfo>();
      teamsData.data.forEach(team => {
        teamsMap.set(team.externalId, team);
      });

      // Filter for finished games
      const finishedMatches = data.data.filter(match => 
        match.status === 'finished'
      );

      // Sort by start date (most recent first)
      finishedMatches.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      // Return ALL recent games (not limited to 3)
      return finishedMatches.map(match => this.transformMatchToGame(match, teamsMap));
    } catch (error) {
      console.error('Error getting all recent CHL games:', error);
      return [];
    }
  }

  static getNextGameDay(games: CHLGame[]): string | null {
    if (games.length === 0) return null;
    
    const nextGame = games[0];
    const gameDate = new Date(nextGame.startDate);
    return gameDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
