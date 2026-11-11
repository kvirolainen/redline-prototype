import type { ReactNode } from 'react';

/** A white panel with its heading inside: title, an optional yellow count of what needs someone, and a grey note on
 *  the right. Every desktop module builds its page from these. One 24px inner gutter everywhere (`PANEL_X`), so text
 *  inside panels keeps the same left edge across panels, tabs and modules. */
export function Panel({ title, count, aside, children }: { title: string; count?: number; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-panel border border-line bg-white">
      <header className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${PANEL_X} pt-5 pb-4`}>
        <h2 className="flex items-center gap-2 text-title font-bold text-ink">
          {title}
          {!!count && <CountBadge n={count} />}
        </h2>
        {aside && <div className="text-sm text-muted">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

/** The panel's inner side padding: rows and body text inside a Panel use it too. */
export const PANEL_X = 'px-6';

/** The yellow count of things that need someone: on a panel heading and on a tab. */
export function CountBadge({ n }: { n: number }) {
  return <span className="grid h-5 min-w-5 place-items-center self-center rounded-pill bg-warning px-1.5 text-caption font-bold text-ink">{n}</span>;
}

/** Outline pill, the same shape as Trade-in's answers: the row actions. */
export const PILL = 'inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-pill border border-line bg-white px-5 text-sm font-medium text-ink hover:border-ink';
