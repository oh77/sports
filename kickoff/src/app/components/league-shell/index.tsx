import type { CSSProperties, ReactNode } from 'react';
import { leagueAccent } from '@/app/theme/pitch';
import type { League } from '@/app/types/domain/league';
import LeagueFooter from '../league-footer';
import { TopNav } from '../top-nav';

interface LeagueShellProps {
  league: League;
  season?: string;
  children: ReactNode;
}

/**
 * Dark broadcast app shell shared by every league page. Sets the per-league
 * `--accent` colour, renders the persistent top navigation, and fills the
 * viewport with the near-black surface.
 */
export function LeagueShell({ league, season, children }: LeagueShellProps) {
  return (
    <div
      className="min-h-screen bg-bg text-ink"
      style={{ '--accent': leagueAccent[league] } as CSSProperties}
    >
      <TopNav league={league} season={season} />
      {children}
      <LeagueFooter league={league} season={season} />
    </div>
  );
}
