# UEFA Champions League — API Endpoints & JSON Responses

Reverse‑engineered from **https://www.uefa.com/uefachampionsleague/** and its data hosts.
Captured live on **2026‑07‑08**. All examples use the **2025/26 season** (`seasonYear=2026`) and **UEFA Champions League** (`competitionId=1`).

> The public uefa.com pages are a client‑rendered Next.js app. The real data comes from a set of JSON micro‑service hosts (`match.uefa.com`, `standings.uefa.com`, `matchstats.uefa.com`, `comp.uefa.com`, `compstats.uefa.com`). All are plain HTTP `GET`, return JSON, and take no auth token.

## Competition IDs (the `competitionId` param)

| Competition | ID |
|---|---|
| UEFA Champions League | `1` |
| UEFA Europa League | `14` |
| UEFA Europa Conference League | `2019` |
| UEFA Nations League | `3` |

`seasonYear` is the year the season **ends** (2025/26 → `2026`).

> **App usage:** the same hosts serve the **Conference League** (`col` league, `competitionId=2019`) — the app runs both through `uefaService`/`uefaToDomain`, switching only the competition id (confirmed against a `seasonYear=2027` sample for the 2026/27 season).

## Host quick‑reference

| Data | Base URL | Server‑side fetch* |
|---|---|---|
| Matches / fixtures & results | `https://match.uefa.com/v5/matches` | ✅ works |
| Livescore (live + ±1h window) | `https://match.uefa.com/v5/livescore` | ✅ works |
| Match events (goals, cards, subs) | `https://match.uefa.com/v5/matches/{matchId}/events` | ✅ works |
| Match lineups | `https://match.uefa.com/v5/matches/{matchId}/lineups` | ✅ works |
| Standings / league table | `https://standings.uefa.com/v1/standings` | ✅ works |
| Team match statistics | `https://matchstats.uefa.com/v1/team-statistics/{matchId}` | ✅ works |
| Player ranking (goals/assists/cards leaderboards) | `https://compstats.uefa.com/v1/player-ranking` | ⚠️ Origin‑locked |
| Players list | `https://comp.uefa.com/v2/players` | ⚠️ Origin‑locked |
| Teams list | `https://comp.uefa.com/v2/teams` | ⚠️ Origin‑locked |
| Competitions | `https://comp.uefa.com/v2/competitions` | ⚠️ Origin‑locked |

\* "Origin‑locked" = the host only answers requests carrying a browser `Origin: https://www.uefa.com` header, so a plain server/`curl` request comes back empty. In a real browser (or by sending that `Origin`/`Referer` header) they return normal JSON.

---

## 1. Games — upcoming & played (with results)

### Endpoint
```
GET https://match.uefa.com/v5/matches
    ?competitionId=1
    &seasonYear=2026
    &phase=ALL            # ALL | TOURNAMENT | QUALIFYING
    &limit=10             # page size
    &offset=0             # page offset
    &order=ASC            # ASC | DESC (by kickoff)
```
Optional filters: `groupId`, `opponentTeamIds` (array), or `matchId` (array — returns those exact matches, ignores paging).

Returns an **array of match objects**. A `status` of `UPCOMING` / `LIVE` / `FINISHED` distinguishes fixtures from results; `score` is present once played.

> **Other observed `status` values:** `ABANDONED` — a void/awarded qualifying tie (e.g. a walkover never actually played) that still carries an awarded `score`. It is a decided result, not a live match. The translator (`statusToState`) treats `ABANDONED` as finished and maps any *other* unrecognised status by data (has a `score` ⇒ finished, else not-started) rather than defaulting to live.
>
> **Identifying the final:** use `round.mode === "FINAL"` (machine-readable) rather than the localizable `round.metaData.name`. The domain model carries this as `MatchInfo.isFinal`, and `seasonChampion` keys the UEFA champion off it.

### Sample response (one match, trimmed — the 2026 final)
```json
[{
  "id": "2047742",
  "status": "FINISHED",
  "competitionPhase": "TOURNAMENT",
  "kickOffTime": { "date": "2026-05-30", "dateTime": "2026-05-30T16:00:00Z", "utcOffsetInHours": 2 },
  "fullTimeAt": "2026-05-30T19:00:24.003Z",
  "matchAttendance": 61035,
  "homeTeam": {
    "id": "52747", "teamCode": "PSG", "internationalName": "Paris",
    "countryCode": "FRA",
    "logoUrl": "https://img.uefa.com/imgml/TP/teams/logos/70x70/52747.png",
    "mediumLogoUrl": "https://img.uefa.com/imgml/TP/teams/logos/240x240/52747.png",
    "bigLogoUrl": "https://img.uefa.com/imgml/TP/teams/logos/700x700/52747.png",
    "translations": { "displayOfficialName": { "EN": "Paris Saint-Germain" } }
  },
  "awayTeam": {
    "id": "52280", "teamCode": "ARS", "internationalName": "Arsenal",
    "countryCode": "ENG",
    "logoUrl": "https://img.uefa.com/imgml/TP/teams/logos/70x70/52280.png"
  },
  "score": {
    "regular": { "home": 1, "away": 1 },
    "penalty": { "home": 4, "away": 3 },
    "total":   { "home": 1, "away": 1 }
  },
  "winner": { "match": { "reason": "WIN_ON_PENALTIES", "team": { "id": "52747" } } },
  "matchday": { "id": "36271", "name": "MD17", "longName": "Matchday 17", "phase": "TOURNAMENT" },
  "round": { "id": "2002115", "metaData": { "name": "Final", "type": "FINAL" }, "mode": "FINAL" },
  "stadium": { "id": "250004078", "capacity": 65014,
    "translations": { "officialName": { "EN": "Puskás Aréna" } },
    "city": { "translations": { "name": { "EN": "Budapest" } }, "countryCode": "HUN" } },
  "playerEvents": {
    "scorers": [ { "goalType": "SCORED", "phase": "FIRST_HALF",
      "player": { "id": "250087938", "internationalName": "Kai Havertz" },
      "teamId": "52280", "time": { "minute": 6, "second": 4 } } ],
    "penaltyScorers": [ { "penaltyType": "SCORED",
      "player": { "id": "250116654", "internationalName": "Gonçalo Ramos" }, "teamId": "52747" } ]
  },
  "playerOfTheMatch": { "player": { "id": "250101444", "internationalName": "Vitinha" }, "teamId": "52747" },
  "referees": [ { "role": "REFEREE", "person": { "id": "250014712",
      "translations": { "name": { "EN": "Daniel Siebert" } } } } ]
}]
```

### Key fields
- **Fixture vs result:** `status` (`UPCOMING`/`LIVE`/`FINISHED`), `kickOffTime.dateTime`, `fullTimeAt`.
- **Result:** `score.regular` / `score.penalty` / `score.total`, plus `winner.match.reason` (`WIN_REGULAR`, `WIN_ON_PENALTIES`, `WIN_ON_EXTRA_TIME`, `DRAW`, …).
- **Round/stage:** `round.metaData.name` (`Final`, `Semi-finals`, `League phase`…), `matchday.name`.
- **Goals in‑line:** `playerEvents.scorers[]` and `playerEvents.penaltyScorers[]` (with player, team, minute).
- Every team & player object carries ready‑made image URLs (see §5).

### Two-legged ties (verified via a captured R16 second leg, LIV–PSG 2025)
- `type`: `FIRST_LEG` / `SECOND_LEG` (absent for one-off matches); also `leg.number`.
- `score.aggregate` — the tie total, **backfilled onto both legs** once the tie is decided.
- `score.penalty` — only present on the leg where the shoot-out actually happened.
- `winner.match.reason` describes that leg only (can be `WIN_REGULAR` even when the tie went to penalties); `winner.aggregate.reason` describes the tie (`WIN_ON_PENALTIES` etc.) and is also backfilled onto the first leg — only trust it on the deciding leg.

### Livescore variant
```
GET https://match.uefa.com/v5/livescore
```
No params. Returns currently‑live matches plus those finishing in the last hour / starting in the next hour — lightweight objects (`id`, `status`, `score`, `winner`, `hash`). Good for polling.

---

## 2. Standings / league table

### Endpoint
```
GET https://standings.uefa.com/v1/standings
    ?competitionId=1
    &seasonYear=2026
    &phase=TOURNAMENT     # TOURNAMENT | QUALIFYING
```
Optional: `roundId`, `groupIds` (array). For the new 36‑team single league phase there is one group; classic group stages / knockout mini‑tables return multiple.

Returns an **array of group objects**, each with an `items[]` array of ranked team rows.

### Response shape (real field names, one row abbreviated)
```json
[{
  "group": {
    "id": "<groupId>",
    "competitionId": "1",
    "phase": "TOURNAMENT",
    "roundId": "<roundId>",
    "seasonYear": "2026",
    "teamsQualifiedNumber": 8,
    "translations": { "name": { "EN": "League phase" } }
  },
  "items": [
    {
      "rank": 1,
      "previousRank": 1,
      "rankTrend": "SAME",
      "played": 8, "won": 7, "drawn": 1, "lost": 0,
      "goalsFor": 20, "goalsAgainst": 6, "goalDifference": 14,
      "goalsForHome": 11, "goalsForAway": 9,
      "points": 22,
      "rankingCoefficient": 0,
      "qualified": true, "isQualifying": true, "isLive": false, "isTied": false,
      "team": {
        "id": "52280", "teamCode": "ARS", "internationalName": "Arsenal",
        "countryCode": "ENG",
        "logoUrl": "https://img.uefa.com/imgml/TP/teams/logos/70x70/52280.png",
        "mediumLogoUrl": "https://img.uefa.com/imgml/TP/teams/logos/240x240/52280.png",
        "bigLogoUrl": "https://img.uefa.com/imgml/TP/teams/logos/700x700/52280.png"
      }
    }
  ]
}]
```
> Note: numeric values above are illustrative placeholders; the field names, nesting and team block are exactly as returned. Full `items[]` field set: `rank`, `previousRank`, `rankTrend`, `played`, `won`, `drawn`, `lost`, `wonHome/wonAway`, `lostHome/lostAway`, `goalsFor`, `goalsAgainst`, `goalDifference`, `goalsForHome`, `goalsForAway`, `points`, `qualified`, `isQualifying`, `isLive`, `isTied`, `isBanned`, `rankingCoefficient`, `groupFairPlayCoefficient`, `opponentsPoints`, `opponentsGoalDifference`, `opponentsGoalScored`, and the nested `team` object.

---

## 3. Player stats — goals, assists, red / yellow cards

There are two ways to get this; the aggregate leaderboard endpoint is the direct one, but it is origin‑locked.

### 3a. Aggregate leaderboards (official stats page source)
```
GET https://compstats.uefa.com/v1/player-ranking
    ?competitionId=1
    &seasonYear=2026
    &phase=TOURNAMENT
    &stats=goals            # goals | assists | yellow_cards | red_cards | ...
    &limit=10
    &offset=0
    &order=DESC
    &optionalFields=PLAYER,TEAM
```
⚠️ This host only responds when the request carries `Origin: https://www.uefa.com` (and/or `Referer`). From a normal server request it returns an empty body — so capture it **in the browser** (DevTools → Network) or add that header. The response is a ranked array of `{ player, team, value, rank }` objects. Valid `stats` names match the metric codes listed in §4 (e.g. `goals`, `assists`, `yellow_cards`, `red_cards`, `attempts_on_target`, `passes_accuracy`, `saves`, `ball_possession`).

### 3b. Per‑match events (verified working, no origin lock)
```
GET https://match.uefa.com/v5/matches/{matchId}/events?filter=LINEUP&order=ASC&limit=40&offset=0
```
Returns a chronological event feed. Event `type` values observed: **`GOAL`**, **`YELLOW_CARD`**, **`RED_CARD`**, `SUBSTITUTION`, `PLAYER`. Each event carries `matchId`, `phase`, `time`, `primaryActor.person` (the player, incl. `id`, `internationalName`, `imageUrl`), `bodyPart`, and pitch `coordinate {x,y}`. Assists appear as the secondary actor on `GOAL` events. Aggregating this across matches reproduces the goals/assists/cards tallies without the origin lock.

Goals are **also** available directly on each match object via `playerEvents.scorers[]` / `playerEvents.penaltyScorers[]` (see §1).

---

## 4. Team match statistics (per game)

### Endpoint
```
GET https://matchstats.uefa.com/v1/team-statistics/{matchId}
```
e.g. `https://matchstats.uefa.com/v1/team-statistics/2047742`

Returns per‑team `statistics[]`, each `{ "name": "<code>", "translations": { "name": { "EN": ... } }, "value": <number> }`.

Available metric codes include (selected): `goals`, `goals_scored`, `goals_conceded`, `penalty_scored`, `attempts`, `attempts_on_target`, `attempts_off_target`, `attempts_accuracy`, `blocked`, `ball_possession`, `passes_attempted`, `passes_accuracy`, `dribbling`, `dribbling_successful`, `dribbling_accuracy`, `aerialduel`, `corners`, `offsides`, `throw_ins`, `fouls_committed`, `fouls_suffered`, **`yellow_cards`**, **`red_cards`**, `saves`, `cross_attempted`, `free_kicks_on_goal`, and many shot‑placement / set‑piece breakdowns.

---

## 5. Team logos, crests & other images

All images are served from **`https://img.uefa.com`** and are directly hot‑linkable. Team objects in every endpoint already embed the URLs; the patterns:

### Team crests (PNG, by team `id`)
```
https://img.uefa.com/imgml/TP/teams/logos/70x70/{teamId}.png     # small
https://img.uefa.com/imgml/TP/teams/logos/240x240/{teamId}.png   # medium
https://img.uefa.com/imgml/TP/teams/logos/700x700/{teamId}.png   # large
```
Examples: Arsenal `52280`, Paris Saint‑Germain `52747`.
```
https://img.uefa.com/imgml/TP/teams/logos/240x240/52280.png
https://img.uefa.com/imgml/TP/teams/logos/700x700/52747.png
```

### Competition logo (SVG)
```
https://img.uefa.com/imgml/uefacom/elements/logos/competitions/color/full/{competitionId}.svg
# UCL → https://img.uefa.com/imgml/uefacom/elements/logos/competitions/color/full/1.svg
```

### National association / country crests (SVG)
```
https://img.uefa.com/imgml/uefacom/elements/logos/ma/{COUNTRYCODE}.svg
# e.g. .../ma/ENG.svg , .../ma/FRA.svg
```

### Country flags (PNG, national teams)
```
https://img.uefa.com/imgml/flags/70x70/{CODE}.png
https://img.uefa.com/imgml/flags/240x240/{CODE}.png
https://img.uefa.com/imgml/flags/700x700/{CODE}.png
```

### Player headshots (JPG, by player `id` and season)
```
https://img.uefa.com/imgml/TP/players/1/{seasonYear}/324x324/{playerId}.jpg
# e.g. .../players/1/2026/324x324/250066886.jpg  (Ousmane Dembélé)
```

### Stadiums / referees (bonus)
```
https://img.uefa.com/imgml/stadium/matchinfo/w1/{stadiumId}.jpg
https://img.uefa.com/imgml/referees/75x75/{personId}.jpg
```

---

## Practical notes

- **No API key** is required for any endpoint; they are the site's own public micro‑services.
- **Paging:** `limit` + `offset` on `matches`, `players`, `player-ranking`. `order` is `ASC`/`DESC`.
- **Localisation:** almost every label ships as a `translations` object with `EN, FR, DE, ES, PT, IT, RU, ZH, AR`.
- **Origin lock:** `comp.uefa.com` and `compstats.uefa.com` need an `Origin: https://www.uefa.com` header — trivial in a browser, easy to add in a scripted request; without it the body is empty. The `match.*`, `standings.*`, and `matchstats.*` hosts have no such lock.
- **IDs you'll reuse:** `competitionId=1` (UCL), `seasonYear=2026`, team ids (e.g. `52747`, `52280`), `matchId` from the matches feed, `roundId`/`matchday.id` for filtering.

## Endpoints verified live (2026‑07‑08)

| Endpoint | Result |
|---|---|
| `match.uefa.com/v5/matches` | ✅ full JSON returned |
| `match.uefa.com/v5/livescore` | ✅ full JSON returned |
| `match.uefa.com/v5/matches/{id}/events` | ✅ full JSON returned |
| `standings.uefa.com/v1/standings` | ✅ full JSON returned |
| `matchstats.uefa.com/v1/team-statistics/{id}` | ✅ full JSON returned |
| `compstats.uefa.com/v1/player-ranking` | ⚠️ empty without browser `Origin` header |
| `comp.uefa.com/v2/{players,teams,competitions}` | ⚠️ empty without browser `Origin` header |
