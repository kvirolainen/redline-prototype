import { useState } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import { Button } from '../../components/ui/Button';
import { money } from '../../domain/format';
import { DAYS, DEALERS, TODAY_DATE, type OpsCar } from './fixtures';
import { day } from './useOpsBoard';
import { dayLabel, readiness, useDealerBoard, type DealerBoard, type DealerFlag, type DealerRow, type LiveReprice, type Readiness } from './useDealerBoard';
import { Check, ModuleHeader, Toast } from './parts';

// D · Dealers: only what changes when the seller is a dealer. Dispatch (trucks, routes, rosters)
// runs in the consumer ops tool; this page keeps the dealer in front: who is blocking what, what it
// costs, and how each dealer's track record looks.

type Tab = 'dealers' | 'planning';

export function VariantD() {
  const board = useDealerBoard();
  const [tab, setTab] = useState<Tab>('dealers');

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <ModuleHeader title={tab === 'dealers' ? 'Dealers' : 'Planning'} right={<Tabs tab={tab} onChange={setTab} />} />
        {tab === 'dealers' ? (
          <>
            <OnTheLot board={board} />
            <DealerTable board={board} />
          </>
        ) : (
          <Planning board={board} />
        )}
      </div>
      <Toast log={board.log} />
    </div>
  );
}

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: [Tab, string][] = [
    ['dealers', 'Dealers'],
    ['planning', 'Planning'],
  ];
  return (
    <div role="tablist" className="inline-flex rounded-pill border border-line bg-white p-1">
      {items.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          onClick={() => onChange(id)}
          className={`h-8 rounded-pill px-4 text-sm font-medium transition-colors ${tab === id ? 'bg-ink text-white' : 'text-body hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ---- On the lot now ---------------------------------------------------------

function OnTheLot({ board }: { board: DealerBoard }) {
  if (!board.live.length) {
    return (
      <p className="mt-6 flex items-center gap-2 rounded-card border border-line bg-white px-4 py-3 text-sm text-body">
        <Check /> Nothing waiting on a dealer's lot right now.
      </p>
    );
  }
  return (
    <section className="mt-6 overflow-hidden rounded-panel border border-line bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3">
        <h2 className="text-title font-bold text-ink">On the lot now</h2>
        <p className="text-caption text-muted">Inspector on site, re-price waiting on the dealer's director</p>
      </div>
      {board.live.map((l) => (
        <LiveRow key={l.car.id} board={board} l={l} />
      ))}
    </section>
  );
}

function LiveRow({ board, l }: { board: DealerBoard; l: LiveReprice }) {
  const key = `live-${l.car.id}`;
  const waited = board.waitedMin(l.waitingSince);
  const left = board.minutesTo(l.leaves);
  const span = Math.max(1, waited + Math.max(left, 0));
  const sent = board.reminded[key];
  return (
    <div className="grid gap-4 border-b border-line-light px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">{l.car.car}</p>
        <p className="text-caption text-muted">
          {l.dealer.name} · {l.inspector} on site
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-body">
          <span className="line-through">{money(l.car.offer)}</span> → <span className="font-bold text-ink">{money(l.car.newPrice!)}</span>
        </p>
        <p className="text-caption text-muted">{l.car.reason}</p>
      </div>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
          <span>
            Waiting on <span className="font-bold">{l.director}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-nudge px-2.5 py-0.5 text-caption font-medium tabular-nums">
            <span className="size-1.5 animate-pulse rounded-full bg-warning" />
            {waited} min
          </span>
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-line-light" aria-hidden>
          <div className="h-full rounded-full bg-warning" style={{ width: `${Math.min(100, (waited / span) * 100)}%` }} />
        </div>
        <p className="mt-1.5 text-caption text-muted">
          Since {l.waitingSince} · {l.inspector} leaves ~{l.leaves}
          {left > 0 ? ` (${left} min)` : ''} · otherwise a second trip
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {sent ? (
          <span className="inline-flex h-8 items-center gap-1.5 text-caption font-medium text-body">
            <Check /> Reminded {sent}
          </span>
        ) : (
          <Button variant="dark-small" onClick={() => board.remind(key, l.director, l.dealer.name)}>
            Remind {l.director}
          </Button>
        )}
        <OutlinePill onClick={() => board.call(l.director, l.dealer.name)}>Call</OutlinePill>
      </div>
    </div>
  );
}

function OutlinePill({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center rounded-pill border border-line bg-white px-3 text-caption font-medium whitespace-nowrap text-ink hover:border-ink"
    >
      {children}
    </button>
  );
}

// ---- Dealer table -------------------------------------------------------------

const COLS = 'lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_76px_88px_92px_24px]';

function DealerTable({ board }: { board: DealerBoard }) {
  const [open, setOpen] = useState<string | null>(null);
  const attention = board.rows.filter((r) => r.flags.length).length;
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-title font-bold text-ink">This week</h2>
        <p className="text-caption text-muted">
          {attention ? `${attention} of ${board.rows.length} dealers need a nudge · listed first` : 'Every dealer is on track'} · health over 90 days
        </p>
      </div>
      <div className="mt-3 overflow-hidden rounded-panel border border-line bg-white">
        <div className={`hidden border-b border-line px-5 py-3 text-caption font-medium text-muted lg:grid lg:gap-4 ${COLS}`}>
          <span>Dealer</span>
          <span>Next run</span>
          <span>Cars on the way</span>
          <span className="text-right">Re-price</span>
          <span className="text-right">Acceptance</span>
          <span className="text-right">Days to cash</span>
          <span />
        </div>
        {board.rows.map((r) => (
          <DealerRowView
            key={r.dealer.id}
            board={board}
            row={r}
            open={open === r.dealer.id}
            onToggle={() => setOpen((o) => (o === r.dealer.id ? null : r.dealer.id))}
          />
        ))}
      </div>
      <p className="mt-3 text-caption text-muted">
        Re-price: share of inspected cars re-priced on the lot (all dealers {board.avgReprice}%). Acceptance: offers the dealer took. Days to cash: pickup to
        payment.
      </p>
    </section>
  );
}

function DealerRowView({ board, row, open, onToggle }: { board: DealerBoard; row: DealerRow; open: boolean; onToggle: () => void }) {
  const { dealer: dl, health, nextRun, counts } = row;
  const flaggedCars = new Set(row.flags.map((f) => f.carId).filter(Boolean));
  // The live re-price already leads the page in "On the lot now"; the row only carries week-level items.
  const weekFlags = row.flags.filter((f) => f.kind !== 'live');
  return (
    <div className={`border-b border-line last:border-b-0 ${row.flags.length ? 'shadow-[inset_3px_0_0_0_var(--color-warning)]' : ''}`}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
        className={`grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 px-5 py-4 hover:bg-canvas lg:items-center ${COLS}`}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{dl.name}</p>
          <p className="text-caption text-muted">{dl.contact}</p>
          <p className="text-caption text-muted">{dl.director}, Sales Director</p>
        </div>
        <div className="col-start-2 row-start-1 flex items-start gap-3 lg:col-start-auto lg:row-start-auto lg:block">
          <div className="text-right lg:text-left">
            <p className="text-sm font-medium text-ink">{nextRun ? (nextRun.state === 'today' ? 'Today' : nextRun.label) : '—'}</p>
            <p className="text-caption text-muted">
              {row.nextRunCars} {row.nextRunCars === 1 ? 'car' : 'cars'} · {dl.runDay === 'Thu' ? 'Thursdays' : 'Tuesdays'}
            </p>
          </div>
          <Chevron open={open} className="mt-1 lg:hidden" />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <ReadinessCounts counts={counts} />
        </div>
        <div className="col-span-2 grid grid-cols-3 gap-4 lg:contents">
          <Metric label="Re-price" value={`${health.repriceRate}%`} flag={health.repriceRate >= board.avgReprice * 2} />
          <Metric label="Acceptance" value={`${health.acceptRate}%`} flag={health.acceptRate < 60} />
          <Metric label="Days to cash" value={health.daysToCash.toFixed(1)} flag={health.daysToCash > 5} />
        </div>
        <Chevron open={open} className="hidden justify-self-end lg:block" />
      </div>

      {(weekFlags.length > 0 || row.dispatchNote) && (
        <ul className="space-y-2 px-5 pb-4">
          {weekFlags.map((f) => (
            <FlagLine key={f.key} board={board} row={row} f={f} />
          ))}
          {row.dispatchNote && (
            <li className="flex flex-wrap items-center gap-x-2 text-caption text-muted">
              <span>{row.dispatchNote}</span>
              <button type="button" onClick={() => board.openInDispatch(row.dispatchNote!)} className="font-medium text-ink underline underline-offset-2">
                Open in dispatch
              </button>
            </li>
          )}
        </ul>
      )}

      {open && (
        <div className="border-t border-line-light bg-canvas px-5 py-4">
          {row.cars.length ? (
            <ul className="overflow-hidden rounded-card border border-line bg-white">
              {row.cars.map((c) => (
                <CarRow key={c.id} car={c} flagged={flaggedCars.has(c.id)} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No cars on upcoming runs.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Chevron({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={`size-3 text-muted transition-transform ${open ? 'rotate-180' : ''} ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}

function Metric({ label, value, flag }: { label: string; value: string; flag?: boolean }) {
  return (
    <div className="lg:text-right">
      <p className="text-caption text-muted lg:hidden">{label}</p>
      <p className={`text-sm tabular-nums ${flag ? 'font-bold text-ink' : 'text-body'}`}>
        {flag ? <span className="rounded-pill bg-nudge px-2 py-0.5">{value}</span> : value}
      </p>
    </div>
  );
}

const readinessDot: Record<Readiness, string> = {
  ready: 'bg-ink',
  not_on_lot: 'bg-white border-[1.5px] border-dashed border-ink',
  expiring: 'bg-warning',
  not_ready: 'bg-warning',
  offer: 'bg-white border border-subtle',
  done: 'bg-success',
  closed: 'bg-line',
};

function Dot({ r, title }: { r: Readiness; title?: string }) {
  return <span title={title} className={`inline-block size-2.5 shrink-0 rounded-full ${readinessDot[r]}`} />;
}

function ReadinessCounts({ counts }: { counts: DealerRow['counts'] }) {
  const items: [Readiness, number, string][] = [
    ['ready', counts.ready, 'ready'],
    ['not_on_lot', counts.notOnLot, 'not on the lot yet'],
    ['expiring', counts.expiring, 'offer ends before run'],
  ];
  const shown = items.filter(([, n]) => n > 0);
  if (!shown.length) return <p className="text-caption text-subtle">No open cars</p>;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {shown.map(([r, n, label]) => (
        <li key={r} className="flex items-center gap-1.5 text-sm text-body">
          <Dot r={r} />
          <span>
            <span className="font-bold text-ink">{n}</span> {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

const flagTag: Record<DealerFlag['kind'], string> = {
  live: 'On the lot now',
  expiring: 'Offer ending',
  rolls: 'Not on the lot yet',
  rolled: 'Rolled',
  health: 'Track record',
};

function FlagLine({ board, row, f }: { board: DealerBoard; row: DealerRow; f: DealerFlag }) {
  const sent = board.reminded[f.key];
  const action =
    f.kind === 'health' ? (
      <OutlinePill onClick={() => board.call(f.who, row.dealer.name)}>{`Call ${f.who}`}</OutlinePill>
    ) : sent ? (
      <span className="inline-flex h-8 items-center gap-1.5 text-caption font-medium text-body">
        <Check /> Reminded {sent}
      </span>
    ) : (
      <OutlinePill onClick={() => board.remind(f.key, f.who, row.dealer.name)}>
        {f.kind === 'rolls' ? `Confirm date with ${f.who}` : `Remind ${f.who}`}
      </OutlinePill>
    );
  return (
    <li className="flex flex-col gap-2 rounded-card border border-line-light bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-ink">
          <span className={`mr-2 inline-block rounded-pill px-2 py-0.5 text-caption font-medium ${f.kind === 'live' ? 'bg-ink text-white' : 'bg-nudge text-ink'}`}>
            {flagTag[f.kind]}
          </span>
          {f.title}
        </p>
        <p className="mt-0.5 text-caption text-muted">
          {f.kind === 'health' ? 'Raise with' : 'Waiting on'} <span className="font-medium text-body">{f.who}</span> · {f.cost}
        </p>
      </div>
      <div className="shrink-0">{action}</div>
    </li>
  );
}

function CarRow({ car, flagged }: { car: OpsCar; flagged: boolean }) {
  const r = readiness(car);
  const lot = car.onLotFrom && car.onLotFrom > TODAY_DATE ? `On the lot from ${dayLabel(car.onLotFrom)}` : null;
  return (
    <li className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-line-light px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_150px] ${flagged ? 'bg-nudge/40' : ''}`}>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <Dot r={r} /> <span className="truncate">{car.car}</span>
        </p>
        <p className="pl-[18px] text-caption text-muted">
          {car.vin.slice(-6)} · {car.km.toLocaleString('en-CA')} km
        </p>
      </div>
      <p className="col-start-1 pl-[18px] text-caption text-body md:col-start-auto md:pl-0 md:text-sm">
        {day(car.day).state === 'today' ? 'Today' : day(car.day).label}
        {lot && <span className="block text-caption font-medium text-ink">{lot}</span>}
      </p>
      <p className="col-start-1 pl-[18px] text-caption text-body md:col-start-auto md:pl-0 md:text-sm">
        {car.newPrice ? (
          <>
            <span className="line-through">{money(car.offer)}</span> <span className="font-bold text-ink">{money(car.newPrice)}</span>
          </>
        ) : (
          money(car.offer)
        )}
        {car.expires && car.status === 'offered' && <span className="block text-caption text-muted">Offer ends {car.expires}</span>}
      </p>
      <div className="col-start-2 row-span-3 row-start-1 justify-self-end md:col-start-auto md:row-span-1 md:row-start-auto">
        <StatusChip status={car.status} />
      </div>
    </li>
  );
}

// ---- Planning -----------------------------------------------------------------

const PLAN_LEGEND: [Readiness, string][] = [
  ['ready', 'Ready'],
  ['not_on_lot', 'Not on the lot yet'],
  ['offer', 'Offer out'],
  ['expiring', 'Needs the dealer'],
  ['done', 'Picked up'],
  ['closed', 'Declined'],
];

function Planning({ board }: { board: DealerBoard }) {
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="text-sm text-muted">Cars per dealer and run day. Trucks, routes and inspectors live in dispatch.</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted">
          {PLAN_LEGEND.map(([r, l]) => (
            <li key={r} className="flex items-center gap-1.5">
              <Dot r={r} /> {l}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 overflow-hidden rounded-panel border border-line bg-white">
        <div className="grid grid-cols-[minmax(120px,1.1fr)_repeat(4,minmax(0,1fr))]">
          <div className="border-b border-line px-4 py-3 text-caption font-medium text-muted">Dealer</div>
          {DAYS.map((d) => (
            <div key={d.id} className={`border-b border-l border-line px-3 py-3 sm:px-4 ${d.state === 'today' ? 'bg-ink text-white' : ''}`}>
              <p className="text-sm font-bold">{d.label}</p>
              <p className={`text-caption ${d.state === 'today' ? 'text-white/70' : 'text-muted'}`}>
                {d.state === 'done' ? 'Done' : d.state === 'today' ? 'Today' : 'Planned'}
              </p>
            </div>
          ))}
          {DEALERS.map((dl) => (
            <PlanRow key={dl.id} board={board} dealerId={dl.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanRow({ board, dealerId }: { board: DealerBoard; dealerId: string }) {
  const dl = DEALERS.find((d) => d.id === dealerId)!;
  return (
    <>
      <div className="border-b border-line px-4 py-4">
        <p className="text-sm font-bold text-ink">{dl.name}</p>
        <p className="text-caption text-muted">{dl.runDay === 'Thu' ? 'Thursdays' : 'Tuesdays'}</p>
      </div>
      {DAYS.map((d) => {
        const cars = board.carsAt(dealerId, d.id);
        const today = d.state === 'today' ? 'bg-canvas' : '';
        if (!cars.length) {
          return (
            <div key={d.id} className={`border-b border-l border-line px-3 py-4 text-caption text-subtle sm:px-4 ${today}`}>
              {dl.runDay === d.weekday ? 'No cars' : ''}
            </div>
          );
        }
        const rs = cars.map(readiness);
        const notOnLot = rs.filter((r) => r === 'not_on_lot').length;
        const needs = rs.filter((r) => r === 'expiring' || r === 'not_ready').length;
        return (
          <div key={d.id} className={`border-b border-l border-line px-3 py-4 sm:px-4 ${today}`}>
            <p className="text-sm font-bold text-ink">
              {cars.length} {cars.length === 1 ? 'car' : 'cars'}
            </p>
            <p className="mt-2 flex flex-wrap gap-1.5">
              {cars.map((c, i) => (
                <Dot key={c.id} r={rs[i]} title={`${c.car}: ${rs[i] === 'not_on_lot' && c.onLotFrom ? `on the lot from ${dayLabel(c.onLotFrom)}` : rs[i].replace(/_/g, ' ')}`} />
              ))}
            </p>
            {(notOnLot > 0 || needs > 0) && (
              <p className="mt-2 text-caption text-body">
                {[notOnLot && `${notOnLot} not on the lot`, needs && `${needs} needs the dealer`].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        );
      })}
    </>
  );
}
