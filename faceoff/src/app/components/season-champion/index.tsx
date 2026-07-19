'use client';

import Image from 'next/image';
import type { TeamInfo } from '@/app/types/domain/team';
import { seasonLabel } from '@/app/utils/seasonLabel';
import {
  lighten,
  type RGB,
  rgba,
  useDominantColor,
} from '@/app/utils/useDominantColor';

interface SeasonChampionProps {
  team: TeamInfo;
  season?: string;
}

// Neutral slate used until the logo color resolves, or when it has none.
const DEFAULT_ACCENT: RGB = { r: 82, g: 98, b: 128 };

/**
 * Shown on a league landing page when the season has no upcoming games: the
 * winner of the last played game (most likely the champion), with an accent
 * gradient pulled from the team's logo.
 */
export function SeasonChampion({ team, season }: SeasonChampionProps) {
  const accent = useDominantColor(team.logo) ?? DEFAULT_ACCENT;

  return (
    <div
      className="mx-auto mb-8 max-w-2xl overflow-hidden rounded-2xl border border-white/5 p-8 text-center"
      style={{
        background: [
          `radial-gradient(90% 120% at 50% 0%, ${rgba(accent, 0.5)} 0%, ${rgba(accent, 0.12)} 38%, transparent 66%)`,
          'linear-gradient(180deg, #0d1119, #090c12)',
        ].join(', '),
      }}
    >
      <div
        className="display mb-6 text-sm font-semibold uppercase tracking-[0.18em]"
        style={{ color: rgba(lighten(accent, 0.5), 0.95) }}
      >
        MÄSTARE{season ? ` ${seasonLabel(season)}` : ''}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div
          className="relative flex h-28 w-28 items-center justify-center rounded-full md:h-36 md:w-36"
          style={{
            backgroundColor: rgba(accent, 0.14),
            border: `1px solid ${rgba(accent, 0.3)}`,
            boxShadow: `0 0 55px ${rgba(accent, 0.4)}`,
          }}
        >
          {team.logo ? (
            <Image
              src={team.logo}
              alt={team.short}
              width={144}
              height={144}
              className="h-20 w-20 object-contain md:h-24 md:w-24"
            />
          ) : (
            <span className="text-4xl text-mute">🏒</span>
          )}
        </div>

        <h1 className="display text-3xl font-bold uppercase tracking-[0.04em] text-ink md:text-4xl">
          {team.full}
        </h1>
      </div>
    </div>
  );
}
