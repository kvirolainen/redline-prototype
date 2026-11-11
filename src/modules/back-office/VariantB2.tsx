import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { PAGE, PageHeader, SectionHeading, SegmentedTabs } from '../../components/ui/Page';
import { StatusChip } from '../../components/ui/StatusChip';
import { ATTENTION_EDGE } from '../../components/ui/Tag';
import { money } from '../../domain/format';
import { checksOf, MONTHS, READY_CHECKS, type BackOfficeCar, type ReadyCheck as ReadyCheckId } from './fixtures';
import { km } from './format';
import { CarDetail, DecidedNote, Drawer, ExpiryTag, RepriceDecision } from './parts';
import { AUCTION_DAYS_TO_CASH, computeStats, useBackOffice, useBackOfficeEnv, type BackOffice } from './useBackOffice';

// Back office B2: one page for the dealership, a home for each of its two people.
// Overview is Dave's (sales director): the decisions that need him, then whether Redline is worth it.
// Pickups is Maria's (sales manager): the cars by pickup, readiness checks and offers still open.

import type { BackOfficeTab } from '../../shell/views';
export type { BackOfficeTab };

function Tabs({ tab, onChange }: { tab: BackOfficeTab; onChange: (t: BackOfficeTab) => void }) {
  return (
    <SegmentedTabs
      items={[
        ['overview', 'Overview'],
        ['pickups', 'Pickups'],
      ]}
      value={tab}
      onChange={onChange}
    />
  );
}

// ───────────────────────── Overview (Dave): what needs a decision ─────────────────────────

function Card({ label, title, onTimeline, done, children }: { label: string; title: string; onTimeline?: () => void; done?: boolean; children: ReactNode }) {
  return (
    <article className={`rounded-card border border-line bg-white p-5 ${done ? '' : ATTENTION_EDGE}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption font-medium text-muted">{done ? 'Done' : label}</p>
          <h3 className="mt-0.5 truncate text-base font-bold text-ink">{title}</h3>
        </div>
        {onTimeline && (
          <button type="button" onClick={onTimeline} className="shrink-0 text-sm font-medium text-ink underline">
            Timeline
          </button>
        )}
      </div>
      {children}
    </article>
  );
}

/** Dave's real call on a trade-in: retail on his own lot, or let it go to Clutch. Optional; the default is Clutch. */
function KeepOrSend({ office, onOpen }: { office: BackOffice; onOpen: (vin: string) => void }) {
  const { nextPickup: NEXT_PICKUP } = useBackOfficeEnv();
  const cars = office.nextRun;
  if (!cars.length) return null;
  return (
    <article className="rounded-card border border-line bg-white p-5">
      <p className="text-caption font-medium text-muted">Before the {NEXT_PICKUP} pickup · decide by Wed 5 pm</p>
      <h3 className="mt-0.5 text-base font-bold text-ink">Keep any for your lot?</h3>
      <p className="mt-1 text-sm text-muted">Everything else goes to Clutch at the offer shown.</p>
      <ul className="mt-3 divide-y divide-line-light">
        {cars.map((c) => {
          const kept = c.status === 'kept';
          return (
            <li key={c.vin} className="flex items-center gap-3 py-2.5">
              <button type="button" onClick={() => onOpen(c.vin)} className="min-w-0 flex-1 text-left">
                <span className={`block truncate text-sm font-medium ${kept ? 'text-muted' : 'text-ink'}`}>{c.car}</span>
                <span className="block truncate text-caption text-muted">
                  {km(c.km)} · {money(c.offer)} · {money(c.offer - c.auction)} above auction
                </span>
              </button>
              {kept ? (
                <span className="flex items-center gap-2">
                  <span className="text-caption font-medium text-ink">Kept</span>
                  <button type="button" onClick={() => office.undoKeep(c.vin)} className="text-caption text-muted underline">
                    Undo
                  </button>
                </span>
              ) : (
                <Button variant="dark-small" onClick={() => office.keep(c.vin)}>
                  Keep
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}

/** Only Dave's decisions: a re-price from the lot. Offers and readiness are Maria's and live on Pickups. */
function NeedsYou({ office, onOpen, onTab }: { office: BackOffice; onOpen: (vin: string) => void; onTab: (t: BackOfficeTab) => void }) {
  // Cards stay after a decision, showing what happened, until the page is left. New ones (a re-price sent from the
  // lot while the page is open) join at the top.
  const pendingVins = office.needsYou.filter((c) => c.status === 'reprice_pending').map((c) => c.vin);
  const [seen, setSeen] = useState(() => pendingVins);
  const fresh = pendingVins.filter((v) => !seen.includes(v));
  if (fresh.length) setSeen([...fresh, ...seen]);
  const inbox = (fresh.length ? [...fresh, ...seen] : seen).filter((vin) => office.cars.some((c) => c.vin === vin));
  return (
    <section aria-label="Needs you">
      <SectionHeading count={pendingVins.length} className="mb-3">
        Needs you
      </SectionHeading>
      <div className="space-y-4">
        {inbox.map((vin) => {
          const car = office.cars.find((c) => c.vin === vin)!;
          const isReprice = car.status === 'reprice_pending';
          return (
            <Card key={vin} label={`Re-price at pickup · ${car.reprice?.waiting ?? ''}`} title={car.car} onTimeline={() => onOpen(vin)} done={!isReprice}>
              {isReprice ? (
                <RepriceDecision car={car} compact onAccept={() => office.acceptReprice(vin)} onDecline={() => office.declineReprice(vin)} />
              ) : (
                <DecidedNote car={car} />
              )}
            </Card>
          );
        })}
        {inbox.length === 0 && (
          <div className="rounded-card border border-line bg-white px-5 py-5">
            <p className="text-base font-bold text-ink">Nothing needs you right now</p>
            <p className="mt-1 text-sm text-muted">If Clutch’s inspection finds a difference on pickup day, the new price lands here for your call.</p>
          </div>
        )}
        <KeepOrSend office={office} onOpen={onOpen} />
        <PickupsGlance office={office} onTab={onTab} />
      </div>
    </section>
  );
}

/** One glance at Maria's side, so Dave knows the week is on track without opening the list. */
function PickupsGlance({ office, onTab }: { office: BackOffice; onTab: (t: BackOfficeTab) => void }) {
  const { today: TODAY, nextPickup: NEXT_PICKUP } = useBackOfficeEnv();
  const going = office.nextRun.filter((c) => c.status !== 'kept');
  const ready = going.filter((c) => c.ready).length;
  const todays = office.cars.filter((c) => c.pickup === TODAY && c.status !== 'declined');
  const loaded = todays.filter((c) => c.status === 'picked_up' || c.status === 'paid').length;
  const lines: [string, string][] = [
    [`Today · ${TODAY}`, `${loaded} of ${todays.length} on the truck`],
    [`Next · ${NEXT_PICKUP}`, `${ready} of ${going.length} ready`],
  ];
  return (
    <article className="rounded-card border border-line bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-bold text-ink">Pickups</h3>
        <button type="button" onClick={() => onTab('pickups')} className="text-sm font-medium text-ink underline">
          See the cars
        </button>
      </div>
      <dl className="mt-2 divide-y divide-line-light">
        {lines.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 py-2 text-sm">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

// ───────────────────────── Pickups (Maria): the cars, by pickup ─────────────────────────

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
        className={`inline-flex h-7 items-center gap-1.5 rounded-pill border px-3 text-caption font-medium whitespace-nowrap ${
          all ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
        }`}
      >
        <span aria-hidden>{all ? '✓' : saved.length ? '◐' : '○'}</span>
        {all ? 'Ready' : saved.length ? `${saved.length} of ${READY_CHECKS.length} ready` : 'Mark ready'}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" tabIndex={-1} className="fixed inset-0 z-20 cursor-default" onClick={close} />
          <div role="dialog" aria-label={`Ready check: ${car.car}`} className="absolute top-full right-0 z-30 mt-2 w-72 rounded-panel border border-line bg-white p-4 text-left shadow-overlay">
            <p className="text-sm font-bold text-ink">Ready for {car.pickup}?</p>
            <p className="mt-0.5 truncate text-caption text-muted">{car.car}</p>
            <ul className="mt-3 space-y-1">
              {READY_CHECKS.map((r, i) => (
                <li key={r.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-card px-2 py-1.5 text-sm text-ink hover:bg-canvas">
                    <input type="checkbox" className="size-4 accent-ink" checked={ticks.includes(r.id)} onChange={() => toggle(r.id)} autoFocus={i === 0} />
                    {r.label}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-caption text-muted">A car that isn’t ready moves to the pickup after.</p>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={close} className="h-8 px-3 text-caption font-medium text-body hover:underline">
                Cancel
              </button>
              <Button variant="dark-small" disabled={!changed} onClick={save} className="disabled:bg-line-light disabled:text-subtle">
                {action}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** The grey middle column: what's missing, who priced it, what happened. */
function rowDetail(car: BackOfficeCar, mode: RowMode): string {
  if (car.status === 'kept') return 'Kept for your lot';
  if (mode === 'ready') {
    const ticked = checksOf(car);
    if (car.ready) return 'On the lot, both keys, ownership papers';
    // A car Clutch's inspector left behind says why; otherwise the checks that are still missing.
    if (car.status === 'not_ready' && car.note) return car.note;
    const missing = READY_CHECKS.filter((r) => !ticked.includes(r.id)).map((r) => r.missing).join(', ');
    return ticked.length && missing ? missing[0].toUpperCase() + missing.slice(1) : 'Not checked yet';
  }
  if (car.status === 'appraising') return 'With a Clutch appraiser';
  if (car.status === 'offered' && car.fromReview) return 'Priced by a Clutch appraiser';
  if (car.status === 'offered') return car.expiresSoon ? '' : `Holds until ${car.expires}`;
  if (car.status === 'expired') return 'The offer ran out';
  return car.note ?? '';
}

type RowMode = 'ready' | 'offer' | 'status';

function CarRow({ car, office, onOpen, mode }: { car: BackOfficeCar; office: BackOffice; onOpen: () => void; mode: RowMode }) {
  const detail = rowDetail(car, mode);
  const missingSomething = mode === 'ready' && !car.ready && car.status !== 'kept';
  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_96px_210px_12px] items-center gap-4 border-b border-line-light px-4 py-3 first:rounded-t-card last:rounded-b-card last:border-b-0 hover:bg-canvas">
      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <span className="block truncate text-sm font-medium text-ink">{car.car}</span>
        <span className="block truncate text-caption text-muted">
          {car.vin.slice(-6)} · {km(car.km)}
        </span>
      </button>
      <span className={`truncate text-caption ${missingSomething ? 'text-ink' : 'text-muted'}`}>
        {car.status === 'offered' && car.expiresSoon && !car.fromReview ? <ExpiryTag car={car} /> : detail}
      </span>
      <span className="text-right text-sm font-bold text-ink">{car.status === 'appraising' ? '' : money(car.offer)}</span>
      <span className="flex justify-end">
        {mode === 'ready' && car.status !== 'kept' && <ReadyCheck car={car} office={office} />}
        {mode === 'ready' && car.status === 'kept' && <StatusChip status="kept" />}
        {mode === 'offer' && car.status === 'appraising' && <span className="text-caption font-medium text-ink">Offer by 3:00 pm</span>}
        {mode === 'offer' && car.status === 'offered' && car.fromReview && (
          <Button variant="dark-small" onClick={() => office.acceptOffer(car.vin)}>
            Accept {money(car.offer)}
          </Button>
        )}
        {mode === 'offer' && car.status === 'offered' && !car.fromReview && car.expiresSoon && (
          <Button variant="dark-small" onClick={() => office.refreshOffer(car.vin)}>
            Refresh for 7 days
          </Button>
        )}
        {mode === 'offer' && car.status === 'offered' && !car.fromReview && !car.expiresSoon && <span className="text-caption text-muted">Waiting on the customer</span>}
        {mode === 'offer' && car.status === 'expired' && (
          <Button variant="dark-small" onClick={() => office.refreshOffer(car.vin)}>
            Refresh offer
          </Button>
        )}
        {mode === 'status' && <StatusChip status={car.status} />}
      </span>
      <span className="text-subtle" aria-hidden>
        ›
      </span>
    </div>
  );
}

function CarGroups({ office, onOpen }: { office: BackOffice; onOpen: (vin: string) => void }) {
  const { today: TODAY, nextPickup: NEXT_PICKUP } = useBackOfficeEnv();
  const next = office.nextRun;
  const readyCount = next.filter((c) => c.ready && c.status !== 'kept').length;
  const going = next.filter((c) => c.status !== 'kept').length;
  const groups: { title: string; hint?: string; cars: BackOfficeCar[]; mode: RowMode }[] = [
    { title: `Next pickup · ${NEXT_PICKUP}`, hint: `${readyCount} of ${going} ready · check each car by Wed 5 pm`, cars: next, mode: 'ready' },
    { title: `Today’s pickup · ${TODAY}`, cars: office.cars.filter((c) => c.pickup === TODAY && c.status !== 'declined'), mode: 'status' },
    { title: 'Open offers', hint: 'the customer hasn’t traded yet', cars: office.cars.filter((c) => c.status === 'offered' || c.status === 'appraising' || c.status === 'expired'), mode: 'offer' },
    { title: 'Paid', cars: office.cars.filter((c) => c.status === 'paid'), mode: 'status' },
    { title: 'Stayed with you', cars: office.cars.filter((c) => c.status === 'declined' || (c.status === 'kept' && c.pickup !== NEXT_PICKUP)), mode: 'status' },
  ];
  return (
    <section aria-label="Cars" className="mt-6 space-y-6">
      {groups.map((g) =>
        g.cars.length ? (
          <div key={g.title}>
            <SectionHeading count={undefined} aside={g.hint ?? `${g.cars.length} ${g.cars.length === 1 ? 'car' : 'cars'}`} className="mb-2">
              {g.title}
            </SectionHeading>
            <div className="rounded-card border border-line bg-white">
              {g.cars.map((c) => (
                <CarRow key={c.vin} car={c} office={office} mode={g.mode} onOpen={() => onOpen(c.vin)} />
              ))}
            </div>
          </div>
        ) : null,
      )}
    </section>
  );
}

// ───────────────────────── Results: is Redline worth it? ─────────────────────────

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

function Results({ office }: { office: BackOffice }) {
  const { months, total, cars, repriced, daysToCash } = results(office);
  const max = Math.max(...months.map((m) => m.aboveAuction));
  const repricedCars = office.cars.filter((c) => c.repriced);

  const tiles: [string, string, string][] = [
    ['Cars sold', String(cars), 'picked up by Clutch'],
    ['Vs auction estimate', `+${money(total)}`, 'total, vs estimated auction net'],
    ['Days to payment', `${daysToCash}`, `average · auction typically ~${AUCTION_DAYS_TO_CASH}`],
    ['Re-priced at pickup', `${repriced} of ${cars}`, 'inspection changed the price'],
  ];

  return (
    <div className="min-w-0">
      <SectionHeading aside="Since August" className="mb-3">
        Results
      </SectionHeading>
      <div className="space-y-4">
      <section className="grid grid-cols-2 divide-line rounded-card border border-line bg-white xl:grid-cols-4 xl:divide-x">
        {tiles.map(([label, value, hint]) => (
          <div key={label} className="px-5 py-4">
            <p className="text-caption font-medium text-muted">{label}</p>
            <p className="mt-1 text-h4 font-bold text-ink">{value}</p>
            <p className="mt-0.5 text-caption text-muted">{hint}</p>
          </div>
        ))}
      </section>

      <div className="space-y-4">
        <section className="rounded-card border border-line bg-white p-5">
          <h2 className="text-base font-bold text-ink">By month</h2>
          <div className="mt-4 grid grid-cols-[48px_minmax(0,1fr)_56px_80px_80px] items-center gap-x-4 gap-y-3 text-sm">
            <span />
            <span className="text-caption text-muted">Vs auction estimate</span>
            <span className="text-right text-caption text-muted">Cars</span>
            <span className="text-right text-caption text-muted">Paid in</span>
            <span className="text-right text-caption text-muted">Re-priced</span>
            {months.map((m) => (
              <div key={m.month} className="contents">
                <span className="font-medium text-ink">{m.month}</span>
                <span className="flex items-center gap-3">
                  <span className={`h-3 rounded-xs ${'soFar' in m ? 'bg-subtle' : 'bg-ink'}`} style={{ width: `${(m.aboveAuction / max) * 70}%` }} />
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
        </section>

        <section className="rounded-card border border-line bg-white p-5">
          <h2 className="text-base font-bold text-ink">Re-priced at pickup</h2>
          <p className="mt-1 text-sm text-muted">The latest ones: what the inspection found, and what you decided.</p>
          <ul className="mt-3 divide-y divide-line-light">
            {repricedCars.map((c) => {
              const found = c.reprice?.items.map((i) => i.label.toLowerCase()).join(', ') ?? c.events.find((e) => e.kind === 'reprice')?.text.split('.')[0] ?? '';
              const outcome = c.status === 'reprice_pending' ? 'Waiting on you' : c.status === 'declined' ? 'Declined, stayed with you' : 'Accepted';
              return (
                <li key={c.vin} className="py-2.5">
                  <p className="flex justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-ink">{c.car}</span>
                    <span className="shrink-0 text-muted">{outcome}</span>
                  </p>
                  <p className="truncate text-caption text-muted">{found}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      </div>
    </div>
  );
}

// ───────────────────────── Page ─────────────────────────

/** B2 · Two homes: Overview for Dave (his decisions, then results), Pickups for Maria (the cars by pickup).
 *  In the app the shell owns the tab, so the person switcher can open either home; in Storybook it's local. */
export function VariantB2({ tab: tabProp, onTabChange, initialTab = 'overview' }: { tab?: BackOfficeTab; onTabChange?: (t: BackOfficeTab) => void; initialTab?: BackOfficeTab } = {}) {
  const { dealer: DEALER, nextPickup: NEXT_PICKUP } = useBackOfficeEnv();
  const office = useBackOffice();
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
          right={<Tabs tab={tab} onChange={setTab} />}
        />

        {tab === 'overview' ? (
          <div className="mt-6 grid grid-cols-[380px_minmax(0,1fr)] items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <NeedsYou office={office} onOpen={setOpen} onTab={setTab} />
            <Results office={office} />
          </div>
        ) : (
          <CarGroups office={office} onOpen={setOpen} />
        )}
      </div>

      <Drawer open={!!openCar} onClose={() => setOpen(null)} label="Car detail">
        {openCar && <CarDetail car={openCar} office={office} />}
      </Drawer>
    </div>
  );
}
