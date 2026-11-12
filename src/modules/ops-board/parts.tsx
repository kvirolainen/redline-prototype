import { useEffect, useState, type ReactNode } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/Page';
import { Tag } from '../../components/ui/Tag';
import { money } from '../../domain/format';
import { STATUS, type StatusTone } from '../../domain/statuses';
import { DAYS, INSPECTORS, type OpsCar, type Route } from './fixtures';
import { useOpsEnv } from './env';
import { day, dealer, futureDays, inspectorName, type OpsBoard, type OpsException } from './useOpsBoard';
import { the } from '../../domain/roles';

// Parts shared by the three ops board variants.

/** The shared page header; the context line counts the dealers on weekly pickup. The time sits in the app header. */
export function ModuleHeader({ title, right }: { title: string; right?: ReactNode }) {
  const { dealers } = useOpsEnv();
  return <PageHeader title={title} context={`${dealers.length} dealers · one pickup day a week each`} right={right} />;
}

const toneDot: Record<StatusTone, string> = {
  neutral: 'bg-white border border-subtle',
  active: 'bg-ink',
  attention: 'bg-warning',
  done: 'bg-success',
  closed: 'bg-line',
};

/** One dot per car. For ops a picked-up car is done with, so it shows green like paid. */
export function StatusDot({ car }: { car: OpsCar }) {
  const s = STATUS[car.status];
  const cls = car.status === 'picked_up' ? toneDot.done : toneDot[s.tone];
  return <span title={`${car.car}: ${s.label}`} className={`inline-block size-2.5 rounded-full ${cls}`} />;
}

/** Small popover menu. Opens below its trigger; a click anywhere else closes it. */
export function Menu({
  label,
  children,
  align = 'left',
  variant = 'outline',
}: {
  label: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  variant?: 'outline' | 'dark';
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        className={`inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-caption font-medium whitespace-nowrap transition-colors ${
          variant === 'dark' ? 'bg-ink text-white hover:bg-body' : 'border border-line bg-white text-ink hover:border-ink'
        }`}
      >
        {label}
        <svg viewBox="0 0 8 8" className="size-2" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M1.5 3l2.5 2.5L6.5 3" />
        </svg>
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); close(); }} />
          <span
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-10 z-40 flex min-w-60 flex-col rounded-card border border-line bg-white py-1 shadow-overlay ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            {children(close)}
          </span>
        </>
      )}
    </span>
  );
}

export function MenuItem({ title, helper, disabled, onClick }: { title: string; helper?: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full flex-col items-start px-4 py-2.5 text-left hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="text-sm font-medium text-ink">{title}</span>
      {helper && <span className="text-caption text-muted">{helper}</span>}
    </button>
  );
}

/** Pick an inspector for a run. Inspectors already on another run that day are shown but disabled. */
export function InspectorMenu({ board, route, variant }: { board: OpsBoard; route: Route; variant?: 'outline' | 'dark' }) {
  const current = inspectorName(route.inspectorId);
  return (
    <Menu label={current ? `Inspector: ${current}` : 'Assign inspector'} variant={variant ?? (current ? 'outline' : 'dark')}>
      {(close) =>
        INSPECTORS.map((i) => {
          const busy = board.busyInspector(i.id, route.day);
          const isThis = busy?.id === route.id;
          return (
            <MenuItem
              key={i.id}
              title={i.name}
              helper={isThis ? 'On this run' : busy ? `On the ${busy.name} run, ${busy.truck}` : `Free on ${day(route.day).label}`}
              disabled={!!busy}
              onClick={() => {
                board.assignInspector(route.id, i.id);
                close();
              }}
            />
          );
        })
      }
    </Menu>
  );
}

export function MoveCarMenu({ board, car }: { board: OpsBoard; car: OpsCar }) {
  return (
    <Menu label="Move" align="right">
      {(close) =>
        futureDays(car.day).map((d) => {
          const r = board.routeFor(car.dealerId, d.id);
          return (
            <MenuItem
              key={d.id}
              title={d.label}
              helper={r ? `${r.name} run · ${r.truck}` : 'Adds a stop to a run that day'}
              onClick={() => {
                board.moveCar(car.id, d.id);
                close();
              }}
            />
          );
        })
      }
    </Menu>
  );
}

export function CarLine({ board, car, movable }: { board: OpsBoard; car: OpsCar; movable?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-line-light px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{car.car}</p>
        <p className="text-caption text-muted">
          {car.vin.slice(-6)} · {car.km.toLocaleString('en-CA')} km ·{' '}
          {car.newPrice ? (
            <>
              <span className="line-through">{money(car.offer)}</span> {money(car.newPrice)}
            </>
          ) : (
            money(car.offer)
          )}
        </p>
        {car.note && <p className="mt-0.5 text-caption text-body">{car.note}</p>}
      </div>
      <StatusChip status={car.status} />
      {movable && <MoveCarMenu board={board} car={car} />}
    </div>
  );
}

const kindLabel: Record<OpsException['kind'], string> = {
  reprice: 'Re-price',
  unassigned: 'Unassigned',
  expiring: 'Expiring',
  not_ready: 'Not ready',
};

/** One exception with its main action. Shared by the Today's runs rail and the exceptions queue. */
export function ExceptionCard({ board, e, compact }: { board: OpsBoard; e: OpsException; compact?: boolean }) {
  const route = e.routeId ? board.routes.find((r) => r.id === e.routeId) : undefined;
  const car = e.carId ? board.cars.find((c) => c.id === e.carId) : undefined;
  const dl = dealer(e.dealerId);
  return (
    <article className="rounded-card border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption font-medium text-muted">
            {kindLabel[e.kind]} · {dl.name}
          </p>
          <h3 className="mt-1 text-base font-bold text-ink">{e.title}</h3>
          <p className="text-sm text-ink">{e.subject}</p>
        </div>
        <Tag tone={e.kind === 'reprice' || e.kind === 'unassigned' ? 'attention' : 'neutral'} className="shrink-0">
          {e.age}
        </Tag>
      </div>
      {!compact && <p className="mt-2 text-sm text-muted">{e.detail}</p>}
      {compact && e.kind === 'reprice' && car?.newPrice && (
        <p className="mt-2 text-sm text-body">
          {money(car.offer)} → <span className="font-bold text-ink">{money(car.newPrice)}</span>
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(e.kind === 'reprice' || e.kind === 'expiring') &&
          (e.nudged ? (
            <span className="inline-flex h-8 items-center gap-1.5 text-caption font-medium text-body">
              <Check /> Reminder sent, waiting on {the(e.kind === 'reprice' ? dl.director : dl.contact)}
            </span>
          ) : (
            <Button variant="dark-small" onClick={() => board.nudge(e)}>
              Remind {the(e.kind === 'reprice' ? dl.director : dl.contact)}
            </Button>
          ))}
        {e.kind === 'unassigned' && route && <InspectorMenu board={board} route={route} />}
        {e.kind === 'not_ready' && car && (
          <>
            <Menu label="Move to an earlier run" variant="dark">
              {(close) =>
                futureDays(car.day)
                  .filter((d) => DAYS.indexOf(d) < DAYS.findIndex((x) => x.id === car.day))
                  .map((d) => {
                    const r = board.routeFor(car.dealerId, d.id);
                    return (
                      <MenuItem
                        key={d.id}
                        title={d.label}
                        helper={r ? `${r.name} run · ${r.truck}` : 'Adds a stop to a run that day'}
                        onClick={() => {
                          board.moveCar(car.id, d.id);
                          close();
                        }}
                      />
                    );
                  })
              }
            </Menu>
            <button type="button" onClick={() => board.keepAsIs(e)} className="h-8 px-2 text-caption font-medium text-body hover:underline">
              Keep on {day(car.day).label}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export function Check() {
  return (
    <span className="grid size-4 place-items-center rounded-full bg-success">
      <svg viewBox="0 0 12 12" className="size-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2.5 6.5l2.5 2.5 4.5-5" />
      </svg>
    </span>
  );
}

/** The last thing Jordan did, shown briefly at the bottom. */
export function Toast({ log }: { log: string[] }) {
  const [seen, setSeen] = useState(0);
  const count = log.length;
  useEffect(() => {
    if (!count) return;
    const t = setTimeout(() => setSeen(count), 3200);
    return () => clearTimeout(t);
  }, [count]);
  if (count <= seen) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <p className="flex items-center gap-2 rounded-pill bg-ink px-5 py-3 text-sm font-medium text-white shadow-overlay">
        <Check /> {log[0]}
      </p>
    </div>
  );
}

/** Right-side panel for run detail. */
export function SidePanel({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-10 bg-black/20" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-20 flex w-full max-w-[440px] flex-col border-l border-line bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-title font-bold text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-full border border-line text-ink hover:border-ink">
            <svg viewBox="0 0 10 10" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
