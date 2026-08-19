import { countryCodeToAlpha2 } from './countryCode';

/**
 * Map a CHL country code (3-letter, e.g. "swe") to an ISO 3166-1 alpha-2 code
 * (e.g. "SE") for flag-icons. Unknown codes are returned upper-cased as-is.
 *
 * Thin alias over the shared {@link countryCodeToAlpha2} map, which also covers
 * the ISO alpha-3 spellings the NHL roster feed uses.
 */
export function chlCountryToAlpha2(chlCode: string): string {
  return countryCodeToAlpha2(chlCode);
}
