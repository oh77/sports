/**
 * Domain roster model — a club's players for a season, normalized away from any
 * provider shape. Currently produced from the NHL roster feed; other leagues
 * can translate into the same contract.
 */
export interface RosterPlayer {
  /** Provider player id as a string (matches `PlayerInfo.uuid`). */
  uuid: string;
  fullName: string;
  firstName: string;
  lastName: string;
  /** Jersey number, or null when the club has not assigned one. */
  number: number | null;
  /** Position code: L | C | R | D | G */
  position: string;
  shoots: string | null;
  /** ISO 3166-1 alpha-2 country code when mappable, else the raw source code. */
  nationality: string;
  /** Raw country code as delivered by the provider (e.g. "SWE"). */
  nationalityCode: string;
  birthDate: string;
  birthCity: string;
  /** Headshot URL, empty when the provider serves none. */
  headshot: string;
  heightCm: number;
  weightKg: number;
  /** Club the player is rostered with. */
  teamCode: string;
}

export interface RosterData {
  /** Set when the roster is scoped to a single club. */
  teamCode?: string;
  players: RosterPlayer[];
}
