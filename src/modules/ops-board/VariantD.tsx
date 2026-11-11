import { useState } from 'react';
import { PAGE, SegmentedTabs } from '../../components/ui/Page';
import { Panel, PILL } from '../../components/ui/Panel';
import { ATTENTION_EDGE, Tag } from '../../components/ui/Tag';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { STATUS } from '../../domain/statuses';
import type { OpsCar } from './fixtures';
import { useDealerBoard, type DealerBoard, type DealerFlag, type DealerRow, type Need, type Readiness } from './useDealerBoard';
import { ModuleHeader } from './parts';

// D · Dealers: the dealer relationship and the pickups, for Clutch's coordinator of the dealer channel.
// Needs you holds only what a person has to settle, as alerts. Today's pickups and the dealer rows are read-only.
// Dispatch (trucks, routes, rosters) runs in the consumer ops tool; this page keeps the dealer in front.
// The look follows Back office: white panels with the heading inside, 16px text, outline pills, the yellow edge for
// anything that needs someone. Needs-you cards are alerts: the call itself happens on the phone, the card only offers Dismiss.

type Tab = 'dealers' | 'planning';

export function VariantD() {
  const board = useDealerBoard();
  const [tab, setTab] = useState<Tab>('dealers');
  // Dismiss takes an alert off Jordan's list for this visit (one line with Undo stays); nothing else changes.
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const needs = board.needs.filter((n) => !dismissed.has(n.key));
  const toggle = (key: string) =>
    setDismissed((d) => {
      const next = new Set(d);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="min-h-screen bg-canvas py-8">
      <div className={PAGE}>
        <ModuleHeader title={tab === 'dealers' ? 'Dealers' : 'Planning'} right={<Tabs tab={tab} onChange={setTab} count={needs.length} />} />
        {tab === 'dealers' ? (
          <div className="mt-6 space-y-4">
            <NeedsYou needs={board.needs} dismissed={dismissed} onToggle={toggle} />
            <TodayPickups board={board} />
            <DealerTable board={board} />
          </div>
        ) : (
          <Planning board={board} />
        )}
      </div>
    </div>
  );
}

function Tabs({ tab, onChange, count }: { tab: Tab; onChange: (t: Tab) => void; count: number }) {
  return (
    <SegmentedTabs
      items={[
        ['dealers', 'Dealers', count],
        ['planning', 'Planning'],
      ]}
      value={tab}
      onChange={onChange}
    />
  );
}

/** The green check of the shared status language (StatusChip): done, nothing for anyone to do. */
function Tick() {
  return (
    <span aria-hidden className="font-bold text-success">
      ✓
    </span>
  );
}

/** Plain status text with the green check: what the system already did. */
function Auto({ children }: { children: string }) {
  return (
    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
      <Tick /> {children}
    </p>
  );
}

// ---- Needs you: alerts only --------------------------------------------------------

function NeedsYou({ needs, dismissed, onToggle }: { needs: Need[]; dismissed: Set<string>; onToggle: (key: string) => void }) {
  const open = needs.filter((n) => !dismissed.has(n.key)).length;
  return (
    <Panel title="Needs you" count={open}>
      {needs.length === 0 ? (
        <p className="border-t border-line-light px-6 py-5 text-base text-muted">
          Nothing needs you. Every dealer is on track.
        </p>
      ) : (
        <div className="divide-y divide-line-light border-t border-line-light">
          {needs.map((n) => (
            dismissed.has(n.key) ? (
              <p key={n.key} className="flex flex-wrap items-center gap-x-2 px-6 py-3 text-sm text-muted">
                <span>Dismissed · {n.title}</span>
                <button type="button" className="font-medium text-ink underline hover:text-brand" onClick={() => onToggle(n.key)}>
                  Undo
                </button>
              </p>
            ) : (
              <NeedCard key={n.key} n={n} onDismiss={() => onToggle(n.key)} />
            )
          ))}
        </div>
      )}
    </Panel>
  );
}

function NeedCard({ n, onDismiss }: { n: Need; onDismiss: () => void }) {
  return (
    <article className={`grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center ${ATTENTION_EDGE}`}>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2">
          <Tag tone="attention">{n.tag}</Tag>
          <span className="text-base font-bold text-ink">{n.title}</span>
        </p>
        <p className="mt-1.5 max-w-[820px] text-base text-body">{n.detail}</p>
      </div>
      <button type="button" className={`${PILL} justify-self-start lg:justify-self-end`} onClick={onDismiss}>
        Dismiss
      </button>
    </article>
  );
}

// ---- Today's pickups: read-only ---------------------------------------------------

function TodayPickups({ board }: { board: DealerBoard }) {
  const today = board.days.find((d) => d.state === 'today');
  const stops = today ? board.dealers.filter((dl) => board.carsAt(dl.id, today.id).length) : [];
  const next = board.days.find((d) => d.state === 'planned');
  return (
    <Panel title={today ? `Today’s pickups · ${today.label}` : 'Today’s pickups'} aside={stops.length ? 'Trucks and routes live in dispatch' : undefined}>
      {!stops.length ? (
        <p className="border-t border-line-light px-6 py-4 text-base text-muted">No pickups today{next ? `. Next: ${next.label}` : ''}.</p>
      ) : (
        <div className="divide-y divide-line-light border-t border-line-light">
          {stops.map((dl) => (
            <TodayRow key={dl.id} board={board} dealerId={dl.id} dayId={today!.id} />
          ))}
        </div>
      )}
    </Panel>
  );
}

function TodayRow({ board, dealerId, dayId }: { board: DealerBoard; dealerId: string; dayId: string }) {
  const dl = board.dealers.find((d) => d.id === dealerId)!;
  const cars = board.carsAt(dealerId, dayId);
  const inspector = board.inspectorName(board.routeFor(dealerId, dayId)?.inspectorId ?? null);
  const live = board.live.filter((l) => l.dealer.id === dealerId);
  const count = (pred: (c: OpsCar) => boolean) => cars.filter(pred).length;
  const parts = [
    [count((c) => c.status === 'picked_up' || c.status === 'paid'), 'picked up'],
    [count((c) => c.status === 'awaiting_pickup'), 'to inspect'],
    [count((c) => c.status === 'reprice_pending'), 'waiting on a re-price'],
    [count((c) => c.status === 'not_ready'), 'not ready, moved a week'],
    [count((c) => c.status === 'declined'), 'stayed with the dealer'],
  ].filter(([n]) => n) as [number, string][];
  const escalated = live.some((l) => l.escalated);
  return (
    // Same columns as All dealers below: the status starts under "Next pickup", on one edge with that table.
    <div className={`grid gap-x-4 gap-y-2 px-6 py-4 ${COLS} ${escalated ? `${ATTENTION_EDGE} bg-nudge/50` : ''}`}>
      <div className="min-w-0">
        <p className="text-base font-medium text-ink">{dl.name}</p>
        <p className="text-sm text-muted">
          {inspector ? `${inspector} ${cars.some((c) => c.status === 'awaiting_pickup' || c.status === 'reprice_pending' || c.status === 'confirmed') ? 'on site' : 'done here'}` : 'No inspector yet'} · {cars.length} {cars.length === 1 ? 'car' : 'cars'}
        </p>
      </div>
      <div className="min-w-0 lg:col-span-6">
        <p className="text-base text-body">{parts.map(([n, l]) => `${n} ${l}`).join(' · ') || 'All cars handled'}</p>
        {live.map((l) => {
          const left = board.minutesTo(l.leaves);
          return (
            <div key={l.car.id} className="mt-1.5">
              <p className="text-sm text-ink">
                <span className="font-medium">{l.car.car}</span> re-priced {money(l.car.offer)} → {money(l.car.newPrice!)}, waiting on {l.director} ·{' '}
                {board.waitedMin(l.waitingSince)} min · {l.inspector} leaves ~{l.leaves}
                {left > 0 ? ` (${left} min)` : ''}
                {l.escalated ? ' · in Needs you' : ''}
              </p>
            </div>
          );
        })}
        {!inspector ? (
          <Auto>Flagged to dispatch</Auto>
        ) : (
          !live.length && !!cars.length && cars.every((c) => STATUS[c.status].tone !== 'attention') && <Auto>On track</Auto>
        )}
      </div>
    </div>
  );
}

// ---- Dealers: the relationship, read-only ------------------------------------------

const COLS = 'lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_76px_88px_92px_24px]';

function DealerTable({ board }: { board: DealerBoard }) {
  const [open, setOpen] = useState<string | null>(null);
  const flagged = board.rows.filter((r) => r.flags.some((f) => f.kind !== 'health')).length;
  return (
    <section>
      <Panel
        title="All dealers"
        aside={`${flagged ? `${flagged} of ${board.rows.length} with something in motion · listed first` : 'Every dealer on track'} · track record over 90 days`}
      >
        <div className={`hidden border-y border-line-light px-6 py-3 text-sm font-medium text-muted lg:grid lg:gap-4 ${COLS}`}>
          <span>Dealer</span>
          <span>Next pickup</span>
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
      </Panel>
      <p className="mt-3 text-sm text-muted">
        Re-price: share of inspected cars re-priced on the lot (all dealers {board.avgReprice}%). Acceptance: offers the dealer took. Days to cash: pickup to
        payment.
      </p>
    </section>
  );
}

function DealerRowView({ board, row, open, onToggle }: { board: DealerBoard; row: DealerRow; open: boolean; onToggle: () => void }) {
  const { dealer: dl, health, nextRun, counts } = row;
  const flaggedCars = new Set(row.flags.map((f) => f.carId).filter(Boolean));
  // The live re-price shows under Today's pickups and the track record under Needs you; the row carries the week.
  const weekFlags = row.flags.filter((f) => f.kind !== 'live' && f.kind !== 'health');
  const summary = systemSummary(weekFlags, row.dispatchNote);
  return (
    <div className="border-t border-line-light">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
        className={`grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 px-6 py-4 hover:bg-canvas lg:items-center ${COLS}`}
      >
        <div className="min-w-0">
          <p className="text-base font-medium text-ink">{dl.name}</p>
          <p className="text-sm text-muted">{dl.contact}</p>
          <p className="text-sm text-muted">{dl.director}, Sales Director</p>
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
          <Metric label="Re-price" value={`${health.repriceRate}%`} flag={health.repriceRate >= board.repriceBar} />
          <Metric label="Acceptance" value={`${health.acceptRate}%`} flag={health.acceptRate < 60} />
          <Metric label="Days to cash" value={health.daysToCash.toFixed(1)} flag={health.daysToCash > 5} />
        </div>
        <Chevron open={open} className="hidden justify-self-end lg:block" />
        {summary && (
          <p className="col-span-full -mt-1 flex items-start gap-1.5 text-sm text-muted">
            <Tick /> <span>{summary}</span>
          </p>
        )}
      </div>

      {open && (
        <div className="border-t border-line-light bg-canvas px-6 py-4">
          {row.cars.length ? (
            <ul className="overflow-hidden rounded-card border border-line bg-white">
              {row.cars.map((c) => (
                <CarRow key={c.id} board={board} car={c} flagged={flaggedCars.has(c.id)} />
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
  ready: 'bg-success',
  unconfirmed: 'bg-white border-[1.5px] border-success',
  not_on_lot: 'bg-white border-[1.5px] border-dashed border-ink',
  expiring: 'bg-warning',
  not_ready: 'bg-warning',
  offer: 'bg-white border border-subtle',
  // Picked up reads as finished, apart from the green ready dot it used to share.
  done: 'bg-muted',
  closed: 'bg-line',
};

function Dot({ r, title }: { r: Readiness; title?: string }) {
  return <span title={title} className={`inline-block size-2.5 shrink-0 rounded-full ${readinessDot[r]}`} />;
}

function ReadinessCounts({ counts }: { counts: DealerRow['counts'] }) {
  const items: [Readiness, number, string][] = [
    ['ready', counts.ready, 'ready'],
    ['unconfirmed', counts.unconfirmed, 'not confirmed by the dealer'],
    ['not_on_lot', counts.notOnLot, 'not on the lot yet'],
    ['expiring', counts.expiring, 'offer ends before run'],
    ['not_ready', counts.notReady, 'not ready on the last run'],
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

/** The collapsed row's one line: what the system already handled at this dealer, nothing per car. */
function systemSummary(flags: DealerFlag[], dispatchNote: string | null): string {
  const parts: string[] = [];
  const moved = flags.filter((f) => f.kind === 'rolls').length;
  if (moved) parts.push(`${moved} ${moved === 1 ? 'car' : 'cars'} moved to a later run`);
  if (dispatchNote) parts.push(`${dispatchNote}, flagged to dispatch`);
  return parts.join(' · ');
}

function CarRow({ board, car, flagged }: { board: DealerBoard; car: OpsCar; flagged: boolean }) {
  const { day, dayLabel } = board;
  const r = board.readiness(car);
  const lot = car.onLotFrom && car.onLotFrom > board.today ? `On the lot from ${dayLabel(car.onLotFrom)}` : null;
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
        {!lot && r === 'unconfirmed' && <span className="block text-caption text-muted">{car.missing ?? 'Dealer hasn’t confirmed it’s ready'}</span>}
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
  ['unconfirmed', 'Not confirmed by the dealer'],
  ['not_on_lot', 'Not on the lot yet'],
  ['offer', 'Offer out'],
  ['expiring', 'Needs the dealer'],
  ['done', 'Picked up'],
  ['closed', 'Declined'],
];

function Planning({ board }: { board: DealerBoard }) {
  return (
    <div className="mt-6">
      <Panel title="Cars per dealer and pickup day" aside="Trucks, routes and inspectors live in dispatch">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-6 pb-4 text-sm text-muted">
          {PLAN_LEGEND.map(([r, l]) => (
            <li key={r} className="flex items-center gap-1.5">
              <Dot r={r} /> {l}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-[minmax(120px,1.1fr)_repeat(4,minmax(0,1fr))] overflow-hidden rounded-b-panel border-t border-line">
          <div className="border-b border-line px-6 py-3 text-sm font-medium text-muted">Dealer</div>
          {board.days.map((d) => (
            <div key={d.id} className={`border-b border-l border-line px-3 py-3 text-ink sm:px-4 ${d.state === 'today' ? 'bg-canvas shadow-[inset_0_3px_0_0_var(--color-ink)]' : ''}`}>
              <p className="text-sm font-bold">{d.label}</p>
              <p className={`text-caption ${d.state === 'today' ? 'font-medium text-ink' : 'text-muted'}`}>
                {d.state === 'done' ? 'Done' : d.state === 'today' ? 'Today' : 'Planned'}
              </p>
            </div>
          ))}
          {board.dealers.map((dl) => (
            <PlanRow key={dl.id} board={board} dealerId={dl.id} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PlanRow({ board, dealerId }: { board: DealerBoard; dealerId: string }) {
  const dl = board.dealers.find((d) => d.id === dealerId)!;
  const { dayLabel } = board;
  return (
    <>
      <div className="border-b border-line px-6 py-4">
        <p className="text-sm font-bold text-ink">{dl.name}</p>
        <p className="text-caption text-muted">{dl.runDay === 'Thu' ? 'Thursdays' : 'Tuesdays'}</p>
      </div>
      {board.days.map((d) => {
        const cars = board.carsAt(dealerId, d.id);
        const today = d.state === 'today' ? 'bg-canvas' : '';
        if (!cars.length) {
          return (
            <div key={d.id} className={`border-b border-l border-line px-3 py-4 text-caption text-subtle sm:px-4 ${today}`}>
              {dl.runDay === d.weekday ? 'No cars' : ''}
            </div>
          );
        }
        const rs = cars.map(board.readiness);
        const notOnLot = rs.filter((r) => r === 'not_on_lot').length;
        const needs = rs.filter((r) => r === 'expiring' || r === 'not_ready').length;
        // Cars sold onto the run, picked up ones included; offers still out are dots, counted apart.
        const offers = rs.filter((r) => r === 'offer' || r === 'expiring').length;
        const sold = cars.length - offers;
        return (
          <div key={d.id} className={`border-b border-l border-line px-3 py-4 sm:px-4 ${today}`}>
            <p className="text-sm font-bold text-ink">
              {sold} {sold === 1 ? 'car' : 'cars'}
              {offers > 0 && <span className="font-normal text-muted"> · {offers} {offers === 1 ? 'offer' : 'offers'} out</span>}
            </p>
            <p className="mt-2 flex flex-wrap gap-1.5">
              {cars.map((c, i) => (
                <Dot key={c.id} r={rs[i]} title={`${c.car}: ${rs[i] === 'not_on_lot' && c.onLotFrom ? `on the lot from ${dayLabel(c.onLotFrom)}` : rs[i].replace(/_/g, ' ')}`} />
              ))}
            </p>
            {(notOnLot > 0 || needs > 0) && (
              <p className="mt-2 text-caption text-body">
                {[notOnLot && `${notOnLot} not on the lot`, needs && `${needs} ${needs === 1 ? 'needs' : 'need'} the dealer`].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        );
      })}
    </>
  );
}
