import type { ReactNode } from 'react';
import { PageFrame } from './Journey';

const TABLES = ['cars', 'offers', 'runs', 'inspections', 'events'];
const SCREENS = [
  ['Trade-in', 'Maria · desk'],
  ['Back office', 'Maria, Dave'],
  ['Inspector', 'Sam · phone'],
  ['Ops board', 'Jordan'],
];

function Panel({ title, sub, children, tone = 'solid' }: { title: string; sub?: string; children?: ReactNode; tone?: 'solid' | 'stub' }) {
  return (
    <div className={`rounded-panel border bg-white p-5 ${tone === 'stub' ? 'border-dashed border-subtle' : 'border-line'}`}>
      <div className="text-title font-bold text-ink">{title}</div>
      {sub && <div className="mt-1 text-sm text-muted">{sub}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

function Link({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2 text-caption text-muted">
      <svg viewBox="0 0 64 20" className="h-5 w-16 text-ink" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M6 6h52M52 1l6 5-6 5M58 14H6M12 9l-6 5 6 5" />
      </svg>
      <span className="text-center whitespace-nowrap">{label}</span>
    </div>
  );
}

export function ArchitecturePage() {
  return (
    <PageFrame
      eyebrow="Behind the build"
      title="Architecture, simplified"
      intro="One React app, one shared live backend. Every screen reads the same data, so a change on one shows on the others."
    >
      <div className="grid items-center gap-2 lg:grid-cols-[1fr_auto_1.2fr]">
        <Panel title="React app" sub="Hosted on Vercel · one app, four people">
          <div className="grid grid-cols-2 gap-2">
            {SCREENS.map(([t, s]) => (
              <div key={t} className="rounded-card border border-line-light bg-canvas px-3 py-2">
                <div className="text-sm font-medium text-ink">{t}</div>
                <div className="text-caption text-muted">{s}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Link label="live queries · mutations" />
        <Panel title="Convex" sub="Server functions + one shared database">
          <div className="flex flex-wrap gap-2">
            {TABLES.map((t) => (
              <span key={t} className="rounded-pill border border-line px-3 py-1 font-mono text-caption text-ink">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3 rounded-card border border-dashed border-subtle p-3">
            <div>
              <div className="text-sm font-bold text-ink">Pricing stub</div>
              <div className="text-caption text-muted">Isolated module. Clutch’s calculator plugs in here.</div>
            </div>
            <span className="rounded-pill bg-line-light px-3 py-1 text-caption font-medium text-muted">placeholder</span>
          </div>
        </Panel>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-panel border border-line bg-white p-6">
          <h2 className="text-title font-bold text-ink">Why Convex</h2>
          <ul className="mt-4 space-y-3 text-sm text-body">
            {[
              'Live hand-off: Sam re-prices on a phone and Dave’s table updates without a refresh. Queries are live by default.',
              'Database, server functions and real-time sync in one service, so no API layer or socket server to build.',
              'Typed end to end: schema, functions and React hooks share TypeScript types.',
              'Every status change is one mutation that also writes an event, so each car has a full timeline.',
            ].map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink" />
                {b}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-panel border border-line bg-white p-6">
          <h2 className="text-title font-bold text-ink">Faked on purpose</h2>
          <ul className="mt-4 space-y-3 text-sm text-body">
            {[
              ['Pricing', 'a labelled stub in one module'],
              ['Sign-in', 'a persona switcher'],
              ['Payments', 'a status change and an event'],
              ['Notifications', 'log lines on the car’s timeline'],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between gap-4 border-b border-line-light pb-3 last:border-b-0 last:pb-0">
                <span className="font-medium text-ink">{k}</span>
                <span className="text-muted">{v}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageFrame>
  );
}
