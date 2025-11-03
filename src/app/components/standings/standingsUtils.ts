import type { League } from '@/app/types/domain/league';
import type { TeamStats } from '@/app/types/domain/standings';

export const getTeamCode = (team: TeamStats): string => team.info.code;

export const getTeamName = (team: TeamStats): string => team.info.short;

export const getTeamLogo = (team: TeamStats): string => team.info.logo;

export const getRankDisplay = (rank: number | null): string =>
  rank === null ? '-' : rank.toString();

export const getRankBorderClass = (
  league: League,
  tablePosition: number,
  totalTeams: number,
): string => {
  if (league === 'shl') {
    // SHL: playoff (top 6), playoff qualification (next 4), relegation (last 2)
    if (tablePosition <= 6) return 'border-r-4 border-yellow-400'; // Playoff spots
    if (tablePosition <= 10) return 'border-r-4 border-blue-400'; // Playoff qualification
    if (tablePosition >= totalTeams - 1) return 'border-r-4 border-red-400'; // Relegation zone
  } else if (league === 'sdhl') {
    // SDHL: playoff (top 8), no playoff qualification, relegation (last 2)
    if (tablePosition <= 8) return 'border-r-4 border-yellow-400'; // Playoff spots
    if (tablePosition >= totalTeams - 1) return 'border-r-4 border-red-400'; // Relegation zone
  } else if (league === 'chl') {
    // CHL: playoff (top 16), no playoff qualification, no relegation
    if (tablePosition <= 16) return 'border-r-4 border-yellow-400'; // Playoff spots
  }
  return '';
};
