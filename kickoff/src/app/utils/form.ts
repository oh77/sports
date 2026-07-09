import type { MatchInfo } from '@/app/types/domain/match';
import type { MatchOutcome } from '@/app/types/domain/standings';

/** Result of a match from one team's perspective. */
export function outcomeFor(teamCode: string, match: MatchInfo): MatchOutcome {
  const isHome = match.homeTeamInfo.teamInfo.code === teamCode;
  const own = isHome ? match.homeTeamInfo.score : match.awayTeamInfo.score;
  const other = isHome ? match.awayTeamInfo.score : match.homeTeamInfo.score;
  if (own > other) return 'W';
  if (own < other) return 'L';
  return 'D';
}

/**
 * Last five finished results for a team, most recent last. Used to derive
 * form when the provider doesn't supply it.
 */
export function lastFiveForm(
  matches: MatchInfo[],
  teamCode: string,
): MatchOutcome[] {
  return matches
    .filter(
      (m) =>
        m.state === 'finished' &&
        (m.homeTeamInfo.teamInfo.code === teamCode ||
          m.awayTeamInfo.teamInfo.code === teamCode),
    )
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
    .slice(-5)
    .map((m) => outcomeFor(teamCode, m));
}
