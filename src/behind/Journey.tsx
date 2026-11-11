import type { ReactNode } from 'react';
import { JOURNEY_MAIN, JOURNEY_MATCH, JOURNEY_MISMATCH, type JourneyStep } from '../domain/journey';
import { PERSONAS } from '../domain/personas';
import { Avatar, Owner } from './Avatar';

function StepCard({ step, n, compact }: { step: JourneyStep; n?: number; compact?: boolean }) {
  const stop = step.outcome === 'stop';
  const good = step.outcome === 'good';
  return (
    <div className={`rounded-card border bg-white ${compact ? 'p-3' : 'p-4'} ${stop ? 'border-dashed border-subtle' : 'border-line'}`}>
      <div className="flex items-center gap-2">
        {n !== undefined && <span className="text-caption font-bold text-brand">{String(n).padStart(2, '0')}</span>}
        <span className={`font-bold ${compact ? 'text-sm' : 'text-base'} ${stop ? 'text-muted' : 'text-ink'}`}>{step.title}</span>
        {good && (
          <span className="ml-auto grid size-5 place-items-center rounded-full bg-success" aria-label="Paid">
            <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2.5 6.5l2.5 2.5 4.5-5" />
            </svg>
          </span>
        )}
      </div>
      {!compact && <p className="mt-1 text-sm text-muted">{step.detail}</p>}
      <div className="mt-3">
        <Owner id={step.owner} />
      </div>
    </div>
  );
}

const Arrow = ({ vertical }: { vertical?: boolean }) => (
  <svg
    viewBox="0 0 24 12"
    className={`shrink-0 text-subtle ${vertical ? 'h-6 w-3 rotate-90' : 'h-3 w-6'}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M0 6h22M17 1l5 5-5 5" />
  </svg>
);

function BranchLabel({ children }: { children: string }) {
  return <span className="w-[72px] shrink-0 text-caption font-bold tracking-wide text-muted uppercase">{children}</span>;
}

/** Variant 1: horizontal track. Main path left to right, then the inspection forks into two lanes.
 *  The fork sits to the right on wide containers and drops below on narrow ones. */
export function JourneyTrack({ compact = false }: { compact?: boolean }) {
  const [reprice, director] = JOURNEY_MISMATCH;
  const w = compact ? 'w-36' : 'w-44';
  return (
    <div className="@container">
      <div className="flex flex-col gap-4 @[1180px]:flex-row @[1180px]:items-center">
        <div className="flex items-center gap-2">
          {JOURNEY_MAIN.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={w}>
                <StepCard step={s} n={i + 1} compact={compact} />
              </div>
              {i < JOURNEY_MAIN.length - 1 && <Arrow />}
            </div>
          ))}
        </div>
        <svg
          viewBox="0 0 32 120"
          className="hidden h-[150px] w-8 shrink-0 text-subtle @[1180px]:block"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M0 60 C 16 60, 16 20, 32 20 M0 60 C 16 60, 16 100, 32 100" />
        </svg>
        <div className="flex flex-col gap-3 border-l border-line pl-4 @[1180px]:border-l-0 @[1180px]:pl-0">
          <p className="text-caption text-muted @[1180px]:hidden">At inspection the path forks:</p>
          <div className="flex items-center gap-2">
            <BranchLabel>Match</BranchLabel>
            <div className={w}>
              <StepCard step={JOURNEY_MATCH[0]} n={5} compact={compact} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BranchLabel>Mismatch</BranchLabel>
            <div className={w}>
              <StepCard step={reprice} n={5} compact={compact} />
            </div>
            <Arrow />
            <div className={compact ? 'w-44' : 'w-52'}>
              <div className="rounded-card border border-line bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-bold text-brand">06</span>
                  <span className="text-sm font-bold text-ink">{director.title}</span>
                </div>
                <ul className="mt-2 space-y-1 text-caption">
                  <li className="flex items-center gap-1.5 text-ink">
                    <span className="size-2 rounded-full bg-success" /> Accept → picked up, paid
                  </li>
                  <li className="flex items-center gap-1.5 text-muted">
                    <span className="size-2 rounded-full border border-subtle" /> Decline → stays with dealer
                  </li>
                </ul>
                <div className="mt-3">
                  <Owner id={director.owner} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Variant 2: swimlane. One row per persona, columns in time order, so each hand-off is a change of lane. */
export function JourneySwimlane() {
  const cols: (JourneyStep & { lane?: string })[] = [...JOURNEY_MAIN, ...JOURNEY_MATCH, ...JOURNEY_MISMATCH];
  const lanes = ['maria', 'jordan', 'sam', 'dave'] as const;
  return (
    <div className="overflow-x-auto rounded-panel border border-line bg-white">
      <div className="grid min-w-[1040px]" style={{ gridTemplateColumns: `180px repeat(${cols.length}, minmax(0, 1fr))` }}>
        <div className="border-b border-line" />
        {cols.map((c, i) => (
          <div key={c.id} className={`border-b border-line px-2 py-3 text-caption font-medium ${i === 4 || i === 5 ? 'border-l border-l-line' : ''}`}>
            <span className="text-muted">
              {i < 4 ? `Step ${i + 1}` : ['If it matches', 'If it differs', 'Then', 'Or'][i - 4]}
            </span>
          </div>
        ))}
        {lanes.map((lane, li) => {
          const p = PERSONAS.find((x) => x.id === lane)!;
          return (
            <div key={lane} className="contents">
              <div className={`flex items-center gap-3 px-4 py-4 ${li < lanes.length - 1 ? 'border-b border-line-light' : ''}`}>
                <Avatar id={lane} />
                <div>
                  <div className="text-sm font-bold text-ink">{p.name}</div>
                  <div className="text-caption text-muted">
                    {p.role} · {p.org}
                  </div>
                </div>
              </div>
              {cols.map((c, i) => (
                <div
                  key={c.id}
                  className={`flex items-center px-2 py-3 ${li < lanes.length - 1 ? 'border-b border-line-light' : ''} ${
                    i === 4 || i === 5 ? 'border-l border-l-line' : ''
                  } ${c.branch === 'mismatch' ? 'bg-canvas' : ''}`}
                >
                  {c.owner === lane && (
                    <div
                      className={`w-full rounded-card border bg-white p-3 ${c.outcome === 'stop' ? 'border-dashed border-subtle' : 'border-line'}`}
                    >
                      <div className={`text-sm font-bold ${c.outcome === 'stop' ? 'text-muted' : 'text-ink'}`}>{c.title}</div>
                      <div className="mt-1 text-caption text-muted">{c.detail}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function JourneyPage({ variant = 'track' }: { variant?: 'track' | 'swimlane' }) {
  return (
    <PageFrame
      eyebrow="Behind the build"
      title="One car, start to finish"
      intro="The product lives in the hand-offs. Every step has one owner; the inspection is where the path forks."
    >
      {variant === 'track' ? <JourneyTrack /> : <JourneySwimlane />}
    </PageFrame>
  );
}

export function PageFrame({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="px-8 py-10">
      {eyebrow && <p className="text-caption font-bold tracking-wide text-brand uppercase">{eyebrow}</p>}
      <h1 className="mt-2 text-h3 font-bold text-ink">{title}</h1>
      {intro && <p className="mt-2 max-w-[680px] text-base text-muted">{intro}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}
