# Prompt: Build "Matchday" — a football version of Gameday

Copy everything below into Claude Code in the new (empty) repo.

---

I want to build a football (soccer) web application modeled on an existing ice hockey project of mine called **Gameday**. Same architecture, same philosophy — different sport and different leagues. Build it step by step in the order below, and **stop at the checkpoints to ask me for API endpoints and response contracts** — I will provide those; never invent or guess external API URLs or response shapes.

## What we're building

A Next.js web app showing schedules, standings, and player statistics for three football leagues:

- **Allsvenskan** (Sweden) — slug `allsvenskan`
- **Premier League** (England) — slug `pl`
- **Champions League** (UEFA) — slug `cl`

UI language is **Swedish** (`lang="sv"`).

## Tech stack (match the original project)

- Next.js 15+ (App Router, Turbopack in dev), React 19, TypeScript **strict** (no `any`)
- Tailwind CSS 4 (PostCSS)
- Biome for lint/format (plus ESLint with the Next.js config)
- Vercel Analytics + Speed Insights
- Yarn
- Server Components by default; `'use client'` only where interactivity requires it

## Core architectural rule: the application contract

This is the most important constraint. There is **one internal domain contract** (TypeScript types under `src/app/types/domain/`) that is shared by all view models and frontend components. Every external API — regardless of provider — must be translated into this contract by a dedicated translator before it reaches an API route or a page. Components never import provider-specific types.

Data flow, per league:

```
External API → service (fetch + cache) → translator (provider types → domain types)
             → Next.js API route → server component pages → shared UI components
```

Directory layout to follow:

```
src/app/
├── api/                      # e.g. /api/pl-matches, /api/allsvenskan-standings, /api/cache/*
├── components/               # shared, league-agnostic UI (folder per component, index.tsx)
├── config/                   # league + season config (see Seasons below)
├── services/                 # one service per external provider
├── types/
│   ├── domain/               # THE application contract
│   └── <provider>/           # raw API types, one folder per provider
├── utils/
│   ├── cache.ts              # in-memory TTL cache
│   └── translators/          # <provider>ToDomain.ts
└── [league]/[season]/        # league pages: overview, standings/, stats/, [teamCode]/
```

## Domain contract (football flavor)

Design these in `src/app/types/domain/` first, before any UI or integration work:

- `league.ts` — `type League = 'allsvenskan' | 'pl' | 'cl'`
- `match.ts` — `MatchInfo`: uuid, startDateTime (ISO), state (`'not-started' | 'live' | 'finished'`), home/away `{ teamInfo, score }`, venue, round/matchday, and knockout-only optionals: `extraTime?`, `penalties?` (with penalty score). No hockey concepts (no overtime/shootout in the league sense).
- `team.ts` — `TeamInfo`: uuid, code (URL-safe slug), names (long/short), logo/media reference.
- `standings.ts` — football table: Rank, GP, W, **D**, L, GF, GA, **GD**, Points, plus `info: TeamInfo`. Support zone markers (title/CL qualification/relegation) as data, and support the CL league-phase/group format. Keep the `dataColumns` pattern from Gameday (column metadata drives table rendering) so tables stay generic.
- `player-stats.ts` — outfield stats: GP, goals, assists, **yellow cards, red cards**, minutes played (if available), penalties scored (optional). Plus `PlayerInfo` (name, nationality, position, shirt number, photo, team ref).
- `keeper-stats.ts` — goalkeeper stats: GP, clean sheets, goals conceded, saves/save % where available.

Design the contract for what the **UI needs**, not for what any particular API returns — the translators absorb the mismatch. Optional fields are fine where providers differ.

## Seasons (must-have from day one)

Follow Gameday's pattern: a config file in `src/app/config/` with

- per-league constants that don't change across seasons (provider, external league/competition ids)
- a `SeasonConfig[]` array where each entry has a URL-facing `key`, per-league external season ids, and exactly one entry marked `current: true`
- `resolveSeason(key?)` that falls back to the current season for missing/unknown keys

Note the football wrinkle: **Allsvenskan is a calendar-year season (e.g. "2026") while PL and CL run across years (e.g. "25-26")** — season keys are per-league display strings, so make the config express both formats. Routes are `/[league]/[season]/...`, and a `SeasonSwitcher` component lets the user change season while staying on the equivalent page.

## Caching

Copy Gameday's approach: a Node `Map`-based TTL cache in `src/app/utils/cache.ts` (5 min for matches, 15 min for standings/stats), used inside the services, with `/api/cache/inspect` and `/api/cache/clear` endpoints and a small `/cache` page for debugging.

## Pages & components

- **Landing page `/`**: combined upcoming-matches table across all three leagues (at least the next 3 match days' worth), links into each league.
- **League page `/[league]/[season]`**: today's/live matches, previous matchday results, upcoming matches, compact standings, top scorers preview.
- **Standings `/[league]/[season]/standings`**: full table with zone markers and 5-match form/trend indicators (W/D/L markers — with text alternatives, not color-only).
- **Stats `/[league]/[season]/stats`**: top scorers, top assists, cards, keeper stats — tab-navigated.
- **Team page `/[league]/[season]/[teamCode]`**: next match countdown, previous matches, head-to-head vs opponents, form.

Shared components should be league-agnostic and take domain types as props. Dark theme with a distinct accent color per league (pick tasteful ones; Allsvenskan blue/yellow, PL purple, CL dark blue). Mobile-first responsive. Accessibility from the start: `<main>` landmarks, table `<caption>`s, ARIA tabs, `alt`/`aria-hidden` on decorative images, no color-only indicators.

## Step-by-step plan (follow in order)

1. **Scaffold**: `create-next-app` (TypeScript, App Router, Tailwind), add Biome, analytics, strict tsconfig. Set up yarn scripts (`dev`, `build`, `lint`, `lint:fix`, `eslint`). Create a `CLAUDE.md` documenting the architecture rules above (especially the domain-contract rule and the ask-for-endpoint protocol).
2. **Domain contract**: implement all `types/domain/` files. Get my sign-off on the contract before building anything on top of it.
3. **Config & utilities**: league/season config with `resolveSeason`, cache util, date utils (Swedish formatting, Europe/Stockholm).
4. **UI shell with fixture data**: layout, top nav, league shells/theming, and the shared components (match list, standings table, stats tables, tabs, season switcher) driven by hard-coded fixture data in the domain contract. This proves the contract before any API work.
5. **League integrations, one league at a time** (Allsvenskan → PL → CL). For each league, and for each data type (matches, standings, player stats, keeper stats), **stop and ask me** before implementing — see protocol below. Then: raw types in `types/<provider>/` → service with caching → translator → API routes → wire the pages. Finish one league fully before starting the next.
6. **Landing page**: combined upcoming matches across leagues once at least two leagues have live data.
7. **Polish**: cache debug pages, error/loading states, accessibility pass, metadata/OG tags.

## Checkpoint protocol: asking me for APIs

You do not have the external APIs — I do. Whenever you reach a point where you need external data (step 5, per league and per data type), pause and ask me for:

1. The **endpoint URL(s)** and any required headers/auth/query params
2. A **sample JSON response** or schema (the contract)
3. Which fields map to what, if it's not obvious
4. Sensible **refresh cadence** if it differs from the default TTLs

Ask for one league (or one data type) at a time, right before you implement it — not all upfront. Until I provide an API for something, keep that part of the UI running on fixture data. Never fabricate endpoint URLs, never scrape, and never guess response shapes.

## Verification rules

- After each step: `npx tsc --noEmit`, `yarn lint`, and `yarn build` must pass.
- **Do not start the dev server or run browser tests yourself** — I handle runtime verification manually and will report back.
- No test framework for now; TypeScript + Biome + build are the quality gates.

Start with step 1 and check in with me at the end of each numbered step.
