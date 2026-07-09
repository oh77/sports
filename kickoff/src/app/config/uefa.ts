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

/** player-ranking `stats` codes per stats view. */
export const UCL_PLAYER_STATS = {
  goals: 'goals',
  assists: 'assists',
  yellowCards: 'yellow_cards',
  redCards: 'red_cards',
} as const;

export function uclPlayerPhotoUrl(
  playerId: string,
  seasonYear: string,
): string {
  return `https://img.uefa.com/imgml/TP/players/1/${seasonYear}/324x324/${playerId}.jpg`;
}
