import type { League } from '@/app/types/domain/league';
import type { MatchInfo } from '@/app/types/domain/match';
import type { StandingsData } from '@/app/types/domain/standings';
import type { TeamInfo } from '@/app/types/domain/team';

/** Winner of a single match; penalties decide drawn knockout games. */
export function matchWinner(match: MatchInfo): TeamInfo | null {
  const home = match.homeTeamInfo;
  const away = match.awayTeamInfo;
  if (home.score !== away.score) {
    return home.score > away.score ? home.teamInfo : away.teamInfo;
  }
  if (
    home.penaltyScore !== undefined &&
    away.penaltyScore !== undefined &&
    home.penaltyScore !== away.penaltyScore
  ) {
    return home.penaltyScore > away.penaltyScore
      ? home.teamInfo
      : away.teamInfo;
  }
  return null;
}

/**
 * The season's champion, or null while the season is still being played.
 * League champions top the standings; the CL champion wins the final (the
 * last match of the season).
 */
export function seasonChampion(
  league: League,
  matches: MatchInfo[],
  standings: StandingsData,
): TeamInfo | null {
  const allPlayed =
    matches.length > 0 && matches.every((m) => m.state === 'finished');
  if (!allPlayed) return null;

  if (league === 'cl') {
    const final = [...matches].sort((a, b) =>
      b.startDateTime.localeCompare(a.startDateTime),
    )[0];
    // Early in a CL season every match so far can be finished (qualifying
    // legs) — only the actual final decides a champion.
    if (final.roundLabel !== 'Final') return null;
    return matchWinner(final);
  }

  return standings.stats.find((row) => row.Rank === 1)?.info ?? null;
}
