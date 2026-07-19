/**
 * Map a CHL country code (3-letter, e.g. "swe") to an ISO 3166-1 alpha-2 code
 * (e.g. "SE") for flag-icons. Unknown codes are returned upper-cased as-is.
 */
export function chlCountryToAlpha2(chlCode: string): string {
  const codeMap: Record<string, string> = {
    usa: 'US',
    swe: 'SE',
    can: 'CA',
    fin: 'FI',
    cze: 'CZ',
    svk: 'SK',
    nor: 'NO',
    den: 'DK',
    ger: 'DE',
    sui: 'CH',
    aut: 'AT',
    fra: 'FR',
    ita: 'IT',
    slo: 'SI',
    pol: 'PL',
    gbr: 'GB',
    lat: 'LV',
    hun: 'HU',
    blr: 'BY',
    rus: 'RU',
  };
  return codeMap[chlCode.toLowerCase()] || chlCode.toUpperCase();
}
