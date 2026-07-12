import Link from 'next/link';
import { ZONE_COLOR, ZONE_LABEL } from '@/app/components/standings-table';
import { TeamBadge } from '@/app/components/team-badge';
import type { League } from '@/app/types/domain/league';
import type { TeamStanding } from '@/app/types/domain/standings';
import { teamPath } from '@/app/utils/leaguePaths';

type Props = {
  rows: TeamStanding[];
  /** Codes of the matchup teams, rendered with a highlighted background. */
  highlight: string[];
  league: League;
  season?: string;
  caption: string;
};

/**
 * Rows for a matchup excerpt: each matchup team's standing plus its direct
 * neighbours (±1 position within the team's own table/group), deduped and in
 * table order.
 */
export function matchupRows(
  stats: TeamStanding[],
  codes: string[],
): TeamStanding[] {
  const picked = new Set<TeamStanding>();
  for (const code of codes) {
    const i = stats.findIndex((s) => s.info.code === code);
    if (i === -1) continue;
    for (const j of [i - 1, i, i + 1]) {
      const row = stats[j];
      if (row && row.group === stats[i].group) picked.add(row);
    }
  }
  return stats.filter((row) => picked.has(row));
}

/**
 * Compact standings excerpt around a matchup. The matchup teams' rows get a
 * slightly lighter background, paired with a screen-reader note so the
 * highlight is never colour-only.
 */
export function MatchupTable({
  rows,
  highlight,
  league,
  season,
  caption,
}: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="display border-b border-line-strong text-[11px] font-bold uppercase tracking-[0.08em] text-mute">
            <th scope="col" className="px-2 py-2 text-right">
              #
            </th>
            <th scope="col" className="px-2 py-2 text-left">
              Lag
            </th>
            <th scope="col" className="num px-2 py-2 text-right">
              M
            </th>
            <th scope="col" className="num px-2 py-2 text-right">
              V
            </th>
            <th scope="col" className="num px-2 py-2 text-right">
              O
            </th>
            <th scope="col" className="num px-2 py-2 text-right">
              F
            </th>
            <th scope="col" className="num px-2 py-2 text-right">
              MS
            </th>
            <th scope="col" className="num px-2 py-2 text-right">
              P
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isMatchupTeam = highlight.includes(row.info.code);
            return (
              <tr
                key={row.info.code}
                className={`border-b border-line-soft last:border-b-0 ${
                  isMatchupTeam ? 'bg-surface-3' : ''
                }`}
              >
                <td className="num relative px-2 py-2.5 text-right text-dim">
                  {row.zone && (
                    <span
                      className={`absolute inset-y-1 left-0 w-0.5 rounded-full ${ZONE_COLOR[row.zone]}`}
                      aria-hidden="true"
                    />
                  )}
                  {row.Rank}
                  {row.zone && (
                    <span className="sr-only"> ({ZONE_LABEL[row.zone]})</span>
                  )}
                </td>
                <td className="px-2 py-2.5">
                  <Link
                    href={teamPath(league, season, row.info.code)}
                    className="flex items-center gap-2 font-medium text-ink transition-colors hover:text-accent"
                  >
                    <TeamBadge team={row.info} size="sm" />
                    <span className="hidden sm:inline">{row.info.long}</span>
                    <span className="sm:hidden">{row.info.short}</span>
                    {isMatchupTeam && (
                      <span className="sr-only">(spelar i matchen)</span>
                    )}
                  </Link>
                </td>
                <td className="num px-2 py-2.5 text-right text-soft">
                  {row.GP}
                </td>
                <td className="num px-2 py-2.5 text-right text-soft">
                  {row.W}
                </td>
                <td className="num px-2 py-2.5 text-right text-soft">
                  {row.D}
                </td>
                <td className="num px-2 py-2.5 text-right text-soft">
                  {row.L}
                </td>
                <td className="num px-2 py-2.5 text-right text-soft">
                  {row.GD > 0 ? `+${row.GD}` : row.GD}
                </td>
                <td className="num px-2 py-2.5 text-right font-bold text-ink">
                  {row.Points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
