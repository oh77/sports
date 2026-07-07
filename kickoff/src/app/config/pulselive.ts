/**
 * Pulselive is the Premier League's data provider. Endpoints and captured
 * sample responses live in docs/endpoints/premierleague.md.
 */

export const PULSELIVE_API =
  'https://sdp-prem-prod.premier-league-prod.pulselive.com/api';

export const PL_COMPETITION_ID = '8';

/** A Premier League season has 38 matchweeks. */
export const PL_MATCHWEEKS = 38;

export function plBadgeUrl(teamId: string): string {
  return `https://resources.premierleague.com/premierleague25/badges/${teamId}.svg`;
}

/** Leaderboard `_sort` keys per stats view (from the endpoint docs). */
export const PL_PLAYER_SORT = {
  goals: 'goals',
  assists: 'assists',
  cards: 'yellow_cards',
} as const;
