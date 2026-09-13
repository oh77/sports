export interface Team {
  /** Team code in its league — the value to use in `config/favorites.ts`. */
  code: string;
  /** Full display name, e.g. "Malmö FF". */
  name: string;
  /** Absolute logo URL, when the source provides one. */
  logo?: string;
}
