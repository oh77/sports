import type { ReactNode } from 'react';
import { LeagueShell } from '@/app/components/league-shell';

export default async function HaSeasonLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ season: string }>;
}) {
  const { season } = await params;
  return (
    <LeagueShell league="ha" season={season}>
      {children}
    </LeagueShell>
  );
}
