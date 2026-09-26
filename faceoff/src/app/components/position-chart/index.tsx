'use client';

import Image from 'next/image';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { GameInfo } from '@/app/types/domain/game';
import type { TeamInfo } from '@/app/types/domain/team';
import {
  buildPositionHistory,
  type PositionHistory,
} from '@/app/utils/positionHistory';

/** Plot geometry, px. */
const ROW_HEIGHT = 30;
const MIN_STEP = 14;
const PAD_LEFT = 32;
const PAD_RIGHT = 40;
const PAD_TOP = 14;
const AXIS_HEIGHT = 34;
const LOGO_SIZE = 22;

interface PositionChartProps {
  games: GameInfo[];
}

type Hover = { round: number; code: string; x: number; y: number };

/**
 * Every team's table position after each played game, as a bump chart. All
 * lines are grey context; the team under the pointer, or the one picked in the
 * row above, is drawn in the league accent. Logos at the right end name each
 * line, and a table view carries every value without the chart.
 */
export const PositionChart: React.FC<PositionChartProps> = ({ games }) => {
  const history = useMemo(() => buildPositionHistory(games), [games]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [frameRef, frameWidth] = useContainerWidth();

  const { teams, rounds, positions } = history;
  if (rounds === 0) {
    return (
      <p className="rounded-lg border border-line bg-surface px-4 py-8 text-center text-dim">
        Inga spelade matcher än den här säsongen.
      </p>
    );
  }

  const step = Math.max(
    MIN_STEP,
    rounds > 1
      ? (frameWidth - PAD_LEFT - PAD_RIGHT - LOGO_SIZE) / (rounds - 1)
      : 0,
  );
  const plotWidth = PAD_LEFT + (rounds - 1) * step + PAD_RIGHT + LOGO_SIZE;
  const plotHeight = PAD_TOP + (teams.length - 1) * ROW_HEIGHT + AXIS_HEIGHT;
  const xOf = (round: number) => PAD_LEFT + (round - 1) * step;
  const yOf = (position: number) => PAD_TOP + (position - 1) * ROW_HEIGHT;
  const lastX = xOf(rounds);

  const highlighted = hover?.code ?? selected;
  const teamByPosition = (round: number, position: number) =>
    teams.find((t) => positions[t.code][round - 1] === position);

  const onPointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left + PAD_LEFT - step / 2;
    const py = event.clientY - box.top + PAD_TOP - ROW_HEIGHT / 2;
    const round = clamp(Math.round((px - PAD_LEFT) / step) + 1, 1, rounds);
    const position = clamp(
      Math.round((py - PAD_TOP) / ROW_HEIGHT) + 1,
      1,
      teams.length,
    );
    const team = teamByPosition(round, position);
    if (team) {
      setHover({ round, code: team.code, x: xOf(round), y: yOf(position) });
    }
  };

  const ticks = xTicks(rounds);
  // Highlighted line drawn last so it sits on top of the grey ones.
  const drawOrder = [...teams].sort(
    (a, b) => Number(a.code === highlighted) - Number(b.code === highlighted),
  );

  return (
    <div className="flex flex-col gap-4">
      <TeamPicker
        teams={teams}
        selected={selected}
        onSelect={(code) => setSelected((cur) => (cur === code ? null : code))}
      />

      <div
        ref={frameRef}
        className="relative overflow-x-auto rounded-lg border border-line bg-surface p-3"
      >
        <svg
          width={plotWidth}
          height={plotHeight}
          role="img"
          aria-label={`Tabellplacering efter varje spelad match, ${teams.length} lag och ${rounds} omgångar. Se tabellvyn nedan för alla värden.`}
          className="block"
        >
          {/* Grid: one hairline per table position */}
          {teams.map((_, i) => (
            <g key={`row-${i + 1}`}>
              <line
                x1={PAD_LEFT}
                x2={lastX}
                y1={yOf(i + 1)}
                y2={yOf(i + 1)}
                className="stroke-line-soft"
                strokeWidth={1}
              />
              <text
                x={PAD_LEFT - 12}
                y={yOf(i + 1)}
                dy="0.35em"
                textAnchor="end"
                className="fill-mute text-[11px] num"
              >
                {i + 1}
              </text>
            </g>
          ))}

          {/* X axis */}
          {ticks.map((round) => (
            <text
              key={`tick-${round}`}
              x={xOf(round)}
              y={yOf(teams.length) + 22}
              textAnchor="middle"
              className="fill-mute text-[11px] num"
            >
              {round}
            </text>
          ))}

          {/* Crosshair on the hovered round */}
          {hover && (
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PAD_TOP - 8}
              y2={yOf(teams.length) + 8}
              className="stroke-line-strong"
              strokeWidth={1}
            />
          )}

          {drawOrder.map((team) => (
            <TeamLine
              key={team.code}
              points={positions[team.code].map((pos, i) => [
                xOf(i + 1),
                yOf(pos),
              ])}
              state={
                highlighted === null
                  ? 'normal'
                  : team.code === highlighted
                    ? 'highlight'
                    : 'muted'
              }
            />
          ))}

          {/* Logos at the line ends name each team */}
          {teams.map((team) => {
            const y = yOf(positions[team.code][rounds - 1]);
            const muted = highlighted !== null && team.code !== highlighted;
            return (
              <g key={`logo-${team.code}`} opacity={muted ? 0.35 : 1}>
                <title>{team.full}</title>
                {team.logo ? (
                  <image
                    href={team.logo}
                    x={lastX + 10}
                    y={y - LOGO_SIZE / 2}
                    width={LOGO_SIZE}
                    height={LOGO_SIZE}
                  />
                ) : (
                  <text
                    x={lastX + 10}
                    y={y}
                    dy="0.35em"
                    className="fill-soft text-[10px] font-bold"
                  >
                    {team.short}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hit layer: the nearest round × position cell picks the team */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer-only enhancement; the team picker is the keyboard route and the table view holds every value */}
          <rect
            x={PAD_LEFT - step / 2}
            y={PAD_TOP - ROW_HEIGHT / 2}
            width={(rounds - 1) * step + step}
            height={teams.length * ROW_HEIGHT}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
            onClick={() =>
              hover &&
              setSelected((cur) => (cur === hover.code ? null : hover.code))
            }
          />
        </svg>

        <p className="mt-1 text-center text-xs text-mute">Spelade matcher</p>

        {hover && (
          <HoverCard
            hover={hover}
            history={history}
            flip={hover.x > plotWidth / 2}
          />
        )}
      </div>

      <TableView history={history} />
    </div>
  );
};

/** One team's path: a 2px line with a dot per game. */
function TeamLine({
  points,
  state,
}: {
  points: [number, number][];
  state: 'normal' | 'highlight' | 'muted';
}) {
  const d = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`)
    .join(' ');
  const highlight = state === 'highlight';

  return (
    <g opacity={state === 'muted' ? 0.25 : 1} className="pointer-events-none">
      <path
        d={d}
        fill="none"
        strokeWidth={highlight ? 2.5 : 1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        className={highlight ? 'stroke-accent' : 'stroke-mute'}
      />
      {points.map(([x, y]) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r={highlight ? 4 : 2}
          strokeWidth={highlight ? 2 : 0}
          className={
            highlight ? 'fill-accent stroke-surface' : 'fill-mute stroke-none'
          }
        />
      ))}
    </g>
  );
}

/** Tooltip for the hovered point, kept inside the frame. */
function HoverCard({
  hover,
  history,
  flip,
}: {
  hover: Hover;
  history: PositionHistory;
  /** Open to the left of the point, for points in the right half. */
  flip: boolean;
}) {
  const team = history.teams.find((t) => t.code === hover.code);
  if (!team) return null;
  const tally = history.tallies[hover.code][hover.round - 1];
  const position = history.positions[hover.code][hover.round - 1];
  const played = Math.min(hover.round, history.played[hover.code]);
  const diff = tally.goalsFor - tally.goalsAgainst;

  return (
    <div
      className="pointer-events-none absolute z-10 min-w-[10rem] rounded-md border border-line-strong bg-surface-2 px-3 py-2 text-xs shadow-xl"
      style={{
        left: `calc(${hover.x + 12}px + 0.75rem)`,
        top: `calc(${hover.y}px + 0.75rem)`,
        transform: flip
          ? 'translate(calc(-100% - 24px), -50%)'
          : 'translateY(-50%)',
      }}
    >
      <p className="font-semibold text-ink">{team.full}</p>
      <p className="mt-1 text-soft">
        Plats <span className="num font-semibold text-ink">{position}</span>{' '}
        efter {played} {played === 1 ? 'match' : 'matcher'}
      </p>
      <p className="num text-dim">
        {tally.points} p · {diff > 0 ? `+${diff}` : diff} ({tally.goalsFor}–
        {tally.goalsAgainst})
      </p>
    </div>
  );
}

/** One row of logo toggles above the chart; keyboard route to highlighting. */
function TeamPicker({
  teams,
  selected,
  onSelect,
}: {
  teams: TeamInfo[];
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  return (
    <fieldset className="flex flex-wrap justify-center gap-2">
      <legend className="sr-only">Markera lag i diagrammet</legend>
      {teams.map((team) => {
        const active = team.code === selected;
        return (
          <button
            key={team.code}
            type="button"
            aria-pressed={active}
            title={team.full}
            onClick={() => onSelect(team.code)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
              active
                ? 'bg-surface-3 ring-2 ring-accent'
                : 'bg-surface opacity-70 hover:opacity-100'
            }`}
          >
            {team.logo ? (
              <Image
                src={team.logo}
                alt=""
                aria-hidden="true"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                unoptimized
              />
            ) : (
              <span aria-hidden="true" className="text-[10px] text-soft">
                {team.short}
              </span>
            )}
            <span className="sr-only">{team.full}</span>
          </button>
        );
      })}
    </fieldset>
  );
}

/** The chart's values as a table: one row per team, one column per round. */
function TableView({ history }: { history: PositionHistory }) {
  const rounds = Array.from({ length: history.rounds }, (_, i) => i + 1);

  return (
    <details className="rounded-lg border border-line bg-surface">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-soft hover:text-ink">
        Visa som tabell
      </summary>
      <div className="overflow-x-auto border-t border-line">
        <table className="w-full text-xs">
          <caption className="sr-only">
            Tabellplacering per lag efter varje spelad match
          </caption>
          <thead className="bg-surface-2 text-mute">
            <tr>
              <th
                scope="col"
                className="sticky left-0 bg-surface-2 px-3 py-2 text-left"
              >
                Lag
              </th>
              {rounds.map((round) => (
                <th key={round} scope="col" className="num px-1.5 py-2">
                  {round}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {history.teams.map((team) => (
              <tr key={team.code}>
                <th
                  scope="row"
                  className="sticky left-0 whitespace-nowrap bg-surface px-3 py-1.5 text-left font-medium text-ink"
                >
                  {team.short}
                </th>
                {history.positions[team.code].map((position, i) => (
                  <td
                    key={rounds[i]}
                    className="num px-1.5 py-1.5 text-center text-soft"
                  >
                    {position}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Round numbers to label: the first, every fifth, and the last. */
function xTicks(rounds: number): number[] {
  const ticks = new Set<number>([1, rounds]);
  for (let round = 5; round < rounds; round += 5) {
    if (rounds - round >= 2) ticks.add(round);
  }
  return [...ticks].sort((a, b) => a - b);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Inner width of the chart frame, tracked so the plot fills it. A callback ref,
 * so measuring starts whenever the frame mounts.
 */
function useContainerWidth(): [(el: HTMLDivElement | null) => void, number] {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!element) return;
    // Minus the frame's padding (p-3 on both sides).
    const measure = () => setWidth(element.clientWidth - 24);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, width];
}
