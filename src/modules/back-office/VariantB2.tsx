import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { PAGE, PageHeader, SegmentedTabs } from '../../components/ui/Page';
import { ATTENTION_EDGE, Tag } from '../../components/ui/Tag';
import { money } from '../../domain/format';
import { STATUS } from '../../domain/statuses';
import type { BackOfficeTab } from '../../shell/views';
import { checksOf, MONTHS, READY_CHECKS, type BackOfficeCar, type ReadyCheck as ReadyCheckId } from './fixtures';
import { km } from './format';
import { CarDetail, DecidedNote, Drawer, RepriceDecision } from './parts';
import { computeStats, useBackOffice, useBackOfficeEnv, type BackOffice } from './useBackOffice';

export type { BackOfficeTab };

// Back office B2: one page for the dealership, two tabs.
// Pickups (the default): where every car is, for both people; Maria works it each week.
// Overview: Dave's re-price inbox and the results.
// Anything urgent gets the yellow edge wherever it shows, and each tab counts its urgent items.
// The look follows Trade-in: white panels with the heading inside, 16px text, outline pills, black only for the one
// main decision on a card.

// ───────────────────────── Shared ─────────────────────────

function Panel({ title, count, aside, children }: { title: string; count?: number; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-panel border border-line bg-white">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-8 pt-6 pb-4">
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
const PILL = 'inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-pill border border-line bg-white px-5 text-sm font-medium text-ink hover:border-ink';

/** Urgent now: a re-price the truck is waiting on, an offer about to lapse, a car not ready close to its check deadline. */
function isUrgent(car: BackOfficeCar, nextPickup: string, checkDueSoon: boolean) {
  if (car.status === 'reprice_pending') return true;
  if (car.status === 'offered' && car.expiresSoon && !car.fromReview) return true;
  return checkDueSoon && car.pickup === nextPickup && !car.ready && (car.status === 'awaiting_pickup' || car.status === 'not_ready');
}

function useCounts(office: BackOffice) {
  const { nextPickup, checkDueSoon = false } = useBackOfficeEnv();
  return {
    pickups: office.cars.filter((c) => isUrgent(c, nextPickup, checkDueSoon)).length,
    overview: office.cars.filter((c) => c.status === 'reprice_pending').length,
  };
}

function Tabs({ tab, onChange, counts }: { tab: BackOfficeTab; onChange: (t: BackOfficeTab) => void; counts: { pickups: number; overview: number } }) {
  const label = (text: string, n: number) => (n ? `${text} · ${n}` : text);
  return (
    <SegmentedTabs
      items={[
        ['pickups', label('Pickups', counts.pickups)],
        ['overview', label('Overview', counts.overview)],
      ]}
      value={tab}
      onChange={onChange}
    />
  );
}

// ───────────────────────── Pickups: where every car is ─────────────────────────

/** Mark ready opens the three checks; the car is ready only when all are ticked. A stray click just opens it, and a
 *  click outside closes it with nothing changed, so readiness can't flip by accident. */
function ReadyCheck({ car, office }: { car: BackOfficeCar; office: BackOffice }) {
  const saved = checksOf(car);
  const savedKey = saved.join();
  const [open, setOpen] = useState(false);
  const [ticks, setTicks] = useState<ReadyCheckId[]>(saved);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  // Someone else changed the check while it's open (another screen, Skip to next pickup day): start from theirs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setTicks(saved), [savedKey]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const all = saved.length === READY_CHECKS.length;
  const toggle = (id: ReadyCheckId) => setTicks((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const allTicked = ticks.length === READY_CHECKS.length;
  const changed = ticks.length !== saved.length || ticks.some((t) => !saved.includes(t));
  const action = allTicked ? 'Mark ready' : all ? 'Mark not ready' : 'Save';
  const save = () => {
    office.setReady(car.vin, READY_CHECKS.map((r) => r.id).filter((id) => ticks.includes(id)));
    close();
  };

  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setTicks(saved);
          setOpen(!open);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={PILL}
      >
        <span aria-hidden className={all ? 'font-bold text-success' : 'text-muted'}>
          {all ? '✓' : saved.length ? '◐' : '○'}
        </span>
        {all ? 'Ready' : saved.length ? `${saved.length} of ${READY_CHECKS.length} ready` : 'Mark ready'}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" tabIndex={-1} className="fixed inset-0 z-20 cursor-default" onClick={close} />
          <div role="dialog" aria-label={`Ready check: ${car.car}`} className="absolute top-full right-0 z-30 mt-2 w-80 rounded-panel border border-line bg-white p-5 text-left shadow-overlay">
            <p className="text-base font-bold text-ink">Ready for {car.pickup}?</p>
            <p className="mt-0.5 truncate text-sm text-muted">{car.car}</p>
            <ul className="mt-3 space-y-1">
              {READY_CHECKS.map((r, i) => (
                <li key={r.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-card px-2 py-2 text-base text-ink hover:bg-canvas">
                    <input type="checkbox" className="size-4 accent-ink" checked={ticks.includes(r.id)} onChange={() => toggle(r.id)} autoFocus={i === 0} />
                    {r.label}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted">A car that isn’t ready moves to the pickup after.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={close} className="h-10 px-4 text-sm font-medium text-body hover:underline">
                Cancel
              </button>
              <Button variant="primary" disabled={!changed} onClick={save} className="h-10 px-5 text-sm">
                {action}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type RowMode = 'ready' | 'offer' | 'status';

/** The grey middle column: what's missing, who priced it, what happened. */
function rowDetail(car: BackOfficeCar, mode: RowMode): ReactNode {
  if (car.status === 'reprice_pending' && car.reprice)
    return (
      <span className="text-ink">
        Re-priced {money(car.reprice.from)} → {money(car.reprice.to)} · {car.reprice.waiting.toLowerCase()}
      </span>
    );
  if (car.status === 'kept') return 'Kept for your lot';
  if (mode === 'ready') {
    if (car.ready) return 'On the lot, both keys, ownership papers';
    // A car Clutch's inspector left behind says why; otherwise the checks that are still missing.
    if (car.status === 'not_ready' && car.note) return <span className="text-ink">{car.note}</span>;
    const ticked = checksOf(car);
    const missing = READY_CHECKS.filter((r) => !ticked.includes(r.id)).map((r) => r.missing).join(', ');
    return ticked.length && missing ? <span className="text-ink">{missing[0].toUpperCase() + missing.slice(1)}</span> : 'Not checked yet';
  }
  if (car.status === 'appraising') return 'With a Clutch appraiser';
  if (car.status === 'offered' && car.fromReview) return 'Priced by a Clutch appraiser';
  if (car.status === 'offered' && car.expiresSoon) return <Tag>{car.expires ? `Expires ${car.expires}` : 'Expires soon'}</Tag>;
  if (car.status === 'offered') return `Holds until ${car.expires}`;
  if (car.status === 'expired') return 'The offer ran out';
  return car.note ?? '';
}

/** Plain status text for the right column; a green check once it's paid. */
function StatusText({ car }: { car: BackOfficeCar }) {
  const s = STATUS[car.status];
  return (
    <span className={`flex items-center gap-2 text-sm ${s.tone === 'closed' ? 'text-muted' : 'text-body'}`}>
      {s.tone === 'done' && (
        <span aria-hidden className="font-bold text-success">
          ✓
        </span>
      )}
      {s.label}
    </span>
  );
}

function RowAction({ car, office, mode, onOpen }: { car: BackOfficeCar; office: BackOffice; mode: RowMode; onOpen: () => void }) {
  if (car.status === 'reprice_pending')
    return (
      <button type="button" onClick={onOpen} className={PILL}>
        Review re-price
      </button>
    );
  if (mode === 'ready' && car.status !== 'kept') return <ReadyCheck car={car} office={office} />;
  if (mode === 'offer') {
    if (car.status === 'appraising') return <span className="text-sm font-medium text-ink">Offer by 3:00 pm</span>;
    if (car.status === 'offered' && car.fromReview)
      return (
        <button type="button" onClick={() => office.acceptOffer(car.vin)} className={PILL}>
          Accept {money(car.offer)}
        </button>
      );
    if (car.status === 'offered' && car.expiresSoon)
      return (
        <button type="button" onClick={() => office.refreshOffer(car.vin)} className={PILL}>
          Refresh for 7 days
        </button>
      );
    if (car.status === 'offered') return <span className="text-sm text-muted">Waiting on the customer</span>;
    if (car.status === 'expired')
      return (
        <button type="button" onClick={() => office.refreshOffer(car.vin)} className={PILL}>
          Refresh offer
        </button>
      );
  }
  return <StatusText car={car} />;
}

function CarRow({ car, office, onOpen, mode, urgent }: { car: BackOfficeCar; office: BackOffice; onOpen: () => void; mode: RowMode; urgent: boolean }) {
  return (
    <div className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_100px_210px_12px] items-center gap-6 px-8 py-4 ${urgent ? `${ATTENTION_EDGE} bg-nudge/50` : 'hover:bg-canvas'}`}>
      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <span className="block truncate text-base font-medium text-ink">{car.car}</span>
        <span className="block truncate text-sm text-muted">
          {car.vin.slice(-6)} · {km(car.km)}
        </span>
      </button>
      <span className="min-w-0 truncate text-sm text-muted">{rowDetail(car, mode)}</span>
      <span className="text-right text-base font-bold text-ink">{car.status === 'appraising' ? '' : money(car.offer)}</span>
      <span className="flex justify-end">
        <RowAction car={car} office={office} mode={mode} onOpen={onOpen} />
      </span>
      <span className="text-subtle" aria-hidden>
        ›
      </span>
    </div>
  );
}

function Pickups({ office, onOpen }: { office: BackOffice; onOpen: (vin: string) => void }) {
  const { today: TODAY, nextPickup: NEXT_PICKUP, checkDueSoon = false } = useBackOfficeEnv();
  const next = office.nextRun;
  const going = next.filter((c) => c.status !== 'kept');
  const readyCount = going.filter((c) => c.ready).length;
  const groups: { title: string; aside: string; cars: BackOfficeCar[]; mode: RowMode }[] = [
    { title: `Next pickup · ${NEXT_PICKUP}`, aside: `${readyCount} of ${going.length} ready · check each car by Wed 5 pm`, cars: next, mode: 'ready' },
    { title: `Today’s pickup · ${TODAY}`, aside: '', cars: office.cars.filter((c) => c.pickup === TODAY && c.status !== 'declined'), mode: 'status' },
    {
      title: 'Open offers',
      aside: 'The customer hasn’t traded yet',
      cars: office.cars.filter((c) => c.status === 'offered' || c.status === 'appraising' || c.status === 'expired'),
      mode: 'offer',
    },
    { title: 'Paid', aside: '', cars: office.cars.filter((c) => c.status === 'paid'), mode: 'status' },
    { title: 'Stayed with you', aside: '', cars: office.cars.filter((c) => c.status === 'declined' || (c.status === 'kept' && c.pickup !== NEXT_PICKUP)), mode: 'status' },
  ];
  return (
    <div className="mt-6 space-y-4">
      {groups.map((g) =>
        g.cars.length ? (
          <Panel key={g.title} title={g.title} aside={g.aside || `${g.cars.length} ${g.cars.length === 1 ? 'car' : 'cars'}`}>
            <div className="divide-y divide-line-light border-t border-line-light">
              {g.cars.map((c) => (
                <CarRow key={c.vin} car={c} office={office} mode={g.mode} urgent={isUrgent(c, NEXT_PICKUP, checkDueSoon)} onOpen={() => onOpen(c.vin)} />
              ))}
            </div>
          </Panel>
        ) : null,
      )}
    </div>
  );
}

// ───────────────────────── Overview: Dave's re-prices, then the results ─────────────────────────

/** Re-prices waiting on the director. Cards stay after a decision, showing what happened, until the page is left;
 *  a new one (sent from the lot while the page is open) joins at the top. */
function NeedsYou({ office, onOpen }: { office: BackOffice; onOpen: (vin: string) => void }) {
  const pendingVins = office.cars.filter((c) => c.status === 'reprice_pending').map((c) => c.vin);
  const [seen, setSeen] = useState(() => pendingVins);
  const fresh = pendingVins.filter((v) => !seen.includes(v));
  if (fresh.length) setSeen([...fresh, ...seen]);
  const inbox = (fresh.length ? [...fresh, ...seen] : seen).filter((vin) => office.cars.some((c) => c.vin === vin));

  return (
    <Panel title="Needs you" count={pendingVins.length} aside={pendingVins.length ? 'Clutch’s inspector is on the lot, waiting for your answer' : undefined}>
      {inbox.length === 0 ? (
        <p className="border-t border-line-light px-8 py-5 text-base text-muted">
          Nothing right now. If Clutch’s inspection finds a difference on pickup day, the new price lands here for your call.
        </p>
      ) : (
        <div className="divide-y divide-line-light border-t border-line-light">
          {inbox.map((vin) => {
            const car = office.cars.find((c) => c.vin === vin)!;
            const pending = car.status === 'reprice_pending';
            return (
              <article key={vin} className={`px-8 py-6 ${pending ? ATTENTION_EDGE : ''}`}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-muted">{pending ? `Re-price at pickup · ${car.reprice?.waiting ?? ''}` : 'Done'}</p>
                    <h3 className="mt-0.5 truncate text-title font-bold text-ink">{car.car}</h3>
                  </div>
                  <button type="button" onClick={() => onOpen(vin)} className="shrink-0 text-sm font-medium text-ink underline">
                    Timeline
                  </button>
                </div>
                {pending ? (
                  <div className="max-w-[760px]">
                    <RepriceDecision car={car} onAccept={() => office.acceptReprice(vin)} onDecline={() => office.declineReprice(vin)} />
                  </div>
                ) : (
                  <DecidedNote car={car} />
                )}
              </article>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

/** Totals since Redline started at this dealer: earlier months as recorded, this month from the live cars. */
function results(office: BackOffice) {
  const now = computeStats(office.cars.filter((c) => !c.pickup.includes('Oct')));
  const repricedNow = office.cars.filter((c) => c.repriced && !c.pickup.includes('Oct')).length;
  const months = [...MONTHS, { month: 'Nov', sold: now.sold, aboveAuction: now.aboveAuction, daysToCash: now.daysToCash, repriced: repricedNow, soFar: true }];
  return {
    months,
    daysToCash: now.daysToCash,
    total: months.reduce((s, m) => s + m.aboveAuction, 0),
    cars: months.reduce((s, m) => s + m.sold, 0),
    repriced: months.reduce((s, m) => s + m.repriced, 0),
  };
}

/** The results as plain facts, so the director can trust them: no pitch, no estimates dressed up as his numbers. */
function Results({ office }: { office: BackOffice }) {
  const { months, total, cars, repriced, daysToCash } = results(office);
  const max = Math.max(...months.map((m) => m.aboveAuction));
  const stats: [string, string, string][] = [
    ['Cars sold', String(cars), 'picked up by Clutch'],
    ['Vs auction estimate', `+${money(total)}`, 'total, vs estimated auction net'],
    ['Days to payment', String(daysToCash), 'average, pickup to payment'],
    ['Re-priced at pickup', `${repriced} of ${cars}`, 'inspection changed the price'],
  ];
  return (
    <Panel title="Results" aside="Since August">
      <dl className="grid grid-cols-2 gap-y-5 border-t border-line-light px-8 py-5 xl:grid-cols-4">
        {stats.map(([label, value, hint]) => (
          <div key={label} className="min-w-0 pr-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 text-h4 font-bold text-ink">{value}</dd>
            <dd className="mt-0.5 text-sm text-muted">{hint}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-line-light px-8 pt-5 pb-6">
        <h3 className="text-base font-bold text-ink">By month</h3>
        <div className="mt-4 grid grid-cols-[48px_minmax(0,1fr)_56px_80px_80px] items-center gap-x-4 gap-y-3 text-base">
          <span />
          <span className="text-sm text-muted">Vs auction estimate</span>
          <span className="text-right text-sm text-muted">Cars</span>
          <span className="text-right text-sm text-muted">Paid in</span>
          <span className="text-right text-sm text-muted">Re-priced</span>
          {months.map((m) => (
            <div key={m.month} className="contents">
              <span className="font-medium text-ink">{m.month}</span>
              <span className="flex items-center gap-3">
                <span className={`h-3 rounded-xs ${'soFar' in m ? 'bg-subtle' : 'bg-ink'}`} style={{ width: `${(m.aboveAuction / max) * 65}%` }} />
                <span className="whitespace-nowrap text-body">
                  {money(m.aboveAuction)}
                  {'soFar' in m && <span className="text-muted"> so far</span>}
                </span>
              </span>
              <span className="text-right text-body">{m.sold}</span>
              <span className="text-right text-body">{m.daysToCash} days</span>
              <span className="text-right text-body">{m.repriced}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/** One glance at the pickups, so the director knows the week is on track without opening the list. */
function ThisWeek({ office, onTab }: { office: BackOffice; onTab: (t: BackOfficeTab) => void }) {
  const { today: TODAY, nextPickup: NEXT_PICKUP } = useBackOfficeEnv();
  const going = office.nextRun.filter((c) => c.status !== 'kept');
  const todays = office.cars.filter((c) => c.pickup === TODAY && c.status !== 'declined');
  const loaded = todays.filter((c) => c.status === 'picked_up' || c.status === 'paid').length;
  const offers = office.cars.filter((c) => c.status === 'offered' || c.status === 'appraising');
  const expiring = offers.filter((c) => c.expiresSoon && !c.fromReview).length;
  const lines: [string, string][] = [
    [`Today · ${TODAY}`, `${loaded} of ${todays.length} on the truck`],
    [`Next · ${NEXT_PICKUP}`, `${going.filter((c) => c.ready).length} of ${going.length} ready`],
    ['Open offers', `${offers.length}${expiring ? ` · ${expiring} expiring` : ''}`],
  ];
  return (
    <Panel
      title="This week"
      aside={
        <button type="button" onClick={() => onTab('pickups')} className="font-medium text-ink underline">
          See pickups
        </button>
      }
    >
      <dl className="divide-y divide-line-light border-t border-line-light">
        {lines.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 px-8 py-3 text-base">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function RepricedList({ office }: { office: BackOffice }) {
  const repricedCars = office.cars.filter((c) => c.repriced);
  return (
    <Panel title="Re-priced at pickup" aside="Latest">
      <ul className="divide-y divide-line-light border-t border-line-light">
        {repricedCars.map((c) => {
          const found = c.reprice?.items.map((i) => i.label.toLowerCase()).join(', ') ?? c.events.find((e) => e.kind === 'reprice')?.text.split('.')[0] ?? '';
          const outcome = c.status === 'reprice_pending' ? 'Waiting on you' : c.status === 'declined' ? 'Declined, stayed with you' : 'Accepted';
          return (
            <li key={c.vin} className="px-8 py-3">
              <p className="truncate text-base font-medium text-ink">{c.car}</p>
              <p className="truncate text-sm text-muted">
                <span className="text-body">{outcome}</span> · {found.toLowerCase()}
              </p>
            </li>
          );
        })}
        {repricedCars.length === 0 && <li className="px-8 py-3 text-base text-muted">None yet.</li>}
      </ul>
    </Panel>
  );
}

function Overview({ office, onOpen, onTab }: { office: BackOffice; onOpen: (vin: string) => void; onTab: (t: BackOfficeTab) => void }) {
  return (
    <div className="mt-6 space-y-4">
      <NeedsYou office={office} onOpen={onOpen} />
      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Results office={office} />
        <div className="space-y-4">
          <ThisWeek office={office} onTab={onTab} />
          <RepricedList office={office} />
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Page ─────────────────────────

/** B2 · Pickups first, Overview second. In the app the shell owns the tab, so each tab has its own URL; in Storybook
 *  it's local. */
export function VariantB2({ tab: tabProp, onTabChange, initialTab = 'pickups' }: { tab?: BackOfficeTab; onTabChange?: (t: BackOfficeTab) => void; initialTab?: BackOfficeTab } = {}) {
  const { dealer: DEALER, nextPickup: NEXT_PICKUP } = useBackOfficeEnv();
  const office = useBackOffice();
  const counts = useCounts(office);
  const [localTab, setLocalTab] = useState<BackOfficeTab>(initialTab);
  const tab = tabProp ?? localTab;
  const setTab = onTabChange ?? setLocalTab;
  const [open, setOpen] = useState<string | null>(null);
  const openCar = office.cars.find((c) => c.vin === open);

  return (
    <div className="min-h-screen bg-canvas">
      <div className={`${PAGE} py-8`}>
        <PageHeader
          title="Cars sold to Clutch"
          context={
            <>
              {DEALER} · next pickup <span className="font-medium text-ink">{NEXT_PICKUP}</span>
            </>
          }
          right={<Tabs tab={tab} onChange={setTab} counts={counts} />}
        />
        {tab === 'pickups' ? <Pickups office={office} onOpen={setOpen} /> : <Overview office={office} onOpen={setOpen} onTab={setTab} />}
      </div>

      <Drawer open={!!openCar} onClose={() => setOpen(null)} label="Car detail">
        {openCar && <CarDetail car={openCar} office={office} />}
      </Drawer>
    </div>
  );
}
