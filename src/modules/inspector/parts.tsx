import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { OptionCard } from '../../components/ui/OptionCard';
import { money } from '../../domain/format';
import { useInspectorEnv } from './env';
import { NOT_READY_REASONS, type InspectionCar } from './fixtures';
import type { Difference, Outcome } from './useRun';
import { photoFor } from '../../domain/photos';

/** A difference as the summary shows it: from the phone's own answers, or from the re-price as it was sent. */
type DifferenceRow = Pick<Difference, 'declared' | 'finding' | 'note' | 'adjustment' | 'photos'> & { item: { id: string } };

// Small inline icons, stroke style to match Material Symbols Rounded.
const paths = {
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 5l7 7-7 7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 100-8 4 4 0 000 8z',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  truck: 'M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z',
  key: 'M14 10a4 4 0 11-1.2-2.8L21 7v3h-2v2h-2v2h-3.2A4 4 0 0114 10z',
  alert: 'M12 4l9 16H3zM12 10v4M12 17v.5',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
};

export function Icon({ name, className = 'size-5' }: { name: keyof typeof paths; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
}

/** A phone screen: sticky header, scrolling body, optional sticky action bar at the thumb. */
export function Screen({
  title,
  subtitle,
  onBack,
  right,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-(--phone-h,100vh) w-full max-w-[430px] flex-col bg-canvas">
      <header className="sticky top-0 z-10 flex min-h-16 items-center gap-2 border-b border-line bg-white px-2 shadow-header">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Back" className="grid size-12 shrink-0 place-items-center rounded-pill text-ink hover:bg-canvas">
            <Icon name="back" className="size-6" />
          </button>
        ) : (
          <span className="w-2" />
        )}
        <div className="min-w-0 flex-1 py-2">
          <p className="truncate text-title font-bold text-ink">{title}</p>
          {subtitle && <p className="truncate text-caption text-muted">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0 pr-2">{right}</div>}
      </header>
      <main className="flex-1 px-4 pt-4 pb-6">{children}</main>
      {footer && <div className="sticky bottom-0 z-10 border-t border-line bg-white px-4 pt-3 pb-5">{footer}</div>}
    </div>
  );
}

/** Full-width 56px pill: the one-hand, gloves-on action. */
export function BigButton({ variant = 'primary', className = '', ...props }: Parameters<typeof Button>[0]) {
  return <Button variant={variant} className={`h-14 w-full text-base ${className}`} {...props} />;
}

export function CarLine({ car }: { car: InspectionCar }) {
  return (
    <div>
      <p className="text-title font-bold text-ink">{car.car}</p>
      <p className="mt-1 text-sm text-muted">
        {car.colour} · {car.km.toLocaleString('en-CA')} km · VIN …{car.vin.slice(-6)}
      </p>
    </div>
  );
}

/** Tapping "Take photo" adds a tile, as a camera would: a real defect photo where the demo has one, else a placeholder. */
export function PhotoStrip({ count, label, onAdd, required }: { count: number; label: string; onAdd: () => void; required?: boolean }) {
  const src = photoFor(label);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: count }, (_, i) =>
          src ? (
            <img key={i} src={src} alt={`${label} ${i + 1}`} className="h-20 w-24 rounded-card border border-line object-cover" />
          ) : (
            <div key={i} className="grid h-20 w-24 place-items-center rounded-card border border-line bg-photo-bg text-center">
              <div className="text-warm-grey">
                <Icon name="camera" className="mx-auto size-5" />
                <p className="mt-1 px-1 text-caption leading-tight">
                  {label} {i + 1}
                </p>
              </div>
            </div>
          ),
        )}
        <button
          type="button"
          onClick={onAdd}
          className="grid h-20 w-24 place-items-center rounded-card border border-dashed border-subtle bg-white text-ink hover:border-ink"
        >
          <span className="text-center">
            <Icon name="camera" className="mx-auto size-6" />
            <span className="mt-1 block text-caption font-medium">Take photo</span>
          </span>
        </button>
      </div>
      {required && count === 0 && <p className="mt-2 text-caption font-medium text-error">A photo is needed so the dealer can see it</p>}
    </div>
  );
}

/** One line per difference: declared vs found and what it does to the price. */
export function DifferenceList({ diffs }: { diffs: DifferenceRow[] }) {
  return (
    <ul className="divide-y divide-line-light rounded-card border border-line bg-white">
      {diffs.map((d) => (
        <li key={d.item.id} className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-medium text-ink">{d.finding}</p>
            <p className="shrink-0 text-base font-bold text-ink">{d.adjustment === 0 ? '$0' : `−${money(-d.adjustment)}`}</p>
          </div>
          <p className="mt-1 text-sm text-muted">Declared: {d.declared}</p>
          {d.note && <p className="mt-0.5 text-sm text-body">{d.note}</p>}
          <p className="mt-1 text-caption text-muted">
            {d.photos} {d.photos === 1 ? 'photo' : 'photos'}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function PriceChange({ from, to }: { from: number; to: number }) {
  return (
    <div className="rounded-card border border-line bg-white px-4 py-4">
      <p className="text-sm text-muted">Suggested new price</p>
      <p className="mt-1 flex items-baseline gap-3">
        <span className="text-base text-muted line-through">{money(from)}</span>
        <span className="text-price font-bold text-ink">{money(to)}</span>
      </p>
      <p className="mt-1 text-sm text-muted">From Clutch pricing, based on what you found</p>
    </div>
  );
}

/** Bottom sheet over the current screen. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-30">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[calc(var(--phone-h,100vh)*0.9)] w-full max-w-[430px] overflow-y-auto rounded-t-panel bg-white px-4 pt-3 pb-6">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-pill bg-line-light" />
        <p className="mb-4 text-h4 font-bold text-ink">{title}</p>
        {children}
      </div>
    </div>
  );
}

/** "Not ready" picker: one reason, then the car rolls to the next pickup day. */
export function NotReadySheet({ car, onPick, onClose }: { car: InspectionCar; onPick: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState<string>();
  const env = useInspectorEnv();
  const next = env.nextRunOf(car);
  return (
    <Sheet title="Car not ready?" onClose={onClose}>
      <p className="-mt-2 mb-4 text-sm text-muted">
        {car.car} moves to {env.stopOf(car).dealer}'s next pickup day, {next}. The dealer is told right away.
      </p>
      <div className="space-y-2">
        {NOT_READY_REASONS.map((r) => (
          <OptionCard key={r} title={r} selected={reason === r} onClick={() => setReason(r)} />
        ))}
      </div>
      <BigButton className="mt-5" disabled={!reason} onClick={() => reason && onPick(reason)}>
        Move to {next}
      </BigButton>
    </Sheet>
  );
}

/** What happens after Sam decides. Same wording in every variant so the dealer side reads the same. */
export function OutcomeView({
  car,
  outcome,
  diffs,
  onLoad,
  onNext,
  onUndo,
  nextLabel = 'Next car',
}: {
  car: InspectionCar;
  outcome: Outcome;
  diffs: Difference[];
  onLoad: () => void;
  onNext: () => void;
  onUndo: () => void;
  nextLabel?: string;
}) {
  const env = useInspectorEnv();
  const dealer = env.stopOf(car).dealer;
  const director = env.directorOf(car);
  // A new outcome (sent, or the director's answer arriving) starts at the top, wherever the checklist was scrolled.
  const top = useRef<HTMLDivElement>(null);
  const key = `${outcome.kind}-${'loaded' in outcome ? outcome.loaded : ''}-${'accepted' in outcome && outcome.accepted ? 'a' : ''}-${'declined' in outcome && outcome.declined ? 'd' : ''}`;
  useEffect(() => {
    let el: HTMLElement | null = top.current?.parentElement ?? null;
    while (el) {
      if (el.scrollTop > 0) el.scrollTop = 0;
      el = el.parentElement;
    }
    window.scrollTo(0, 0);
  }, [key]);
  const truck = env.run.truck;
  let mark: ReactNode;
  let title: string;
  let body: ReactNode;
  let action: ReactNode = <BigButton onClick={onNext}>{nextLabel}</BigButton>;

  if (outcome.kind === 'confirmed') {
    mark = <Mark tone="done" icon="check" />;
    if (!outcome.loaded && outcome.accepted) {
      title = `${director} accepted ${money(outcome.accepted.to)}`;
      body = (
        <>
          <p className="text-h4 font-bold text-ink">Load it on {truck}</p>
          <p className="mt-2">
            Down from {money(outcome.accepted.from)}. {dealer} is paid the new price.
          </p>
        </>
      );
      action = (
        <BigButton onClick={onLoad}>
          <Icon name="truck" /> Loaded on the truck
        </BigButton>
      );
    } else if (!outcome.loaded) {
      title = `Confirmed at ${money(car.offer)}`;
      body = <p>Matches what {dealer} declared. Load it on {truck}.</p>;
      action = (
        <BigButton onClick={onLoad}>
          <Icon name="truck" /> Loaded on the truck
        </BigButton>
      );
    } else {
      title = 'Picked up';
      body = (
        <p>
          On {truck}. {dealer} is paid {money(car.offer)} within 2 business days.
        </p>
      );
    }
  } else if (outcome.kind === 'reprice') {
    const rows: DifferenceRow[] = diffs.length
      ? diffs
      : (outcome.sent ?? []).map((s) => ({ item: { id: s.label }, declared: s.declared, finding: s.found, note: '', adjustment: s.amount, photos: s.photos }));
    const summary = (
      <div className="mt-4 text-left">
        <PriceChange from={outcome.from} to={outcome.to} />
        {rows.length > 0 && (
          <div className="mt-3">
            <DifferenceList diffs={rows} />
          </div>
        )}
      </div>
    );
    if (outcome.declined) {
      mark = <Mark tone="attention" icon="alert" />;
      title = `${director} declined the re-price`;
      body = (
        <>
          <p>The car stays with {dealer}. Leave it parked and move on.</p>
          {summary}
        </>
      );
    } else {
      mark = <Mark tone="attention" icon="clock" />;
      title = `Re-price sent to ${director}`;
      body = (
        <>
          <p>
            {director}, Sales Director at {dealer}, accepts or declines on their screen. If they decline, the car stays with the dealer.
            Leave it parked until they answer.
          </p>
          {summary}
        </>
      );
    }
  } else {
    mark = <Mark tone="attention" icon="key" />;
    title = `Moved to ${outcome.next}`;
    body = (
      <p>
        {outcome.reason}. {dealer} is told, and the car joins their next pickup day. If the offer runs out before then, the dealer
        refreshes it in one tap.
      </p>
    );
  }

  return (
    <div ref={top} className="flex min-h-[calc(var(--phone-h,100vh)*0.7)] flex-col">
      <div className="flex-1 pt-6 text-center">
        {mark}
        <p className="mt-5 text-h4 font-bold text-ink">{title}</p>
        <p className="mt-1 text-sm text-muted">{car.car}</p>
        <div className="mt-4 text-base text-body">{body}</div>
      </div>
      <div className="mt-8 space-y-2">
        {action}
        <button type="button" onClick={onUndo} className="h-12 w-full text-sm font-medium text-muted hover:text-ink">
          Undo and inspect again
        </button>
      </div>
    </div>
  );
}

function Mark({ tone, icon }: { tone: 'done' | 'attention'; icon: keyof typeof paths }) {
  return (
    <span className={`mx-auto grid size-16 place-items-center rounded-full ${tone === 'done' ? 'bg-success text-white' : 'bg-nudge text-ink'}`}>
      <Icon name={icon} className="size-8" />
    </span>
  );
}

/** Thin progress bar for "x of y checked". */
export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="h-1 overflow-hidden rounded-pill bg-line-light">
      <div className="h-full bg-ink transition-all" style={{ width: `${(done / total) * 100}%` }} />
    </div>
  );
}
