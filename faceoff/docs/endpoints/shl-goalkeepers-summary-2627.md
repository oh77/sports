# SHL goalkeepers summary (Statnet)

`https://www.shl.se/api/statistics-v2/stats-info/goalkeepers_summary?count=100&ssgtUuid=qa98unlbd6&provider=statnet`

Captured 2026-10-13 (season 26-27, 8 rounds in). Trimmed: the full response
also has a `teams` map (club metadata), a `players` map keyed by Statnet id
(repeats `gpi`, `mip`, `validRanking` per goalie), `games`,
`seasonSeriesGameTypes`, `type: "athlete"` and `totalCount` (28).

## Columns

`Rank, Player, Team, SVS, SVSPerc, GP, GPI, GA, GAA, W, T, L, SO, MIP`

- `GP` — games on the roster, including games spent on the bench as backup
- `GPI` — games played with ice time ("spelade matcher med speltid" on shl.se)
- `MIP` — minutes in play, `"mm:ss"` string
- `ValidRanking` (per row) — false for goalies under the ranking threshold;
  their `Rank` is `null` and they are listed after the ranked ones

## Sample rows (`info` trimmed)

```json
{ "Rank": 1, "SVS": 112, "SVSPerc": "98.25", "GP": 8, "GPI": 4, "GA": 2,
  "GAA": "0.50", "W": 4, "T": 0, "L": 0, "SO": 2, "MIP": "240:00",
  "ValidRanking": true,
  "info": { "fullName": "Melker Thelin", "number": 35,
            "team": { "name": "Färjestad BK", "code": "FBK" } } }

{ "Rank": null, "SVS": 16, "SVSPerc": "94.12", "GP": 7, "GPI": 1, "GA": 1,
  "GAA": "1.04", "W": 0, "T": 0, "L": 1, "SO": 0, "MIP": "57:35",
  "ValidRanking": false,
  "info": { "fullName": "Waltteri Ignatjew", "number": 36,
            "team": { "name": "Linköping HC", "code": "LHC" } } }
```
