import { PlayerStatsData } from '../types/domain/player-stats';
import { StatnetPlayerStatsData } from '../types/statnet/player-stats';
import { translateStatnetPlayerStatsToDomain } from '../utils/translators/statnetToDomain';

export class SDHLPlayerService {
  private readonly API_URL = 'https://www.sdhl.se/api/statistics-v2/stats-info/players_point';
  private readonly DEFAULT_COUNT = 50;
  private readonly SSGT_UUID = 'n5mqrxbg0g';
  private readonly PROVIDER = 'impleo';
  private readonly STATE = 'active';
  private readonly MODULE_TYPE = 'summary';

  async fetchPlayerStats(count: number = this.DEFAULT_COUNT): Promise<PlayerStatsData> {
    try {
      const url = `${this.API_URL}?count=${count}&ssgtUuid=${this.SSGT_UUID}&provider=${this.PROVIDER}&state=${this.STATE}&moduleType=${this.MODULE_TYPE}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.sdhl.se/',
          'Origin': 'https://www.sdhl.se'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      const statnetData: StatnetPlayerStatsData = rawData[0];

      // Translate to domain model
      const domainData: PlayerStatsData = {
        dataColumns: statnetData.dataColumns,
        defaultSortKey: statnetData.defaultSortKey,
        stats: statnetData.stats.map(translateStatnetPlayerStatsToDomain)
      };

      return domainData;
    } catch (error) {
      console.error('Error fetching SDHL player stats:', error);
      throw error;
    }
  }

  async getTopScorers(count: number = 10): Promise<PlayerStatsData> {
    const data = await this.fetchPlayerStats(count);
    
    // Sort by total points (TP) descending
    const sortedStats = {
      ...data,
      stats: data.stats
        .sort((a, b) => b.TP - a.TP)
        .slice(0, count)
        .map((stat, index) => ({
          ...stat,
          Rank: index + 1
        }))
    };

    return sortedStats;
  }

  async getTopGoalScorers(count: number = 10): Promise<PlayerStatsData> {
    const data = await this.fetchPlayerStats(count);
    
    // Sort by goals (G) descending
    const sortedStats = {
      ...data,
      stats: data.stats
        .sort((a, b) => b.G - a.G)
        .slice(0, count)
        .map((stat, index) => ({
          ...stat,
          Rank: index + 1
        }))
    };

    return sortedStats;
  }

  async getTopAssists(count: number = 10): Promise<PlayerStatsData> {
    const data = await this.fetchPlayerStats(count);
    
    // Sort by assists (A) descending
    const sortedStats = {
      ...data,
      stats: data.stats
        .sort((a, b) => b.A - a.A)
        .slice(0, count)
        .map((stat, index) => ({
          ...stat,
          Rank: index + 1
        }))
    };

    return sortedStats;
  }

  async getPlayersByTeam(teamCode: string, count: number = 50): Promise<PlayerStatsData> {
    const data = await this.fetchPlayerStats(count);
    
    // Filter by team code
    const teamStats = {
      ...data,
      stats: data.stats.filter(stat => 
        stat.info.team.code === teamCode || 
        stat.info.teamCode.toString() === teamCode
      )
    };

    return teamStats;
  }
}