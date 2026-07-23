import type { TeamInfo } from '../types/domain/team';

/**
 * The 32 NHL clubs as domain `TeamInfo`. Kept static (rather than derived from
 * standings/schedule) so the footer renders every club regardless of season or
 * whether any games/standings data is available yet.
 *
 * Logos follow `…/svg/<CODE>_light.svg`, except where the NHL serves a variant.
 */

const LOGO_BASE = 'https://assets.nhle.com/logos/nhl/svg';

/** Logo file stem per team; defaults to the abbrev, overridden for variants. */
const LOGO_STEM: Record<string, string> = {
  WSH: 'WSH_secondary',
};

function teamLogo(code: string): string {
  return `${LOGO_BASE}/${LOGO_STEM[code] ?? code}_light.svg`;
}

const CLUBS: { code: string; place: string; name: string }[] = [
  { code: 'ANA', place: 'Anaheim', name: 'Ducks' },
  { code: 'BOS', place: 'Boston', name: 'Bruins' },
  { code: 'BUF', place: 'Buffalo', name: 'Sabres' },
  { code: 'CGY', place: 'Calgary', name: 'Flames' },
  { code: 'CAR', place: 'Carolina', name: 'Hurricanes' },
  { code: 'CHI', place: 'Chicago', name: 'Blackhawks' },
  { code: 'COL', place: 'Colorado', name: 'Avalanche' },
  { code: 'CBJ', place: 'Columbus', name: 'Blue Jackets' },
  { code: 'DAL', place: 'Dallas', name: 'Stars' },
  { code: 'DET', place: 'Detroit', name: 'Red Wings' },
  { code: 'EDM', place: 'Edmonton', name: 'Oilers' },
  { code: 'FLA', place: 'Florida', name: 'Panthers' },
  { code: 'LAK', place: 'Los Angeles', name: 'Kings' },
  { code: 'MIN', place: 'Minnesota', name: 'Wild' },
  { code: 'MTL', place: 'Montréal', name: 'Canadiens' },
  { code: 'NSH', place: 'Nashville', name: 'Predators' },
  { code: 'NJD', place: 'New Jersey', name: 'Devils' },
  { code: 'NYI', place: 'New York', name: 'Islanders' },
  { code: 'NYR', place: 'New York', name: 'Rangers' },
  { code: 'OTT', place: 'Ottawa', name: 'Senators' },
  { code: 'PHI', place: 'Philadelphia', name: 'Flyers' },
  { code: 'PIT', place: 'Pittsburgh', name: 'Penguins' },
  { code: 'SJS', place: 'San Jose', name: 'Sharks' },
  { code: 'SEA', place: 'Seattle', name: 'Kraken' },
  { code: 'STL', place: 'St. Louis', name: 'Blues' },
  { code: 'TBL', place: 'Tampa Bay', name: 'Lightning' },
  { code: 'TOR', place: 'Toronto', name: 'Maple Leafs' },
  { code: 'UTA', place: 'Utah', name: 'Mammoth' },
  { code: 'VAN', place: 'Vancouver', name: 'Canucks' },
  { code: 'VGK', place: 'Vegas', name: 'Golden Knights' },
  { code: 'WSH', place: 'Washington', name: 'Capitals' },
  { code: 'WPG', place: 'Winnipeg', name: 'Jets' },
];

export const NHL_TEAMS: TeamInfo[] = CLUBS.map(({ code, place, name }) => ({
  code,
  externalId: code,
  short: name,
  long: `${place} ${name}`,
  full: `${place} ${name}`,
  logo: teamLogo(code),
}));
