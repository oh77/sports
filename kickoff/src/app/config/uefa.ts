/**
 * UEFA's public micro-services power the Champions League data. Endpoints and
 * captured samples live in docs/endpoints/uefa_champions_league_api.md.
 */

export const UEFA_MATCH_API = 'https://match.uefa.com/v5';
export const UEFA_STANDINGS_API = 'https://standings.uefa.com/v1';
export const UEFA_COMPSTATS_API = 'https://compstats.uefa.com/v1';

/** compstats/comp hosts only answer requests carrying this Origin header. */
export const UEFA_ORIGIN = 'https://www.uefa.com';

export const UCL_COMPETITION_ID = '1';
export const UEL_COMPETITION_ID = '14';
export const UECL_COMPETITION_ID = '2019';

/** player-ranking `stats` codes per stats view. */
export const UCL_PLAYER_STATS = {
  goals: 'goals',
  assists: 'assists',
  yellowCards: 'yellow_cards',
  redCards: 'red_cards',
} as const;

export function uefaPlayerPhotoUrl(
  competitionId: string,
  playerId: string,
  seasonYear: string,
): string {
  return `https://img.uefa.com/imgml/TP/players/${competitionId}/${seasonYear}/324x324/${playerId}.jpg`;
}

/** National flag PNG for a UEFA association code, e.g. "ENG" → England. */
export function uefaCountryFlagUrl(code: string): string {
  return `https://img.uefa.com/imgml/flags/70x70/${code}.png`;
}

/**
 * Swedish names for UEFA association codes (3-letter, FIFA/IOC style). Covers
 * the UEFA member nations; anything unmapped falls back to the raw code via
 * {@link uefaCountryName}.
 */
const UEFA_COUNTRY_NAMES_SV: Record<string, string> = {
  ALB: 'Albanien',
  AND: 'Andorra',
  ARM: 'Armenien',
  AUT: 'Österrike',
  AZE: 'Azerbajdzjan',
  BLR: 'Belarus',
  BEL: 'Belgien',
  BIH: 'Bosnien och Hercegovina',
  BUL: 'Bulgarien',
  CRO: 'Kroatien',
  CYP: 'Cypern',
  CZE: 'Tjeckien',
  DEN: 'Danmark',
  ENG: 'England',
  EST: 'Estland',
  FRO: 'Färöarna',
  FIN: 'Finland',
  FRA: 'Frankrike',
  GEO: 'Georgien',
  GER: 'Tyskland',
  GIB: 'Gibraltar',
  GRE: 'Grekland',
  HUN: 'Ungern',
  ISL: 'Island',
  ISR: 'Israel',
  ITA: 'Italien',
  KAZ: 'Kazakstan',
  KOS: 'Kosovo',
  LVA: 'Lettland',
  LIE: 'Liechtenstein',
  LTU: 'Litauen',
  LUX: 'Luxemburg',
  MLT: 'Malta',
  MDA: 'Moldavien',
  MNE: 'Montenegro',
  NED: 'Nederländerna',
  MKD: 'Nordmakedonien',
  NIR: 'Nordirland',
  NOR: 'Norge',
  POL: 'Polen',
  POR: 'Portugal',
  IRL: 'Irland',
  ROU: 'Rumänien',
  RUS: 'Ryssland',
  SMR: 'San Marino',
  SCO: 'Skottland',
  SRB: 'Serbien',
  SVK: 'Slovakien',
  SVN: 'Slovenien',
  ESP: 'Spanien',
  SWE: 'Sverige',
  SUI: 'Schweiz',
  TUR: 'Turkiet',
  UKR: 'Ukraina',
  WAL: 'Wales',
};

/** Swedish country name for a UEFA association code, or the code itself. */
export function uefaCountryName(code: string): string {
  return UEFA_COUNTRY_NAMES_SV[code.toUpperCase()] ?? code;
}
