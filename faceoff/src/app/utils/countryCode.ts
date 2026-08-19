/**
 * Three-letter country code → ISO 3166-1 alpha-2, for flag rendering
 * (`CountryFlag`, `PlayerCard`).
 *
 * Providers disagree on which three-letter system they use: the CHL feed sends
 * IOC codes (`GER`, `SUI`, `LAT`), while the NHL roster feed sends ISO alpha-3
 * (`DEU`, `CHE`, `LVA`). Both spellings are keyed here so either provider maps
 * correctly; the codes that collide across the two systems (`CAN`, `USA`,
 * `SWE`, `FIN`, `RUS`, `CZE`, `SVK`) mean the same country in both.
 *
 * Unknown codes are returned upper-cased. Both flag components fall back to a
 * text badge for anything that isn't two letters, so an unmapped country
 * degrades to its code rather than breaking.
 */

const ALPHA2_BY_CODE: Record<string, string> = {
  // Shared spelling (ISO alpha-3 === IOC)
  can: 'CA',
  usa: 'US',
  swe: 'SE',
  fin: 'FI',
  rus: 'RU',
  cze: 'CZ',
  svk: 'SK',
  aut: 'AT',
  fra: 'FR',
  ita: 'IT',
  pol: 'PL',
  nor: 'NO',
  gbr: 'GB',
  irl: 'IE',
  isl: 'IS',
  isr: 'IL',
  jpn: 'JP',
  kaz: 'KZ',
  ukr: 'UA',
  est: 'EE',
  ltu: 'LT',
  hun: 'HU',
  blr: 'BY',
  bra: 'BR',
  mex: 'MX',
  arg: 'AR',
  aus: 'AU',
  nzl: 'NZ',
  esp: 'ES',
  jam: 'JM',
  nga: 'NG',
  tur: 'TR',
  lbn: 'LB',
  ind: 'IN',
  sgp: 'SG',
  tha: 'TH',
  vie: 'VN',

  // ISO alpha-3 spellings (NHL roster feed)
  deu: 'DE',
  che: 'CH',
  dnk: 'DK',
  lva: 'LV',
  svn: 'SI',
  nld: 'NL',
  hrv: 'HR',
  srb: 'RS',
  rou: 'RO',
  bgr: 'BG',
  bel: 'BE',
  prt: 'PT',
  grc: 'GR',
  kor: 'KR',
  chn: 'CN',
  twn: 'TW',
  zaf: 'ZA',
  tza: 'TZ',
  guy: 'GY',
  sur: 'SR',
  hti: 'HT',
  ven: 'VE',
  ury: 'UY',
  pry: 'PY',
  col: 'CO',
  chl: 'CL',
  bhs: 'BS',
  tto: 'TT',
  pri: 'PR',
  dom: 'DO',
  idn: 'ID',
  phl: 'PH',
  mys: 'MY',
  mng: 'MN',
  uzb: 'UZ',
  geo: 'GE',
  arm: 'AM',
  aze: 'AZ',
  mda: 'MD',
  mkd: 'MK',
  alb: 'AL',
  bih: 'BA',
  mne: 'ME',
  lux: 'LU',
  vnm: 'VN',

  // IOC-only spellings (CHL feed)
  ger: 'DE',
  sui: 'CH',
  den: 'DK',
  lat: 'LV',
  slo: 'SI',
  ned: 'NL',
  cro: 'HR',
  bul: 'BG',
  gre: 'GR',
  por: 'PT',
  rsa: 'ZA',
  tpe: 'TW',
  phi: 'PH',
  mas: 'MY',
  ina: 'ID',
  pur: 'PR',
  chi: 'CL',
  uae: 'AE',
  ksa: 'SA',
};

/**
 * Map a three-letter country code (ISO alpha-3 or IOC, any case) to its ISO
 * 3166-1 alpha-2 equivalent. Unknown codes are returned upper-cased as-is.
 */
export function countryCodeToAlpha2(code: string): string {
  const key = code.trim().toLowerCase();
  return ALPHA2_BY_CODE[key] || code.trim().toUpperCase();
}
