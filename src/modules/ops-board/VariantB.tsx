import { useState } from 'react';
import { SegmentedProgress } from '../../components/ui/Stepper';
import { DAYS, TRUCK_CAPACITY, type Route } from './fixtures';
import { day, dealer, futureDays, inspectorName, isInspected, useOpsBoard, type OpsBoard } from './useOpsBoard';
import { CarLine, Check, ExceptionCard, InspectorMenu, Menu, MenuItem, ModuleHeader, Toast } from './parts';

// B · Today's runs: one card per truck with its stops in driving order and live progress,
// and a rail of what needs ops right now.

const TODAY = DAYS.find((d) => d.state === 'today')!;

export function VariantB() {
  const board = useOpsBoard();
  const routes = board.routesOn(TODAY.id);
  const all = routes.flatMap((r) => board.routeCars(r)).filter((c) => c.status !== 'offered');
  const done = all.filter(isInspected).length;

  return (
    <div className="min-h-screen bg-canvas px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <ModuleHeader
          title="Today's runs"
          right={
            <p className="text-sm text-body">
              <span className="font-bold text-ink">{routes.length} trucks</span> · {all.length} cars · {done} inspected
            </p>
          }
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            {routes.map((r) => (
              <RouteCard key={r.id} board={board} route={r} />
            ))}
          </div>
          <aside>
            <h2 className="flex items-center gap-2 text-title font-bold text-ink">
              Needs you
              <span className="rounded-pill bg-ink px-2 py-0.5 text-caption font-medium text-white">{board.exceptions.length}</span>
            </h2>
            <div className="mt-4 space-y-3">
              {board.exceptions.map((e) => (
                <ExceptionCard key={e.key} board={board} e={e} compact />
              ))}
              {board.exceptions.length === 0 && (
                <p className="flex items-center gap-2 rounded-card border border-line bg-white p-4 text-sm text-body">
                  <Check /> Nothing needs you right now.
                </p>
              )}
            </div>
            {board.handledList.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-ink">Done today</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted">
                  {board.handledList.map((h) => (
                    <li key={h.key} className="flex items-start gap-2">
                      <span className="mt-0.5"><Check /></span>
                      {h.what}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
      <Toast log={board.log} />
    </div>
  );
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fmt = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
};
const NOW = toMin('11:40');

type StopState = 'done' | 'here' | 'next' | 'later';
const stopChip: Record<StopState, string> = {
  done: 'Done',
  here: 'Inspector on site',
  next: 'Next',
  later: 'Later',
};

function RouteCard({ board, route }: { board: OpsBoard; route: Route }) {
  const cars = board.routeCars(route).filter((c) => c.status !== 'offered');
  const inspected = cars.filter(isInspected).length;
  const load = board.routeLoad(route);
  const noInspector = !route.inspectorId;
  const started = toMin(route.start) <= NOW;

  // Stops in driving order, with an ETA: 30 min to the first stop, 15 min per car, 25 min between stops.
  const withCars = route.stops
    .map((s) => ({ dealerId: s, cars: board.carsAt(s, route.day).filter((c) => c.status !== 'offered') }))
    .filter((s) => s.cars.length || board.rolledOut(s.dealerId, route.day).length);
  const etas: number[] = [];
  withCars.forEach((_, i) => {
    etas.push(i === 0 ? toMin(route.start) + 30 : etas[i - 1] + withCars[i - 1].cars.length * 15 + 25);
  });
  // Next = the first stop nobody has started.
  const firstOpen = withCars.findIndex((s) => !s.cars.some(isInspected));
  const stops = withCars.map((s, i) => {
    const n = s.cars.filter(isInspected).length;
    const state: StopState =
      n === s.cars.length ? 'done' : n > 0 ? 'here' : i === firstOpen && started ? 'next' : 'later';
    return { ...s, eta: etas[i], state };
  });

  return (
    <article className={`rounded-panel border bg-white ${noInspector ? 'border-warning' : 'border-line'}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-title font-bold text-ink">{route.name} run</h3>
          <p className="mt-1 text-sm text-muted">
            {route.truck} · {load} of {TRUCK_CAPACITY} cars · {started ? `left ${fmt(toMin(route.start))}` : `leaves ${fmt(toMin(route.start))}`}
            {load > TRUCK_CAPACITY && <span className="ml-1 font-medium text-error">· over capacity</span>}
          </p>
        </div>
        <InspectorMenu board={board} route={route} />
      </header>

      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SegmentedProgress total={cars.length || 1} done={inspected} />
          </div>
          <span className="text-caption font-medium text-body whitespace-nowrap">
            {inspected} of {cars.length} inspected
          </span>
        </div>
        {noInspector && (
          <p className="mt-3 rounded-card bg-nudge px-4 py-3 text-sm text-body">
            No inspector yet. The truck can't take cars without an inspection. Assign one before {fmt(toMin(route.start))}.
          </p>
        )}

        <ol className="mt-4">
          {stops.map((s, i) => (
            <Stop key={s.dealerId} board={board} route={route} stop={s} last={i === stops.length - 1} />
          ))}
        </ol>
      </div>
    </article>
  );
}

function Stop({
  board,
  route,
  stop,
  last,
}: {
  board: OpsBoard;
  route: Route;
  stop: { dealerId: string; cars: ReturnType<OpsBoard['carsAt']>; eta: number; state: StopState };
  last: boolean;
}) {
  const [open, setOpen] = useState(stop.state === 'here');
  const dl = dealer(stop.dealerId);
  const rolled = board.rolledOut(stop.dealerId, route.day);
  const flagged = stop.cars.some((c) => c.status === 'reprice_pending') || rolled.length > 0;
  const otherRoutes = board.routesOn(route.day).filter((r) => r.id !== route.id);
  const canMove = stop.state !== 'done' && stop.state !== 'here';

  return (
    <li className="relative flex gap-4">
      <div className="flex w-4 flex-col items-center">
        <span
          className={`mt-1.5 size-3 shrink-0 rounded-full border-2 ${
            stop.state === 'done' ? 'border-success bg-success' : stop.state === 'here' ? 'border-ink bg-ink' : 'border-subtle bg-white'
          }`}
        />
        {!last && <span className="w-px flex-1 bg-line" />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? '' : 'pb-5'}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-left text-base font-bold text-ink hover:underline">
            {dl.name}
          </button>
          <span className="text-sm text-muted">
            ~{fmt(stop.eta)} · {stop.cars.length} {stop.cars.length === 1 ? 'car' : 'cars'}
          </span>
          <span
            className={`rounded-pill px-2.5 py-0.5 text-caption font-medium ${
              stop.state === 'here' ? 'bg-ink text-white' : stop.state === 'done' ? 'bg-line-light text-body' : 'border border-line text-body'
            }`}
          >
            {stopChip[stop.state]}
          </span>
          {flagged && <span className="rounded-pill bg-nudge px-2.5 py-0.5 text-caption font-medium text-ink">Needs you</span>}
          <span className="ml-auto flex items-center gap-2">
            {canMove && (
              <Menu label="Move stop" align="right">
                {(close) => (
                  <>
                    {otherRoutes.map((r) => (
                      <MenuItem
                        key={r.id}
                        title={`${r.name} run today · ${r.truck}`}
                        helper={`${inspectorName(r.inspectorId) ?? 'No inspector'} · ${board.routeLoad(r)} of ${TRUCK_CAPACITY} cars now`}
                        onClick={() => {
                          board.moveStop(stop.dealerId, route.day, r.id);
                          close();
                        }}
                      />
                    ))}
                    {futureDays(route.day).map((d) => (
                      <MenuItem
                        key={d.id}
                        title={day(d.id).label}
                        helper={`All ${stop.cars.length} cars move to that run`}
                        onClick={() => {
                          board.moveRun(stop.dealerId, route.day, d.id);
                          close();
                        }}
                      />
                    ))}
                  </>
                )}
              </Menu>
            )}
            <button type="button" onClick={() => setOpen((o) => !o)} className="h-8 px-2 text-caption font-medium text-body hover:underline">
              {open ? 'Hide cars' : 'Show cars'}
            </button>
          </span>
        </div>
        {open && (
          <div className="mt-3 rounded-card border border-line">
            {stop.cars.map((c) => (
              <CarLine key={c.id} board={board} car={c} movable={!isInspected(c)} />
            ))}
            {rolled.map((c) => (
              <CarLine key={c.id} board={board} car={{ ...c, note: `${c.note ?? 'Not ready'} · rolled to ${day(c.day).label}` }} />
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
