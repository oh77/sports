import Link from 'next/link';
import { FormMarkers } from '@/app/components/form-markers';
import { TeamBadge } from '@/app/components/team-badge';
import type { League } from '@/app/types/domain/league';
import type {
  StandingsData,
  StandingsZone,
  TeamStanding,
} from '@/app/types/domain/standings';
import { teamPath } from '@/app/utils/leaguePaths';

const ZONE_LABEL: Record<StandingsZone, string> = {
  title: 'Titel',
  championsLeague: 'Champions League',
  europe: 'Europaspel',
  relegationPlayoff: 'Negativt kval',
  relegation: 'Nedflyttning',
  knockout: 'Slutspel',
  knockoutPlayoff: 'Slutspelskval',
};

const ZONE_COLOR: Record<StandingsZone, string> = {
  title: 'bg-accent',
  championsLeague: 'bg-[#3b82f6]',
  europe: 'bg-[#2dd4bf]',
  relegationPlayoff: 'bg-draw',
  relegation: 'bg-loss',
  knockout: 'bg-win',
  knockoutPlayoff: 'bg-[#2dd4bf]',
};

type Props = {
  data: StandingsData;
  league: League;
  season?: string;
  caption: string;
  compact?: boolean;
};

/**
 * Football league table. Compact mode (rank, team, GP, GD, points) is used in
 * overview rails; the full table adds W/D/L, goals, and form. Zone markers
 * pair colour with screen-reader text, and a legend explains the colours.
 */
export function StandingsTable({
  data,
  league,
  season,
  caption,
  compact = false,
}: Props) {
  const groups = new Map<string | undefined, TeamStanding[]>();
  for (const row of data.stats) {
    const list = groups.get(row.group) ?? [];
    list.push(row);
    groups.set(row.group, list);
  }

  const zonesInUse = Array.from(
    new Set(
      data.stats
        .map((row) => row.zone)
        .filter((zone): zone is StandingsZone => zone !== undefined),
    ),
  );

  // Some providers don't supply last-five form; drop the column entirely then.
  const showForm = !compact && data.stats.some((row) => row.form);

  return (
    <div className="flex flex-col gap-4">
      {Array.from(groups.entries()).map(([group, rows]) => (
        <div key={group ?? 'table'} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              {group ? `${caption} – ${group}` : caption}
            </caption>
            <thead>
              <tr className="display border-b border-line-strong text-[11px] font-bold uppercase tracking-[0.08em] text-mute">
                <th scope="col" className="px-2 py-2 text-right">
                  #
                </th>
                <th scope="col" className="px-2 py-2 text-left">
                  {group ? `Lag – ${group}` : 'Lag'}
                </th>
                <th scope="col" className="num px-2 py-2 text-right">
                  M
                </th>
                {!compact && (
                  <>
                    <th scope="col" className="num px-2 py-2 text-right">
                      V
                    </th>
                    <th scope="col" className="num px-2 py-2 text-right">
                      O
                    </th>
                    <th scope="col" className="num px-2 py-2 text-right">
                      F
                    </th>
                    <th
                      scope="col"
                      className="num hidden px-2 py-2 text-right sm:table-cell"
                    >
                      GM
                    </th>
                    <th
                      scope="col"
                      className="num hidden px-2 py-2 text-right sm:table-cell"
                    >
                      IM
                    </th>
                  </>
                )}
                <th scope="col" className="num px-2 py-2 text-right">
                  MS
                </th>
                <th scope="col" className="num px-2 py-2 text-right">
                  P
                </th>
                {showForm && (
                  <th
                    scope="col"
                    className="hidden px-2 py-2 text-left lg:table-cell"
                  >
                    Form
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.info.code}
                  className="border-b border-line-soft transition-colors last:border-b-0 hover:bg-surface-3/50"
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
                    </Link>
                  </td>
                  <td className="num px-2 py-2.5 text-right text-soft">
                    {row.GP}
                  </td>
                  {!compact && (
                    <>
                      <td className="num px-2 py-2.5 text-right text-soft">
                        {row.W}
                      </td>
                      <td className="num px-2 py-2.5 text-right text-soft">
                        {row.D}
                      </td>
                      <td className="num px-2 py-2.5 text-right text-soft">
                        {row.L}
                      </td>
                      <td className="num hidden px-2 py-2.5 text-right text-soft sm:table-cell">
                        {row.GF}
                      </td>
                      <td className="num hidden px-2 py-2.5 text-right text-soft sm:table-cell">
                        {row.GA}
                      </td>
                    </>
                  )}
                  <td className="num px-2 py-2.5 text-right text-soft">
                    {row.GD > 0 ? `+${row.GD}` : row.GD}
                  </td>
                  <td className="num px-2 py-2.5 text-right font-bold text-ink">
                    {row.Points}
                  </td>
                  {showForm && (
                    <td className="hidden px-2 py-2.5 lg:table-cell">
                      {row.form && <FormMarkers form={row.form} />}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {!compact && zonesInUse.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim">
          {zonesInUse.map((zone) => (
            <li key={zone} className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-0.5 rounded-full ${ZONE_COLOR[zone]}`}
                aria-hidden="true"
              />
              {ZONE_LABEL[zone]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
