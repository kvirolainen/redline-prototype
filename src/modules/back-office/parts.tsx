import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { STATUS } from '../../domain/statuses';
import { DEALER, type BackOfficeCar, type CarEvent, type EventKind } from './fixtures';
import { km } from './format';
import { AUCTION_DAYS_TO_CASH, type BackOffice, type Stats } from './useBackOffice';


// ───────────────────────── Header ─────────────────────────

export function PageHeader({ subtitle, right }: { subtitle?: string; right?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm text-muted">{DEALER}</p>
        <h1 className="mt-1 text-h4 font-bold text-ink">Cars sold to Clutch</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Signed() {
  return (
    <span className="flex items-center gap-3 text-sm">
      <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-white" aria-hidden>
        D
      </span>
      <span>
        <span className="block font-medium text-ink">Dave</span>
        <span className="block text-caption text-muted">Sales Director</span>
      </span>
    </span>
  );
}

// ───────────────────────── Value strip ─────────────────────────

export function ValueStrip({ stats, dense }: { stats: Stats; dense?: boolean }) {
  const items: [string, string, string][] = [
    ['Cars sold to Clutch', String(stats.sold), 'last 90 days'],
    ['Above auction', money(stats.aboveAuction), 'vs estimated auction net'],
    ['Days to cash', `${stats.daysToCash} days`, `auction: ~${AUCTION_DAYS_TO_CASH} days`],
    ['Offers accepted', `${stats.acceptance}%`, 'of offers you decided on'],
    ['Re-priced at pickup', `${stats.repriceRate}%`, 'of cars inspected'],
  ];
  return (
    <section aria-label="Value of selling to Clutch" className="grid grid-cols-5 divide-x divide-line rounded-card border border-line bg-white">
      {items.map(([label, value, hint]) => (
        <div key={label} className={dense ? 'px-4 py-3' : 'px-5 py-4'}>
          <p className="truncate text-caption font-medium text-muted">{label}</p>
          <p className={`mt-1 font-bold text-ink ${dense ? 'text-title' : 'text-h4'}`}>{value}</p>
          {!dense && <p className="mt-0.5 truncate text-caption text-muted">{hint}</p>}
        </div>
      ))}
    </section>
  );
}

// ───────────────────────── Timeline ─────────────────────────

const kindDot: Record<EventKind, string> = {
  offer: 'bg-white border-ink',
  accept: 'bg-ink border-ink',
  pickup: 'bg-ink border-ink',
  inspect: 'bg-success border-success',
  reprice: 'bg-warning border-warning',
  decision: 'bg-ink border-ink',
  money: 'bg-success border-success',
  alert: 'bg-white border-subtle',
};

export function Timeline({ events }: { events: CarEvent[] }) {
  return (
    <ol className="relative">
      {[...events].reverse().map((e, i, arr) => (
        <li key={`${e.at}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
          {i < arr.length - 1 && <span className="absolute top-4 left-[5px] h-full w-px bg-line" aria-hidden />}
          <span className={`relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 ${kindDot[e.kind]}`} aria-hidden />
          <div className="min-w-0">
            <p className="text-sm text-ink">{e.text}</p>
            <p className="mt-0.5 text-caption text-muted">
              {e.at} · {e.who}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ───────────────────────── Re-price decision ─────────────────────────

export function PhotoPlaceholder({ caption, small }: { caption: string; small?: boolean }) {
  return (
    <figure className="min-w-0 flex-1">
      <div className={`grid place-items-center rounded-card border border-line bg-photo-bg text-warm-grey ${small ? 'h-20' : 'h-28'}`}>
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <circle cx="12" cy="12.5" r="3.5" />
          <path d="M8 6l1.5-2h5L16 6" />
        </svg>
      </div>
      <figcaption className="mt-1.5 truncate text-caption text-muted">{caption}</figcaption>
    </figure>
  );
}

export function PriceChange({ from, to, size = 'lg' }: { from: number; to: number; size?: 'lg' | 'md' }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`text-muted line-through ${size === 'lg' ? 'text-title' : 'text-base'}`}>{money(from)}</span>
      <span aria-hidden className="text-muted">→</span>
      <span className={`font-bold text-ink ${size === 'lg' ? 'text-h3' : 'text-h4'}`}>{money(to)}</span>
      <span className="text-sm text-muted">−{money(from - to)}</span>
    </p>
  );
}

/** What Sam found, the photos, old → new price, and Dave's two choices. Decline asks once more. */
export function RepriceDecision({
  car,
  onAccept,
  onDecline,
  compact,
}: {
  car: BackOfficeCar;
  onAccept: () => void;
  onDecline: () => void;
  compact?: boolean;
}) {
  const [confirmDecline, setConfirmDecline] = useState(false);
  const r = car.reprice;
  if (!r) return null;
  return (
    <div>
      <PriceChange from={r.from} to={r.to} size={compact ? 'md' : 'lg'} />
      <p className="mt-1 text-sm text-body">
        Still beats auction by <span className="font-bold text-ink">{money(r.to - r.auctionAsFound)}</span>
        <span className="text-muted"> (auction estimate as found: {money(r.auctionAsFound)})</span>
      </p>

      <div className="mt-4 overflow-hidden rounded-card border border-line">
        {r.items.map((it) => (
          <div key={it.label} className="flex items-start gap-4 border-b border-line bg-white px-4 py-3 last:border-b-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{it.label}</p>
              <p className="mt-0.5 text-sm text-muted">Declared: {it.declared}</p>
              <p className="text-sm text-body">Found: {it.found}</p>
            </div>
            <span className="text-sm font-bold whitespace-nowrap text-ink">−{money(-it.amount)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-3">
        {r.photos.map((p) => (
          <PhotoPlaceholder key={p} caption={p} small={compact} />
        ))}
      </div>
      <p className="mt-2 text-caption text-muted">
        {r.by} · {r.at}
      </p>

      {confirmDecline ? (
        <div className="mt-4 rounded-card border border-line bg-canvas p-4">
          <p className="text-sm font-medium text-ink">Decline {money(r.to)}?</p>
          <p className="mt-1 text-sm text-body">The car stays with {DEALER}. Sam leaves it on the lot and you can take it to auction.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={onDecline}>Decline, keep the car</Button>
            <Button variant="ghost" onClick={() => setConfirmDecline(false)}>
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={onAccept}>Accept {money(r.to)}</Button>
          <Button variant="outline" onClick={() => setConfirmDecline(true)}>
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Expiring offer ─────────────────────────

export function ExpiringOffer({ car, onRefresh, quiet }: { car: BackOfficeCar; onRefresh: () => void; quiet?: boolean }) {
  return (
    <div>
      <p className="text-sm text-body">
        {money(car.offer)} holds until <span className="font-medium text-ink">{car.expires}</span>. Refresh it for another 7 days at the same price, as long
        as nothing about the car changed.
      </p>
      <Button className="mt-3" variant={quiet ? 'outline' : 'primary'} onClick={onRefresh}>
        Refresh offer
      </Button>
    </div>
  );
}

export function ExpiryTag({ car }: { car: BackOfficeCar }) {
  if (car.status !== 'offered' || !car.expires) return null;
  return car.expiresSoon ? (
    <span className="inline-flex h-6 items-center rounded-pill border border-warning bg-nudge px-2.5 text-caption font-medium text-ink">Expires tomorrow</span>
  ) : (
    <span className="text-caption text-muted">Holds until {car.expires}</span>
  );
}

// ───────────────────────── Decided note ─────────────────────────

export function DecidedNote({ car }: { car: BackOfficeCar }) {
  const text =
    car.status === 'confirmed'
      ? `Accepted at ${money(car.offer)}. Sam loads it today; payment within 2 business days.`
      : car.status === 'declined'
        ? `Declined. The car stays with ${DEALER}.`
        : `Refreshed. ${money(car.offer)} holds until ${car.expires}.`;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success" aria-hidden>
        <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" />
        </svg>
      </span>
      <p className="text-sm text-body">{text}</p>
    </div>
  );
}

// ───────────────────────── Car detail ─────────────────────────

function Fact({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-caption font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 text-base font-bold text-ink">{value}</dd>
      {hint && <dd className="text-caption text-muted">{hint}</dd>}
    </div>
  );
}

export function CarDetail({ car, office }: { car: BackOfficeCar; office: BackOffice }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-title font-bold text-ink">{car.car}</h2>
          <p className="mt-1 text-sm text-muted">
            VIN {car.vin} · {km(car.km)}
          </p>
        </div>
        <StatusChip status={car.status} />
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-4 rounded-card border border-line bg-white p-4">
        <Fact label={car.status === 'paid' ? 'Paid' : 'Offer'} value={money(car.offer)} />
        <Fact label="Above auction" value={money(car.offer - car.auction)} hint={`est. ${money(car.auction)} net`} />
        <Fact label={car.status === 'offered' ? 'Holds until' : 'Pickup'} value={car.status === 'offered' ? (car.expires ?? '') : car.pickup} />
      </dl>

      {car.status === 'reprice_pending' && (
        <section className="mt-5 rounded-card border border-warning bg-white p-4">
          <h3 className="mb-3 text-base font-bold text-ink">Re-price waiting on you</h3>
          <RepriceDecision car={car} onAccept={() => office.acceptReprice(car.vin)} onDecline={() => office.declineReprice(car.vin)} />
        </section>
      )}
      {car.status === 'offered' && car.expiresSoon && (
        <section className="mt-5 rounded-card border border-warning bg-white p-4">
          <h3 className="mb-2 text-base font-bold text-ink">Offer expires tomorrow</h3>
          <ExpiringOffer car={car} onRefresh={() => office.refreshOffer(car.vin)} />
        </section>
      )}
      {car.note && car.status !== 'reprice_pending' && <p className="mt-4 rounded-card bg-nudge px-4 py-3 text-sm text-body">{car.note}</p>}

      <h3 className="mt-6 mb-4 text-base font-bold text-ink">Timeline</h3>
      <Timeline events={car.events} />
      <p className="mt-5 text-caption text-muted">{STATUS[car.status].hint}</p>
    </div>
  );
}

/** Right-hand panel over the page. Closes on Escape or the backdrop. */
export function Drawer({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-label={label}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="absolute top-0 right-0 flex h-full w-[460px] max-w-full flex-col border-l border-line bg-canvas">
        <div className="flex items-center justify-between border-b border-line bg-white px-6 py-3">
          <span className="text-sm font-medium text-muted">Car detail</span>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-full text-ink hover:bg-canvas" aria-label="Close panel">
            <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </aside>
    </div>
  );
}
