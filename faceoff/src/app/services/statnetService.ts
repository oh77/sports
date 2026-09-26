import type { GameType } from '../config/statnet';
import type { GameInfo, LeagueResponse } from '../types/domain/game';
import type { League } from '../types/domain/league';
import type { TeamInfo } from '../types/domain/team';
import type { StatnetLeagueResponse } from '../types/statnet/game';
import {
  translateStatnetGameTeamToDomain,
  translateStatnetGameToDomain,
} from '../utils/translators/statnetToDomain';

export class StatnetService {
  private readonly seasonQuery: string;
  private readonly TEAMS_API_URL: string;
  private readonly league: League;
  private games: GameInfo[] = [];

  constructor(league: League, season?: string) {
    this.seasonQuery = season ? `?season=${encodeURIComponent(season)}` : '';
    this.TEAMS_API_URL = `/api/${league}-teams${this.seasonQuery}`;
    this.league = league;
  }

  /** Fetch games for a schedule phase (defaults to the regular season). */
  async fetchGames(gameType?: GameType): Promise<GameInfo[]> {
    try {
      let url = `/api/${this.league}-games${this.seasonQuery}`;
      if (gameType) {
        url += `${this.seasonQuery ? '&' : '?'}gameType=${gameType}`;
      }
      const response = await fetch(url);
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
        this.games = (statnetData.gameInfo || []).map(
          translateStatnetGameToDomain,
        );
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
        return chlTeams.filter((team: TeamInfo) => team?.code);
      } else {
        // SHL/SDHL API returns Statnet models
        const statnetTeams = data.teams || [];

        return statnetTeams
          .map(translateStatnetGameTeamToDomain)
          .filter((team: TeamInfo) => team?.code);
      }
    } catch (error) {
      console.error(`Error fetching teams for ${this.league}:`, error);
      throw error;
    }
  }

  getFirstGame(): GameInfo | null {
    return this.games.length > 0 ? this.games[0] : null;
  }
}
