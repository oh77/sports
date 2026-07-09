import type { DataColumn } from '@/app/types/domain/data-table';
import type { PlayerInfo } from '@/app/types/domain/player-stats';

/** Swedish header labels for known stat column keys. */
const COLUMN_LABEL: Record<string, string> = {
  GP: 'M',
  G: 'Mål',
  A: 'Ass',
  TP: 'P',
  YC: 'Gula',
  RC: 'Röda',
  MIN: 'Min',
  CS: 'Nollor',
  GA: 'IM',
  GAA: 'IM/M',
  SVS: 'Räddn.',
  SVSPerc: 'Räddn.%',
};

type StatRow = {
  Rank: number | null;
  info: PlayerInfo;
};

type Props<T extends StatRow> = {
  dataColumns: DataColumn[];
  stats: T[];
  caption: string;
  limit?: number;
};

/**
 * Generic player/keeper stats table. Columns are driven by the data's
 * `dataColumns` metadata (the application-contract pattern), so scorer,
 * assist, card, and keeper tables all render through this one component.
 */
export function StatsTable<T extends StatRow>({
  dataColumns,
  stats,
  caption,
  limit,
}: Props<T>) {
  const rows = limit ? stats.slice(0, limit) : stats;

  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-mute">
        Statistiken är inte tillgänglig ännu.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="display border-b border-line-strong text-[11px] font-bold uppercase tracking-[0.08em] text-mute">
            <th scope="col" className="px-2 py-2 text-right">
              #
            </th>
            <th scope="col" className="px-2 py-2 text-left">
              Spelare
            </th>
            <th
              scope="col"
              className="hidden px-2 py-2 text-left sm:table-cell"
            >
              Lag
            </th>
            {dataColumns.map((col) => (
              <th
                key={col.name}
                scope="col"
                className={`num px-2 py-2 text-right ${col.highlighted ? 'text-ink' : ''}`}
              >
                {COLUMN_LABEL[col.name] ?? col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.info.uuid}
              className="border-b border-line-soft last:border-b-0 hover:bg-surface-3/50"
            >
              <td className="num px-2 py-2.5 text-right text-dim">{i + 1}</td>
              <td className="px-2 py-2.5 font-medium text-ink">
                {row.info.fullName}
                <span className="ml-1.5 text-xs text-mute sm:hidden">
                  {row.info.team.code.toUpperCase()}
                </span>
              </td>
              <td className="hidden px-2 py-2.5 text-soft sm:table-cell">
                {row.info.team.name}
              </td>
              {dataColumns.map((col) => (
                <td
                  key={col.name}
                  className={`num px-2 py-2.5 text-right ${
                    col.highlighted ? 'font-bold text-ink' : 'text-soft'
                  }`}
                >
                  {cellValue(row, col.name)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cellValue(row: object, key: string): string | number {
  const value = (row as Record<string, unknown>)[key];
  if (typeof value === 'number' || typeof value === 'string') return value;
  return '–';
}
