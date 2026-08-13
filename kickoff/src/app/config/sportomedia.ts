/**
 * Sportomedia is the data provider for the Swedish leagues (GraphQL). Query
 * documents and captured sample responses live in
 * docs/endpoints/allssvenskan.md — Superettan uses the same queries with a
 * different `configLeagueName`.
 */

export const SPORTOMEDIA_GQL = 'https://gql.sportomedia.se/graphql';

/** League identifiers in the sportomedia API (`configLeagueName`). */
export const ALLSVENSKAN_LEAGUE_NAME = 'allsvenskan';
export const SUPERETTAN_LEAGUE_NAME = 'superettan';
