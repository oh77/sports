'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type {
  MonthFilter,
  StandingsFilter,
} from '@/app/types/domain/standingsFilter';
import { formatMonthLabel, formatMonthShortLabel } from '../standingsUtils';

/**
 * The selected table filter, kept in the `filter` query param so a view stays
 * linkable and survives a reload. `season` is the default and carries no param.
 */
export function useStandingsFilter(): [
  StandingsFilter,
  (filter: StandingsFilter) => void,
] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = (searchParams.get('filter') || 'season') as StandingsFilter;

  const setFilter = useCallback(
    (next: StandingsFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === 'season') {
        params.delete('filter');
      } else {
        params.set('filter', next);
      }
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return [filter, setFilter];
}

interface StandingsFilterBarProps {
  filter: StandingsFilter;
  onChange: (filter: StandingsFilter) => void;
  /** Months with played games, oldest first (from `getAvailableMonths`). */
  months: MonthFilter[];
}

/**
 * Table filter: the league's own table, home or away form, or a single month.
 * A dropdown on phones, a button row from `md` up.
 */
export function StandingsFilterBar({
  filter,
  onChange,
  months,
}: StandingsFilterBarProps) {
  return (
    <div className="mb-4">
      {/* Mobile: dropdown */}
      <label className="md:hidden" htmlFor="standings-filter">
        <span className="sr-only">Filtrera tabellen</span>
        <select
          id="standings-filter"
          value={filter}
          onChange={(e) => onChange(e.target.value as StandingsFilter)}
          className="w-full cursor-pointer rounded-lg border border-line bg-surface px-4 py-2 font-medium text-ink hover:bg-surface-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="season">Totalt</option>
          <option disabled>Hemma/Borta</option>
          <option value="home">Hemma</option>
          <option value="away">Borta</option>
          {months.length > 0 && <option disabled>Månader</option>}
          {months.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>
      </label>

      {/* Desktop: buttons */}
      <div className="hidden flex-wrap gap-2 md:flex">
        <FilterButton
          label="TOTALT"
          active={filter === 'season'}
          onClick={() => onChange('season')}
        />
        <FilterButton
          label="H"
          title="Hemma"
          active={filter === 'home'}
          onClick={() => onChange('home')}
        />
        <FilterButton
          label="B"
          title="Borta"
          active={filter === 'away'}
          onClick={() => onChange('away')}
        />
        {months.map((month) => (
          <FilterButton
            key={month}
            label={formatMonthShortLabel(month)}
            title={formatMonthLabel(month)}
            active={filter === month}
            onClick={() => onChange(month)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  label,
  title,
  active,
  onClick,
}: {
  label: string;
  title?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`display rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-[0.04em] transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'border border-line bg-surface-3 text-dim hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
