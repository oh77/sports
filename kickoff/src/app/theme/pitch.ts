import type { League } from '@/app/types/domain/league';

/**
 * Broadcast theme tokens for the football app.
 *
 * These mirror the CSS variables in globals.css so that JS-driven inline
 * styles (dynamic colours, gradients, per-team accents) stay in sync with the
 * Tailwind utility classes (`bg-surface`, `text-dim`, `text-accent`, …).
 */
export const pitch = {
  bg: '#0b0e13',
  surface: '#12161c',
  surface2: '#0e1218',
  surface3: '#1a202a',
  line: '#20262f',
  lineStrong: '#232a34',
  lineSoft: '#1a2029',
  text: '#f4f6f9',
  textSoft: '#cdd4de',
  textDim: '#8b95a4',
  textMute: '#5f6875',
  win: '#1f9d57',
  draw: '#e0a313',
  loss: '#d2433a',
} as const;

/** Per-league electric accent, applied via the `--accent` CSS variable. */
export const leagueAccent: Record<League, string> = {
  allsvenskan: '#facc15', // Allsvenskan yellow (on blue-dark surfaces)
  pl: '#a78bfa', // Premier League purple
  cl: '#3b82f6', // Champions League blue
};

/**
 * Display name, abbreviation and logo for each league (top nav, league chips,
 * cards). `logo` URLs come from the endpoint docs. `logoOnDark` marks logos
 * drawn for dark surfaces (rendered directly on the theme background);
 * others get a light chip behind them.
 */
export const leagueMeta: Record<
  League,
  { name: string; short: string; logo?: string; logoOnDark?: boolean }
> = {
  allsvenskan: {
    name: 'Allsvenskan',
    short: 'ALL',
    logo: 'https://allsvenskan.se/wp-content/themes/sef-leagues/images/allsvenskan/allsvenskan-logo.svg',
  },
  pl: {
    name: 'Premier League',
    short: 'PL',
    logo: 'https://www.premierleague.com/resources/v1.48.1-21/i/svg-files/elements/pl-logo-dark.svg',
    logoOnDark: true,
  },
  cl: {
    name: 'Champions League',
    short: 'CL',
    logo: 'https://img.uefa.com/imgml/uefacom/elements/logos/competitions/color/full/1.svg',
  },
};

export type ResultKind = 'win' | 'draw' | 'loss';

/** Background colour for a W / D / L form chip. */
export function resultColor(kind: ResultKind): string {
  switch (kind) {
    case 'win':
      return pitch.win;
    case 'draw':
      return pitch.draw;
    case 'loss':
      return pitch.loss;
  }
}
