# Gameday - Project Context for AI Assistants

## Project Overview
Gameday is a cross-sport overview: upcoming football and hockey games for the next few days, a static list of favorite teams, and a subscribable calendar (`.ics`) of the favorites' games for Google Calendar and Outlook.

It lives in the `gameday/` folder of the repo as a **standalone application** next to `kickoff/` (football) and `faceoff/` (hockey). It does **not** talk to sports providers itself — it reads schedules from the two sibling apps over HTTP.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, Biome + ESLint, Yarn
**Language:** Swedish (`lang="sv"`)

## Data Flow

```
kickoff  GET /api/games-window?from&to ─┐
faceoff  GET /api/games-window?from&to ─┴→ scheduleService → upstreamToDomain → pages / calendar.ics
```

- `games-window` returns `{ from, to, games: { league, game }[] }` — every game whose start falls on a Swedish calendar day in `from..to` (inclusive), in each app's own domain shape (kickoff `MatchInfo`, faceoff `GameInfo`). Max span 120 days.
- `src/app/types/upstream/games-window.ts` declares only the fields gameday reads; `utils/translators/upstreamToDomain.ts` maps them into gameday's contract (`types/domain/`). Components never import upstream types.
- Upstream base URLs: `KICKOFF_BASE_URL`, `FACEOFF_BASE_URL` (see `.env.example`), read per request via `upstreamBaseUrl()`. Locally they default to `localhost:3001` / `:3002`; on Vercel (`VERCEL` set) a missing variable throws, which surfaces as that sport failing plus a log line naming the variable.
- `games-window` also takes an optional `league` — a single league, answering 502 when that league's provider fails. The home page uses it: `components/live-schedule` (client) fetches every league in parallel from gameday's `GET /api/games?league&from&to` and merges each into the list as it arrives, with a status chip per league (`components/league-progress`) and new rows animated in. `/favorites` and `/calendar.ics` still use `getSchedule()` (one request per sport).
- A failing upstream is reported per sport (`Schedule.failed`), never fatal for pages. `/calendar.ics` returns 502 instead, so subscribers keep their previous copy rather than losing a sport's events.

## Project Structure

```
src/app/
├── page.tsx                  # Kommande matcher: today + 2 days, ?show=favorites filter, loads per league
├── api/games/route.ts        # one league's games for the browser (proxies games-window?league=)
├── favorites/page.tsx        # favorites list, calendar subscribe links, next 14 days
├── teams/page.tsx            # all teams per league with their codes (GET /api/teams in kickoff/faceoff)
├── calendar.ics/route.ts     # iCalendar feed of favorites' games (-7 .. +14 days)
├── components/               # folder per component, index.tsx
├── config/
│   ├── favorites.ts          # THE favorites list (static)
│   ├── leagues.ts            # league meta: name, sport, accent, logo
│   └── upstreams.ts          # sibling app base URLs per sport
├── services/scheduleService.ts
├── types/{domain,upstream}/
└── utils/                    # dateUtils (Europe/Stockholm), favorites, ics, translators/
```

## Favorites
`config/favorites.ts` — each team has a code per league, matched case-insensitively against the game's team code. The code is the `[teamCode]` URL segment on the team's page in kickoff/faceoff. Cup competitions (CL/EL/CHL) often use a different code than the domestic league.

## Calendar feed
- RFC 5545, UTC times (no VTIMEZONE), CRLF, lines folded at 75 octets, stable `UID` per game so clients update in place.
- Google Calendar and Outlook fetch the feed server-side, so subscriptions only work on a public deployment. Google refreshes on its own schedule (often several hours); `REFRESH-INTERVAL` is a hint.

## Code Conventions
- Server Components by default; `'use client'` only when needed
- No `any` types — TypeScript strict
- Tailwind utility-first, mobile-first; same broadcast theme tokens as kickoff/faceoff
- Accessibility: `<main>` landmarks, labelled sections, `aria-current` on nav, no color-only indicators (favorite star has sr-only text)

## Commands

```bash
yarn dev             # Dev server (Turbopack)
yarn build           # Production build
yarn lint            # Biome lint
yarn biome:fix       # Biome check --write (format + lint + organize imports)
yarn eslint          # ESLint
```

Local end-to-end: `yarn dev:all` runs gameday (:3000), kickoff (:3001) and faceoff (:3002) via `concurrently`, with the upstream URLs forced to the local apps (process env overrides any `.env.local`).
