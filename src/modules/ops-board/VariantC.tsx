import { useState } from 'react';
import { DAYS } from './fixtures';
import { dealer, inspectorName, useOpsBoard, type OpsBoard, type OpsException } from './useOpsBoard';
import { Check, ExceptionCard, ModuleHeader, Toast } from './parts';

// C · Exceptions first: the queue of what needs ops now is the page; the week sits beside it
// as a small calendar that shows where each item lands.

export function VariantC() {
  const board = useOpsBoard();
  const [selected, setSelected] = useState<string | null>(null);
  const open = board.exceptions.filter((e) => !e.nudged);
  const waiting = board.exceptions.filter((e) => e.nudged);
  const focus = board.exceptions.find((e) => e.key === selected) ?? open[0] ?? null;

  return (
    <div className="min-h-screen bg-canvas px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <ModuleHeader
          title={open.length ? `${open.length} ${open.length === 1 ? 'thing needs' : 'things need'} you` : 'All clear'}
          right={<p className="text-sm text-muted">Most urgent first. Everything else runs on its own.</p>}
        />

        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_380px]">
          <main>
            <div className="space-y-3">
              {open.map((e) => (
                <QueueItem key={e.key} board={board} e={e} active={focus?.key === e.key} onFocus={() => setSelected(e.key)} />
              ))}
              {open.length === 0 && (
                <div className="rounded-panel border border-line bg-white px-6 py-10 text-center">
                  <p className="inline-flex items-center gap-2 text-title font-bold text-ink">
                    <Check /> Nothing needs you right now
                  </p>
                  <p className="mt-2 text-sm text-muted">Runs are on track. New exceptions show up here as inspectors report them.</p>
                </div>
              )}
            </div>

            {waiting.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm font-bold text-ink">Waiting on dealers</h2>
                <div className="mt-3 space-y-3">
                  {waiting.map((e) => (
                    <QueueItem key={e.key} board={board} e={e} active={focus?.key === e.key} onFocus={() => setSelected(e.key)} />
                  ))}
                </div>
              </section>
            )}

            {board.handledList.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm font-bold text-ink">Done today</h2>
                <ul className="mt-3 divide-y divide-line-light rounded-card border border-line bg-white">
                  {board.handledList.map((h) => (
                    <li key={h.key} className="flex items-center gap-3 px-4 py-3 text-sm text-body">
                      <Check /> {h.what}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>

          <WeekCalendar board={board} focus={focus} onPick={setSelected} />
        </div>
      </div>
      <Toast log={board.log} />
    </div>
  );
}

function QueueItem({ board, e, active, onFocus }: { board: OpsBoard; e: OpsException; active: boolean; onFocus: () => void }) {
  return (
    <div
      onClick={onFocus}
      className={`cursor-pointer rounded-card transition-shadow ${active ? 'shadow-[0_0_0_2px_var(--color-ink)]' : ''}`}
    >
      <ExceptionCard board={board} e={e} />
    </div>
  );
}

function WeekCalendar({ board, focus, onPick }: { board: OpsBoard; focus: OpsException | null; onPick: (key: string) => void }) {
  return (
    <aside className="self-start rounded-panel border border-line bg-white md:sticky md:top-6">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-title font-bold text-ink">Runs</h2>
        <p className="mt-1 text-caption text-muted">Two weeks. Yellow marks a run with something open.</p>
      </div>
      <ol>
        {DAYS.map((d) => {
          const routes = board.routesOn(d.id);
          return (
            <li key={d.id} className="border-b border-line-light px-5 py-4 last:border-b-0">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                {d.label}
                {d.state === 'today' && <span className="rounded-pill bg-ink px-2 py-0.5 text-caption font-medium text-white">Today</span>}
                {d.state === 'done' && <span className="text-caption font-medium text-muted">Done</span>}
              </p>
              <ul className="mt-2 space-y-2">
                {routes.map((r) => {
                  const stops = r.stops.filter((s) => board.carsAt(s, d.id).length || board.rolledOut(s, d.id).length);
                  if (!stops.length) return null;
                  const noInspector = !r.inspectorId && d.state !== 'done';
                  const routeHit = board.exceptions.find((e) => e.routeId === r.id);
                  return (
                    <li key={r.id} className={`rounded-card border px-3 py-2 ${focus && routeHit?.key === focus.key ? 'border-ink' : 'border-line-light'}`}>
                      <p className="flex items-center justify-between gap-2 text-caption text-muted">
                        <span>
                          {r.name} · {r.truck}
                        </span>
                        {noInspector ? (
                          <button type="button" onClick={() => routeHit && onPick(routeHit.key)} className="rounded-pill bg-nudge px-2 py-0.5 font-medium text-ink">
                            No inspector
                          </button>
                        ) : (
                          <span>{inspectorName(r.inspectorId)}</span>
                        )}
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {stops.map((s) => {
                          const n = board.carsAt(s, d.id).filter((c) => c.status !== 'declined').length;
                          const hit = board.exceptions.find((e) => e.dealerId === s && e.day === d.id && e.kind !== 'unassigned');
                          const isFocus = !!focus && !!hit && hit.key === focus.key;
                          return (
                            <li key={s}>
                              <button
                                type="button"
                                disabled={!hit}
                                onClick={() => hit && onPick(hit.key)}
                                className={`flex w-full items-center justify-between gap-2 rounded-xs px-1.5 py-0.5 text-left text-sm ${
                                  isFocus ? 'bg-ink text-white' : hit ? 'bg-nudge text-ink' : 'text-body'
                                }`}
                              >
                                <span className="truncate">{dealer(s).name}</span>
                                <span className="shrink-0 text-caption">{n} {n === 1 ? 'car' : 'cars'}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
