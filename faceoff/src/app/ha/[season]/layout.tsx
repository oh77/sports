import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { LeagueShell } from '@/app/components/league-shell';
import { CURRENT_SEASON, statnetSeasonsFor } from '@/app/config/statnet';

export default async function HaSeasonLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ season: string }>;
}) {
  const { season } = await params;
  // Only the current HA season has data (e.g. when switching league from an
  // older SHL season), so send anything else to it.
  if (!statnetSeasonsFor('ha').some((s) => s.key === season)) {
    redirect(`/ha/${CURRENT_SEASON.key}`);
  }
  return (
    <LeagueShell league="ha" season={season}>
      {children}
    </LeagueShell>
  );
}
