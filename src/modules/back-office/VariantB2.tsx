import { useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { AUCTION_HOURS_PER_CAR, MONTHS, type BackOfficeCar } from './fixtures';
import { km } from './format';
import { CarDetail, DecidedNote, Drawer, ExpiringOffer, ExpiryTag, RepriceDecision } from './parts';
import { AUCTION_DAYS_TO_CASH, computeStats, useBackOffice, useBackOfficeEnv, type BackOffice } from './useBackOffice';

// Back office B2: one page for the dealership, two people.
// Dave (sales director) drops in to decide: the top-left inbox. Maria (sales manager) works the
// car list on pickup week: the readiness tick. "Is Redline worth it?" lives in its own Results tab.

type Tab = 'today' | 'results';

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const item = (t: Tab, label: string) => (
    <button
      type="button"
      onClick={() => onChange(t)}
      aria-pressed={tab === t}
      className={`h-9 rounded-pill px-4 text-sm font-medium ${tab === t ? 'bg-ink text-white' : 'text-body hover:bg-canvas'}`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-1 rounded-pill border border-line bg-white p-1">
      {item('today', 'Cars')}
      {item('results', 'Results')}
    </div>
  );
}

function ValueLine({ office, onMore }: { office: BackOffice; onMore: () => void }) {
  const r = results(office);
  const parts = [
    `${r.cars} cars sold`,
    `${money(r.total)} above auction`,
    `paid in ${r.daysToCash} days (auction ~${AUCTION_DAYS_TO_CASH})`,
    `${r.repriced} of ${r.cars} re-priced at pickup`,
  ];
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-card border border-line bg-white px-4 py-2.5 text-sm text-body">
      <span className="font-medium text-muted">Since Aug</span>
      {parts.map((p) => (
        <span key={p} className="flex items-center gap-2">
          <span className="text-subtle" aria-hidden>·</span>
          {p}
        </span>
      ))}
      <button type="button" onClick={onMore} className="ml-auto font-medium text-ink underline">
        Results
      </button>
    </p>
  );
}

// ───────────────────────── Dave: what needs a decision ─────────────────────────

function Card({ label, title, onTimeline, done, children }: { label: string; title: string; onTimeline?: () => void; done?: boolean; children: ReactNode }) {
  return (
    <article className={`rounded-card border bg-white p-5 ${done ? 'border-line' : 'border-warning'}`}>
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

function NeedsYou({ office, onOpen }: { office: BackOffice; onOpen: (vin: string) => void }) {
  // Cards stay after a decision, showing what happened, until the page is left. New ones (a re-price sent from the
  // lot while the page is open) join at the top.
  const [seen, setSeen] = useState(() => office.needsYou.map((c) => c.vin));
  const fresh = office.needsYou.map((c) => c.vin).filter((v) => !seen.includes(v));
  if (fresh.length) setSeen([...fresh, ...seen]);
  const inbox = (fresh.length ? [...fresh, ...seen] : seen).filter((vin) => office.cars.some((c) => c.vin === vin));
  const pending = office.needsYou.length;
  const anyReprice = office.needsYou.some((c) => c.status === 'reprice_pending');
  return (
    <section aria-label="Needs you">
      <h2 className="mb-3 flex items-center gap-2 text-title font-bold text-ink">
        Needs you
        {pending > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-pill bg-ink px-2 text-caption font-bold text-white">{pending}</span>}
      </h2>
      <div className="space-y-4">
        {inbox.map((vin) => {
          const car = office.cars.find((c) => c.vin === vin)!;
          const isReprice = car.status === 'reprice_pending';
          const isExpiring = car.status === 'offered' && car.expiresSoon;
          const done = !isReprice && !isExpiring;
          return (
            <Card
              key={vin}
              label={isReprice ? `Re-price at pickup · ${car.reprice!.waiting}` : 'Offer expires tomorrow'}
              title={car.car}
              onTimeline={() => onOpen(vin)}
              done={done}
            >
              {isReprice && <RepriceDecision car={car} compact onAccept={() => office.acceptReprice(vin)} onDecline={() => office.declineReprice(vin)} />}
              {isExpiring && <ExpiringOffer car={car} quiet={anyReprice} onRefresh={() => office.refreshOffer(vin)} />}
              {done && <DecidedNote car={car} />}
            </Card>
          );
        })}
        {pending === 0 && inbox.length === 0 && (
          <div className="rounded-card border border-line bg-white px-5 py-6 text-center">
            <p className="text-base font-bold text-ink">Nothing needs you</p>
            <p className="mt-1 text-sm text-muted">Re-prices and expiring offers land here.</p>
          </div>
        )}
        <KeepOrSend office={office} onOpen={onOpen} />
      </div>
    </section>
  );
}

// ───────────────────────── Maria: the cars, by pickup ─────────────────────────

function ReadyTick({ car, office }: { car: BackOfficeCar; office: BackOffice }) {
  const on = !!car.ready;
  return (
    <button
      type="button"
      onClick={() => office.setReady(car.vin, !on)}
      aria-pressed={on}
      title="On the lot, both keys, ownership papers"
      className={`inline-flex h-7 items-center gap-1.5 rounded-pill border px-3 text-caption font-medium whitespace-nowrap ${
        on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
      }`}
    >
      <span aria-hidden>{on ? '✓' : '○'}</span>
      {on ? 'Ready' : 'Mark ready'}
    </button>
  );
}

function CarRow({ car, office, onOpen, mode }: { car: BackOfficeCar; office: BackOffice; onOpen: () => void; mode: 'ready' | 'offer' | 'status' }) {
  const sub = [car.vin.slice(-6), km(car.km)];
  if (car.note && car.status !== 'kept' && (car.status === 'not_ready' || mode === 'ready')) sub.push(car.note);
  if (car.fromReview && car.status === 'offered') sub.push('Priced by a Clutch appraiser');
  if (car.status === 'appraising') sub.push('With a Clutch appraiser');
  return (
    <div className="flex items-center gap-4 border-b border-line-light px-4 py-3 last:border-b-0 hover:bg-canvas">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium text-ink">{car.car}</span>
        <span className="block truncate text-caption text-muted">{sub.join(' · ')}</span>
      </button>
      <span className="hidden w-20 text-right text-sm font-bold text-ink sm:block">{car.status === 'appraising' ? '' : money(car.offer)}</span>
      <span className="flex w-44 justify-end">
        {mode === 'ready' && car.status !== 'kept' && <ReadyTick car={car} office={office} />}
        {mode === 'ready' && car.status === 'kept' && <StatusChip status="kept" />}
        {mode === 'offer' && car.status === 'appraising' && <span className="text-caption font-medium text-ink">Offer by 3:00 pm</span>}
        {mode === 'offer' && car.status === 'offered' && car.fromReview && (
          <Button variant="dark-small" onClick={() => office.acceptOffer(car.vin)}>
            Accept {money(car.offer)}
          </Button>
        )}
        {mode === 'offer' && car.status === 'offered' && !car.fromReview && <ExpiryTag car={car} />}
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
  const groups: { title: string; hint?: string; cars: BackOfficeCar[]; mode: 'ready' | 'offer' | 'status' }[] = [
    { title: `Next pickup · ${NEXT_PICKUP}`, hint: `${readyCount} of ${going} ready`, cars: next, mode: 'ready' },
    { title: `Today’s pickup · ${TODAY}`, cars: office.cars.filter((c) => c.pickup === TODAY && c.status !== 'declined'), mode: 'status' },
    { title: 'Open offers', hint: 'not accepted yet', cars: office.cars.filter((c) => c.status === 'offered' || c.status === 'appraising' || c.status === 'expired'), mode: 'offer' },
    { title: 'Paid', cars: office.cars.filter((c) => c.status === 'paid'), mode: 'status' },
    { title: 'Stayed with you', cars: office.cars.filter((c) => c.status === 'declined' || (c.status === 'kept' && c.pickup !== NEXT_PICKUP)), mode: 'status' },
  ];
  return (
    <section aria-label="Cars" className="min-w-0">
      <h2 className="mb-3 text-title font-bold text-ink">Cars</h2>
      <div className="space-y-5">
        {groups.map((g) =>
          g.cars.length ? (
            <div key={g.title}>
              <p className="mb-2 text-sm font-medium text-muted">
                {g.title} <span className="text-subtle">· {g.hint ?? g.cars.length}</span>
              </p>
              <div className="overflow-hidden rounded-card border border-line bg-white">
                {g.cars.map((c) => (
                  <CarRow key={c.vin} car={c} office={office} mode={g.mode} onOpen={() => onOpen(c.vin)} />
                ))}
              </div>
              {g.mode === 'ready' && <p className="mt-1.5 text-caption text-muted">Ready = on the lot, both keys, ownership papers. Cars not ready move to the pickup after.</p>}
            </div>
          ) : null,
        )}
      </div>
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
    ['Above auction', money(total), `${cars} cars since Aug, vs estimated auction net`],
    ['Paid in', `${daysToCash} days`, `auction: ~${AUCTION_DAYS_TO_CASH} days`],
    ['Staff time saved', `~${Math.round(cars * AUCTION_HOURS_PER_CAR)} h`, `est. ${AUCTION_HOURS_PER_CAR} h of auction work per car`],
    ['Re-priced at pickup', `${repriced} of ${cars}`, 'cars where inspection changed the price'],
  ];

  return (
    <div className="mt-6 space-y-6">
      <section className="grid grid-cols-4 divide-x divide-line rounded-card border border-line bg-white">
        {tiles.map(([label, value, hint]) => (
          <div key={label} className="px-5 py-4">
            <p className="text-caption font-medium text-muted">{label}</p>
            <p className="mt-1 text-h4 font-bold text-ink">{value}</p>
            <p className="mt-0.5 text-caption text-muted">{hint}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)_420px] items-start gap-6">
        <section className="rounded-card border border-line bg-white p-5">
          <h2 className="text-base font-bold text-ink">By month</h2>
          <div className="mt-4 grid grid-cols-[48px_minmax(0,1fr)_56px_80px_80px] items-center gap-x-4 gap-y-3 text-sm">
            <span />
            <span className="text-caption text-muted">Above auction</span>
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
  );
}

// ───────────────────────── Page ─────────────────────────

/** B2 · Decide and track: Dave's decisions on the left, the cars by pickup on the right, results in a tab. */
export function VariantB2() {
  const { dealer: DEALER, today: TODAY } = useBackOfficeEnv();
  const office = useBackOffice();
  const [tab, setTab] = useState<Tab>('today');
  const [open, setOpen] = useState<string | null>(null);
  const openCar = office.cars.find((c) => c.vin === open);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1240px] px-8 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h4 font-bold text-ink">Cars sold to Clutch</h1>
            <p className="mt-1 text-sm text-muted">
              {DEALER} · {TODAY}
            </p>
          </div>
          <Tabs tab={tab} onChange={setTab} />
        </header>

        {tab === 'today' ? (
          <>
            <div className="mt-6">
              <ValueLine office={office} onMore={() => setTab('results')} />
            </div>
            <div className="mt-6 grid grid-cols-[380px_minmax(0,1fr)] items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <NeedsYou office={office} onOpen={setOpen} />
              <CarGroups office={office} onOpen={setOpen} />
            </div>
          </>
        ) : (
          <Results office={office} />
        )}
      </div>

      <Drawer open={!!openCar} onClose={() => setOpen(null)} label="Car detail">
        {openCar && <CarDetail car={openCar} office={office} />}
      </Drawer>
    </div>
  );
}
