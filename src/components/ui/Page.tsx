import type { ReactNode } from 'react';

/** One content width and side padding for every desktop module, so page edges stay put when switching modules.
 *  1400px because the trade-in form needs it to fit its questions on one screen. */
export const PAGE = 'mx-auto w-full max-w-[1400px] px-8';

/**
 * The top of every desktop module: the page title, a grey context line under it (dealer, next pickup), and an
 * optional control on the right (usually tabs). The app header above already shows who is viewing and the time.
 */
export function PageHeader({ title, context, right }: { title: string; context?: ReactNode; right?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-h4 font-bold text-ink">{title}</h1>
        {context && <p className="mt-1 text-sm text-muted">{context}</p>}
      </div>
      {right}
    </header>
  );
}

/** Pill tabs that switch a module between its pages. */
export function SegmentedTabs<T extends string>({ items, value, onChange }: { items: [T, string][]; value: T; onChange: (t: T) => void }) {
  return (
    <div role="group" className="inline-flex gap-1 rounded-pill border border-line bg-white p-1">
      {items.map(([id, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`h-8 rounded-pill px-4 text-sm font-medium transition-colors ${value === id ? 'bg-ink text-white' : 'text-body hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** A section title: 18px bold, an optional count badge, and an optional grey note on the right. */
export function SectionHeading({ children, count, aside, className = '' }: { children: ReactNode; count?: number; aside?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${className}`}>
      <h2 className="flex items-center gap-2 text-title font-bold text-ink">
        {children}
        {!!count && <span className="grid h-6 min-w-6 place-items-center self-center rounded-pill bg-ink px-2 text-caption font-bold text-white">{count}</span>}
      </h2>
      {aside && <p className="text-caption text-muted">{aside}</p>}
    </div>
  );
}
