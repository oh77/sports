import type { League } from '@/app/types/domain/league';

/**
 * NHL-style broadcast theme tokens.
 *
 * These mirror the CSS variables in globals.css so that JS-driven inline
 * styles (dynamic colours, gradients, per-team accents) stay in sync with the
 * Tailwind utility classes (`bg-surface`, `text-dim`, `text-accent`, …).
 */
export const nhl = {
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
  otl: '#e0a313',
  loss: '#d2433a',
} as const;

/** Per-league electric accent, applied via the `--accent` CSS variable. */
export const leagueAccent: Record<League, string> = {
  shl: '#2f7bf6', // electric blue
  sdhl: '#2dd4bf', // teal
  ha: '#6366f1', // indigo
  chl: '#3b82f6', // blue
};

/** Display name + logo for each league (used by the top nav and footers). */
export const leagueMeta: Record<League, { name: string; logo: string }> = {
  shl: {
    name: 'SHL',
    logo: 'https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg',
  },
  sdhl: {
    name: 'SDHL',
    logo: 'https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg',
  },
  ha: {
    name: 'HA',
    logo: 'https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg',
  },
  chl: {
    name: 'CHL',
    logo: 'https://www.chl.hockey/static/img/logo.png',
  },
};

export type ResultKind = 'win' | 'otw' | 'otl' | 'loss';

/** Background colour for a W / OTL / L form chip. */
export function resultColor(kind: ResultKind): string {
  switch (kind) {
    case 'win':
      return nhl.win;
    case 'otw':
      return '#15803d'; // darker green for OT wins
    case 'otl':
      return nhl.otl;
    case 'loss':
      return nhl.loss;
  }
}

/** Single-letter label for a form chip (Swedish). */
export function resultLetter(kind: ResultKind): string {
  switch (kind) {
    case 'win':
      return 'V';
    case 'otw':
      return 'ÖV';
    case 'otl':
      return 'ÖF';
    case 'loss':
      return 'F';
  }
}
