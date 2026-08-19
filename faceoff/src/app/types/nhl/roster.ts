/**
 * NHL club-roster API types.
 *
 * Source: https://api-web.nhle.com/v1/roster/{TEAM_CODE}/{SEASON_ID}
 * See `docs/endpoints/nhl-roster.md` for the captured sample and field notes.
 *
 * The roster is the only NHL feed carrying nationality, jersey number, birth
 * data and headshots — the skater/goalie summary feeds have none of it.
 */

/**
 * Localized string map. `default` is always present; the other locale keys
 * (cs, sk, fi, fr, sv, …) appear inconsistently, so only `default` is safe.
 */
export interface NhlLocalizedString {
  default: string;
  [locale: string]: string;
}

export interface NhlRosterPlayer {
  /** playerId — joins to `NhlSkaterSummary.playerId` / `NhlGoalieSummary.playerId`. */
  id: number;
  headshot: string;
  firstName: NhlLocalizedString;
  lastName: NhlLocalizedString;
  /** Absent for players without an assigned number. */
  sweaterNumber?: number;
  /** L | C | R | D | G */
  positionCode: string;
  /** L | R */
  shootsCatches: string;
  heightInInches: number;
  weightInPounds: number;
  heightInCentimeters: number;
  weightInKilograms: number;
  birthDate: string;
  birthCity: NhlLocalizedString;
  /** Three-letter country code (`SWE`, `CAN`, …). Birth country, not federation. */
  birthCountry: string;
  /** North American players only. */
  birthStateProvince?: NhlLocalizedString;
}

export interface NhlRosterResponse {
  forwards: NhlRosterPlayer[];
  defensemen: NhlRosterPlayer[];
  goalies: NhlRosterPlayer[];
}
