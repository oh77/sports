import { LeagueStats } from '@/app/components/league-stats';

/**
 * NHL statistics. Nationality comes from the club rosters (the stats feed has
 * none), which also powers the Swedish filter.
 */
export default function NhlStatsPage() {
  return (
    <LeagueStats
      league="nhl"
      nationalityFilters={[{ code: 'SE', label: 'Svenskar' }]}
    />
  );
}
