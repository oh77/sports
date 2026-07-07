import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { LeagueShell } from '@/app/components/league-shell';
import { isLeague, isSeason } from '@/app/config/leagues';

/** Validates the league/season segments and applies the league theme shell. */
export default async function LeagueSeasonLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ league: string; season: string }>;
}) {
  const { league, season } = await params;
  if (!isLeague(league) || !isSeason(league, season)) notFound();

  return (
    <LeagueShell league={league} season={season}>
      {children}
    </LeagueShell>
  );
}
