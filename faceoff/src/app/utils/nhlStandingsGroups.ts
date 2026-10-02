import type { StandingsData, TeamStats } from '@/app/types/domain/standings';

/** A titled excerpt of the NHL table: a division, a conference or the league. */
export interface NhlTable {
  title: string;
  standings: StandingsData;
}

type GroupKey = 'division' | 'conference';

const SUFFIX: Record<GroupKey, string> = {
  division: 'Division',
  conference: 'Conference',
};

/**
 * One division's or conference's clubs as a table of its own, ranked by
 * their order in the league table.
 */
function groupTable(
  standings: StandingsData,
  key: GroupKey,
  name: string,
): NhlTable {
  const stats: TeamStats[] = (standings.stats || [])
    .filter((t) => t[key] === name)
    .sort((a, b) => (a.Rank ?? 999) - (b.Rank ?? 999))
    .map((t, i) => ({ ...t, Rank: i + 1 }));
  return {
    title: `${name} ${SUFFIX[key]}`,
    standings: { ...standings, stats },
  };
}

const rowFor = (standings: StandingsData, code: string) =>
  standings.stats?.find((t) => t.info.code === code);

/** The club's division table; the league table if its division is unknown. */
export function nhlDivisionTable(
  standings: StandingsData,
  teamCode: string,
): NhlTable {
  const division = rowFor(standings, teamCode)?.division;
  return division
    ? groupTable(standings, 'division', division)
    : { title: 'NHL', standings };
}

/**
 * The narrowest table both clubs are in: their division, else their
 * conference, else the whole league (cross-conference games).
 */
export function nhlMatchupTable(
  standings: StandingsData,
  teamCode: string,
  opponentTeamCode: string,
): NhlTable {
  const team = rowFor(standings, teamCode);
  const opponent = rowFor(standings, opponentTeamCode);
  for (const key of ['division', 'conference'] as const) {
    const name = team?.[key];
    if (name && name === opponent?.[key]) {
      return groupTable(standings, key, name);
    }
  }
  return { title: 'NHL', standings };
}
