import type { League, Sport } from '@/app/types/domain/league';

export type LeagueMeta = {
  name: string;
  /** Compact label, e.g. the `[SDHL]` prefix on calendar events. */
  shortName: string;
  sport: Sport;
  /** Row accent, matching the league's accent in kickoff/faceoff. */
  accent: string;
  logo: string;
  /** Background behind the logo chip. */
  chipBg: string;
};

const LIGHT_CHIP = 'rgba(255,255,255,0.9)';

/** Display order: Swedish leagues first, then international. */
export const LEAGUES: Record<League, LeagueMeta> = {
  allsvenskan: {
    name: 'Allsvenskan',
    shortName: 'Allsvenskan',
    sport: 'football',
    accent: '#facc15',
    logo: 'https://allsvenskan.se/wp-content/themes/sef-leagues/images/allsvenskan/allsvenskan-logo.svg',
    chipBg: LIGHT_CHIP,
  },
  superettan: {
    name: 'Superettan',
    shortName: 'Superettan',
    sport: 'football',
    accent: '#2f9e5e',
    logo: 'https://superettan.se/wp-content/themes/sef-leagues/images/superettan/SE2026.png',
    chipBg: LIGHT_CHIP,
  },
  shl: {
    name: 'SHL',
    shortName: 'SHL',
    sport: 'hockey',
    accent: '#2f7bf6',
    logo: 'https://sportality.cdn.s8y.se/team-logos/shl1_shl.svg',
    chipBg: 'rgba(24,29,38,1)',
  },
  sdhl: {
    name: 'SDHL',
    shortName: 'SDHL',
    sport: 'hockey',
    accent: '#2dd4bf',
    logo: 'https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg',
    chipBg: 'rgba(50,0,208,1)',
  },
  ha: {
    name: 'HockeyAllsvenskan',
    shortName: 'HA',
    sport: 'hockey',
    accent: '#6366f1',
    logo: 'https://sportality.cdn.s8y.se/team-logos/ha1_ha.svg',
    chipBg: 'rgba(30,41,59,1)',
  },
  pl: {
    name: 'Premier League',
    shortName: 'PL',
    sport: 'football',
    accent: '#a78bfa',
    logo: '/assets/PL_LOGO_COMPACT_DARK_RGB.png',
    chipBg: LIGHT_CHIP,
  },
  cl: {
    name: 'Champions League',
    shortName: 'CL',
    sport: 'football',
    accent: '#3b82f6',
    logo: 'https://img.uefa.com/imgml/uefacom/elements/logos/competitions/color/full/1.svg',
    chipBg: LIGHT_CHIP,
  },
  el: {
    name: 'Europa League',
    shortName: 'EL',
    sport: 'football',
    accent: '#f97316',
    logo: '/assets/europa-league-logo.svg',
    chipBg: LIGHT_CHIP,
  },
  col: {
    name: 'Conference League',
    shortName: 'ECL',
    sport: 'football',
    accent: '#34d399',
    logo: '/assets/conference-league-logo.svg',
    chipBg: LIGHT_CHIP,
  },
  nl: {
    name: 'Nations League',
    shortName: 'UNL',
    sport: 'football',
    accent: '#22d3ee',
    logo: 'https://img.uefa.com/imgml/uefacom/elements/logos/competitions/color/full/2014.svg',
    chipBg: LIGHT_CHIP,
  },
  chl: {
    name: 'Champions Hockey League',
    shortName: 'CHL',
    sport: 'hockey',
    accent: '#3b82f6',
    logo: 'https://www.chl.hockey/static/img/logo.png',
    chipBg: '#20001c',
  },
  nhl: {
    name: 'NHL',
    shortName: 'NHL',
    sport: 'hockey',
    accent: '#e5352b',
    logo: 'https://assets.nhle.com/logos/nhl/svg/NHL_light.svg',
    chipBg: 'rgba(17,19,25,1)',
  },
};

export function isLeague(value: string): value is League {
  return Object.hasOwn(LEAGUES, value);
}
