import type { MatchInfo } from '@/app/types/domain/match';
import type { MatchOutcome, SideRecord } from '@/app/types/domain/standings';

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

/**
 * A team's record over its finished home or away games. Used to derive
 * home/away splits when the provider's standings don't carry them.
 */
export function sideRecordFor(
  matches: MatchInfo[],
  teamCode: string,
  side: 'home' | 'away',
): SideRecord {
  const record: SideRecord = { GP: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0 };
  for (const match of matches) {
    if (match.state !== 'finished') continue;
    const own = side === 'home' ? match.homeTeamInfo : match.awayTeamInfo;
    if (own.teamInfo.code !== teamCode) continue;
    const other = side === 'home' ? match.awayTeamInfo : match.homeTeamInfo;
    record.GP++;
    record.GF += own.score;
    record.GA += other.score;
    if (own.score > other.score) record.W++;
    else if (own.score < other.score) record.L++;
    else record.D++;
  }
  return record;
}
