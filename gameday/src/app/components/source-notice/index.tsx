import { UPSTREAMS } from '@/app/config/upstreams';
import type { Sport } from '@/app/types/domain/league';

/** Tells the reader which sports are missing because an upstream app failed. */
export function SourceNotice({ failed }: { failed: Sport[] }) {
  if (failed.length === 0) return null;
  const labels = failed.map((sport) => UPSTREAMS[sport].label).join(' och ');
  return (
    <p
      role="status"
      className="mb-6 rounded-lg border border-live/40 bg-live/10 px-3 py-2 text-sm text-soft"
    >
      Kunde inte hämta matcher för {labels} just nu.
    </p>
  );
}
