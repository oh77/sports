import { Fragment } from 'react';
import type { MatchInfo } from '@/app/types/domain/match';

type MetaTag = { label: string; title: string };

/**
 * Qualifiers that apply to a match, as one line: "Semifinal · 2:2". The
 * shorthand labels carry a spelled-out title for hover and screen readers.
 * Renders nothing for an ordinary one-off league match.
 */
export function MatchMetaRow({ match }: { match: MatchInfo }) {
  const tags: MetaTag[] = [];
  if (match.qualifying) tags.push({ label: 'Kval', title: 'Kvalmatch' });
  if (match.knockout && match.roundLabel) {
    tags.push({ label: match.roundLabel, title: match.roundLabel });
  }
  if (match.leg) {
    tags.push({
      label: `${match.leg.number}:${match.leg.of}`,
      title: `Match ${match.leg.number} av ${match.leg.of} i dubbelmötet`,
    });
  }
  if (tags.length === 0) return null;

  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-dim">
      {tags.map((tag, i) => (
        <Fragment key={tag.label}>
          {i > 0 && (
            <span aria-hidden="true" className="px-1">
              ·
            </span>
          )}
          <span title={tag.title}>
            <span aria-hidden="true">{tag.label}</span>
            <span className="sr-only">{tag.title}</span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Tie total for a two-legged knockout game — the standing aggregate while the
 * tie is running, the final one once it is over. Renders nothing when the
 * match isn't part of a tie whose other leg is known.
 */
export function AggregateLine({ match }: { match: MatchInfo }) {
  const home = match.homeTeamInfo.aggregateScore;
  const away = match.awayTeamInfo.aggregateScore;
  if (home === undefined || away === undefined) return null;

  return (
    <span
      className="num text-[11px] text-dim"
      title={
        match.state === 'finished'
          ? 'Totalt över två matcher'
          : 'Sammanlagt just nu'
      }
    >
      ({home}–{away})
    </span>
  );
}
