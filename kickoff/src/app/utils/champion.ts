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
 * Domestic leagues crown the standings leader; UEFA knockout competitions
 * crown the winner of the final.
 */
export function seasonChampion(
  league: League,
  matches: MatchInfo[],
  standings: StandingsData,
): TeamInfo | null {
  if (league === 'cl' || league === 'col') {
    // The champion is the winner of the final — the last tournament match of
    // the season. The official UEFA site reads it from the tournament matches
    // ordered by date descending (matches[0] is the final); we already hold
    // the full schedule, so pick the finished match labelled "Final". This
    // deliberately does not wait on the whole sprawling qualifying phase being
    // marked finished — only the final itself decides the title.
    const final = matches
      .filter((m) => m.state === 'finished' && m.isFinal)
      .sort((a, b) => b.startDateTime.localeCompare(a.startDateTime))[0];
    return final ? matchWinner(final) : null;
  }

  // Domestic leagues: the standings leader, once every match is played.
  const allPlayed =
    matches.length > 0 && matches.every((m) => m.state === 'finished');
  if (!allPlayed) return null;
  return standings.stats.find((row) => row.Rank === 1)?.info ?? null;
}
