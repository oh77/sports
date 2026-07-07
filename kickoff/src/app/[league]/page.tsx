import { notFound, redirect } from 'next/navigation';
import { isLeague } from '@/app/config/leagues';
import { leagueBasePath } from '@/app/utils/leaguePaths';

/** Season-less league URL: forward to the league's current season. */
export default async function LeaguePage({
  params,
}: {
  params: Promise<{ league: string }>;
}) {
  const { league } = await params;
  if (!isLeague(league)) notFound();
  redirect(leagueBasePath(league));
}
