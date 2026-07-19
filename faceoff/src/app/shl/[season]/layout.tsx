import type { ReactNode } from 'react';
import { LeagueShell } from '@/app/components/league-shell';

export default async function ShlSeasonLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ season: string }>;
}) {
  const { season } = await params;
  return (
    <LeagueShell league="shl" season={season}>
      {children}
    </LeagueShell>
  );
}
