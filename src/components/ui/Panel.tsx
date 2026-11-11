import type { ReactNode } from 'react';

/** A white panel with its heading inside: title, an optional yellow count of what needs someone, and a grey note on
 *  the right. Every desktop module builds its page from these. */
export function Panel({ title, count, aside, compact, children }: { title: string; count?: number; aside?: ReactNode; compact?: boolean; children: ReactNode }) {
  return (
    <section className="rounded-panel border border-line bg-white">
      <header className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${compact ? 'px-6 pt-5 pb-3' : 'px-8 pt-6 pb-4'}`}>
        <h2 className="flex items-center gap-2 text-title font-bold text-ink">
          {title}
          {!!count && <span className="grid h-6 min-w-6 place-items-center self-center rounded-pill bg-warning px-2 text-caption font-bold text-ink">{count}</span>}
        </h2>
        {aside && <div className="text-sm text-muted">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

/** Outline pill, the same shape as Trade-in's answers: the row actions. */
export const PILL = 'inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-pill border border-line bg-white px-5 text-sm font-medium text-ink hover:border-ink';
