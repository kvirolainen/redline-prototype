import { useState } from 'react';
import { DAYS, DEALERS, TRUCK_CAPACITY, type DayId } from './fixtures';
import { day, dealer, futureDays, inspectorName, isInspected, useOpsBoard, type OpsBoard } from './useOpsBoard';
import { CarLine, ExceptionCard, InspectorMenu, Menu, MenuItem, ModuleHeader, SidePanel, StatusDot, Toast } from './parts';

// A · Week grid: dealers as rows, run days as columns. Each cell is one pickup run.

interface Cell {
  dealerId: string;
  day: DayId;
}

export function VariantA() {
  const board = useOpsBoard();
  const [open, setOpen] = useState<Cell | null>(null);
  const today = DAYS.find((d) => d.state === 'today')!;
  const todayCars = board.cars.filter((c) => c.day === today.id && c.status !== 'offered');
  const weekCars = board.cars.filter((c) => c.status !== 'offered' && c.status !== 'declined');

  return (
    <div className="min-h-screen bg-canvas px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <ModuleHeader title="Pickup runs" right={<Legend />} />

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-4">
          <Stat label="Cars on runs, two weeks" value={String(weekCars.length)} />
          <Stat label="Inspected today" value={`${todayCars.filter(isInspected).length} of ${todayCars.length}`} />
          <Stat label="Trucks out today" value={String(board.routesOn(today.id).length)} />
          <Stat label="Need you" value={String(board.exceptions.length)} attention={board.exceptions.length > 0} />
        </dl>

        {board.exceptions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-card border border-warning bg-nudge px-4 py-3">
            <span className="mr-1 text-sm font-medium text-ink">Needs you:</span>
            {board.exceptions.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={() => setOpen({ dealerId: e.dealerId, day: e.day })}
                className="h-8 rounded-pill border border-line bg-white px-3 text-caption font-medium text-ink hover:border-ink"
              >
                {e.title} · {dealer(e.dealerId).name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-panel border border-line bg-white">
          <div className="grid grid-cols-[minmax(168px,1.1fr)_repeat(4,minmax(0,1fr))]">
            <div className="border-b border-line px-4 py-3 text-caption font-medium text-muted">Dealer</div>
            {DAYS.map((d) => (
              <div key={d.id} className={`border-b border-l border-line px-4 py-3 ${d.state === 'today' ? 'bg-ink text-white' : ''}`}>
                <p className="text-sm font-bold">{d.label}</p>
                <p className={`text-caption ${d.state === 'today' ? 'text-white/70' : 'text-muted'}`}>
                  {d.state === 'done' ? 'Done' : d.state === 'today' ? 'Today, runs out' : 'Planned'} · {board.routesOn(d.id).length} {board.routesOn(d.id).length === 1 ? 'truck' : 'trucks'}
                </p>
              </div>
            ))}

            {DEALERS.map((dl) => (
              <Row key={dl.id} board={board} dealerId={dl.id} onOpen={setOpen} />
            ))}
          </div>
        </div>
        <p className="mt-3 text-caption text-muted">Each dealer has one regular run day. Click a run to see its cars, change the inspector or move cars.</p>
      </div>

      {open && <RunPanel board={board} cell={open} onClose={() => setOpen(null)} />}
      <Toast log={board.log} />
    </div>
  );
}

function Stat({ label, value, attention }: { label: string; value: string; attention?: boolean }) {
  return (
    <div className="bg-white px-5 py-4">
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="mt-1 text-h4 font-bold text-ink">
        {attention && <span className="mr-2 inline-block size-2.5 rounded-full bg-warning align-middle" />}
        {value}
      </dd>
    </div>
  );
}

function Legend() {
  const items: [string, string][] = [
    ['bg-white border border-subtle', 'Offer made'],
    ['bg-ink', 'Booked'],
    ['bg-warning', 'Needs attention'],
    ['bg-success', 'Picked up'],
    ['bg-line', 'Declined'],
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted">
      {items.map(([c, l]) => (
        <li key={l} className="flex items-center gap-1.5">
          <span className={`inline-block size-2.5 rounded-full ${c}`} />
          {l}
        </li>
      ))}
    </ul>
  );
}

function Row({ board, dealerId, onOpen }: { board: OpsBoard; dealerId: string; onOpen: (c: Cell) => void }) {
  const dl = dealer(dealerId);
  return (
    <>
      <div className="border-b border-line px-4 py-4 last:border-b-0">
        <p className="text-sm font-bold text-ink">{dl.name}</p>
        <p className="text-caption text-muted">
          {dl.area} · {dl.runDay === 'Thu' ? 'Thursdays' : 'Tuesdays'}
        </p>
      </div>
      {DAYS.map((d) => {
        const cars = board.carsAt(dealerId, d.id);
        const rolled = board.rolledOut(dealerId, d.id);
        const route = board.routeFor(dealerId, d.id);
        const flagged = board.exceptions.some((e) => e.dealerId === dealerId && e.day === d.id) ||
          board.exceptions.some((e) => e.kind === 'unassigned' && e.day === d.id && route && e.routeId === route.id);
        const regular = dl.runDay === d.weekday;
        if (!cars.length && !rolled.length) {
          return (
            <div key={d.id} className={`border-b border-l border-line px-4 py-4 text-caption text-subtle ${d.state === 'today' ? 'bg-canvas' : ''}`}>
              {regular ? 'No cars' : ''}
            </div>
          );
        }
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onOpen({ dealerId, day: d.id })}
            className={`relative border-b border-l border-line px-4 py-4 text-left transition-colors hover:bg-canvas ${
              d.state === 'today' ? 'bg-canvas' : ''
            } ${flagged ? 'shadow-[inset_3px_0_0_0_var(--color-warning)]' : ''}`}
          >
            <p className="text-sm font-bold text-ink">
              {cars.length} {cars.length === 1 ? 'car' : 'cars'}
              {flagged && <span className="ml-2 rounded-pill bg-nudge px-2 py-0.5 text-caption font-medium text-ink">Needs you</span>}
            </p>
            <p className="mt-2 flex flex-wrap gap-1.5">
              {cars.map((c) => (
                <StatusDot key={c.id} car={c} />
              ))}
            </p>
            <p className="mt-2 truncate text-caption text-muted">
              {route ? `${inspectorName(route.inspectorId) ?? 'No inspector'} · ${route.truck}` : 'Not on a run'}
            </p>
            {rolled.length > 0 && <p className="mt-1 text-caption text-body">{rolled.length} rolled to next run</p>}
          </button>
        );
      })}
    </>
  );
}

function RunPanel({ board, cell, onClose }: { board: OpsBoard; cell: Cell; onClose: () => void }) {
  const dl = dealer(cell.dealerId);
  const d = day(cell.day);
  const cars = board.carsAt(cell.dealerId, cell.day);
  const rolled = board.rolledOut(cell.dealerId, cell.day);
  const route = board.routeFor(cell.dealerId, cell.day);
  const exceptions = board.exceptions.filter(
    (e) => (e.dealerId === cell.dealerId && e.day === cell.day) || (route && e.routeId === route.id),
  );
  const openCars = cars.filter((c) => !isInspected(c));
  const editable = d.state !== 'done';
  const load = route ? board.routeLoad(route) : 0;

  return (
    <SidePanel
      title={`${dl.name} · ${d.label}`}
      subtitle={route ? `${route.name} run · ${route.truck} · leaves ${route.start}` : 'Not on a run'}
      onClose={onClose}
    >
      {exceptions.length > 0 && (
        <section className="space-y-3 border-b border-line px-6 py-5">
          {exceptions.map((e) => (
            <ExceptionCard key={e.key} board={board} e={e} />
          ))}
        </section>
      )}

      {route && (
        <section className="border-b border-line px-6 py-5">
          <h3 className="text-sm font-bold text-ink">Run</h3>
          <dl className="mt-3 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-muted">Inspector</dt>
            <dd>{editable ? <InspectorMenu board={board} route={route} /> : inspectorName(route.inspectorId)}</dd>
            <dt className="text-muted">Truck</dt>
            <dd className="text-ink">
              {route.truck}: {load} of {TRUCK_CAPACITY} cars
              {load > TRUCK_CAPACITY && <span className="ml-1 font-medium text-error">over capacity</span>}
            </dd>
            <dt className="text-muted">Stops</dt>
            <dd className="text-ink">{route.stops.map((s) => dealer(s).name).join(' → ')}</dd>
            <dt className="text-muted">Dealer contact</dt>
            <dd className="text-ink">{dl.contact}</dd>
          </dl>
        </section>
      )}

      <section className="px-6 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">Cars on this run</h3>
          {editable && openCars.length > 0 && (
            <Menu label="Move whole run" align="right">
              {(close) =>
                futureDays(cell.day).map((t) => (
                  <MenuItem
                    key={t.id}
                    title={t.label}
                    helper={`${openCars.length} open ${openCars.length === 1 ? 'car' : 'cars'} move`}
                    onClick={() => {
                      board.moveRun(cell.dealerId, cell.day, t.id);
                      close();
                      onClose();
                    }}
                  />
                ))
              }
            </Menu>
          )}
        </div>
        <div className="mt-3 overflow-visible rounded-card border border-line">
          {cars.length ? (
            cars.map((c) => <CarLine key={c.id} board={board} car={c} movable={editable && !isInspected(c)} />)
          ) : (
            <p className="px-4 py-3 text-sm text-muted">No cars left on this run.</p>
          )}
        </div>
        {rolled.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-bold text-ink">Rolled to a later run</h3>
            <div className="mt-3 rounded-card border border-line">
              {rolled.map((c) => (
                <CarLine key={c.id} board={board} car={{ ...c, note: `${c.note ?? 'Not ready'} · now on ${day(c.day).label}` }} />
              ))}
            </div>
          </>
        )}
      </section>
    </SidePanel>
  );
}
