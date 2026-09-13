# Gameday

Upcoming football and hockey games, favorite teams and a calendar feed — built on top of the sibling apps `kickoff` (football) and `faceoff` (hockey).

## Running locally

```bash
cd gameday && yarn install && yarn dev:all
```

This starts all three apps (install dependencies in `kickoff/` and `faceoff/` first) and points gameday at the local siblings:

| App     | URL                   |
| ------- | --------------------- |
| gameday | http://localhost:3000 |
| kickoff | http://localhost:3001 |
| faceoff | http://localhost:3002 |

`Ctrl+C` stops all of them. Plain `yarn dev` runs gameday alone.

Point at deployed siblings instead by copying `.env.example` to `.env.local` and setting `KICKOFF_BASE_URL` / `FACEOFF_BASE_URL`.

## Favorites

Edit `src/app/config/favorites.ts`. A team's code is the last path segment of its team page in kickoff/faceoff, e.g. `/allsvenskan/2026/mff` → `mff`.

## Calendar

`/calendar.ics` serves the favorites' games from a week back to 14 days ahead. Subscribe from the **Favoriter** page, or manually:

- **Google Calendar:** Other calendars → + → From URL → paste `https://<host>/calendar.ics`
- **Outlook:** Add calendar → Subscribe from web → paste `https://<host>/calendar.ics`

Both services fetch the feed from their own servers, so the app must be deployed on a public URL (e.g. Vercel) for subscriptions to work.
