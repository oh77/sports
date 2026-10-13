import type React from 'react';

/** Heading plus one container of player rows, for a team's scorers or goalies. */
export function LeadersSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="display text-sm font-bold uppercase tracking-[0.08em] text-dim">
        {title}
      </h2>
      <div className="divide-y divide-line-soft overflow-hidden rounded-lg border border-line bg-surface">
        {children}
      </div>
    </section>
  );
}

/** Placeholder rows while a team's leaders load. */
export function LeadersLoading({ rows }: { rows: number }) {
  return (
    <div className="animate-pulse space-y-2" aria-hidden="true">
      <div className="h-4 w-24 rounded bg-surface-3" />
      <div className="rounded-lg bg-surface" style={{ height: rows * 58 }} />
    </div>
  );
}
