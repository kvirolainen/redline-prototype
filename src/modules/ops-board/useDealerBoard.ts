import { useEffect, useState } from 'react';
import { money } from '../../domain/format';
import type { CarStatus } from '../../domain/statuses';
import { DAY_DATE, DAYS, DEALER_HEALTH, DEALERS, NOW_TIME, TODAY_DATE, type Day, type Dealer, type DealerHealth, type OpsCar } from './fixtures';
import { day, dealer, inspectorName, useOpsBoard } from './useOpsBoard';

// What changes when the seller is a dealer: the dealer is the main object, with its people,
// its cars on the way and its track record. Trucks, routes and rosters stay in dispatch.

export type Readiness = 'ready' | 'not_on_lot' | 'expiring' | 'offer' | 'not_ready' | 'done' | 'closed';

export type FlagKind = 'live' | 'expiring' | 'rolls' | 'rolled' | 'health';

export interface DealerFlag {
  key: string;
  kind: FlagKind;
  title: string;
  /** Who it waits on, by first name. */
  who: string;
  /** What it costs if nobody acts. */
  cost: string;
  carId?: string;
}

export interface LiveReprice {
  car: OpsCar;
  dealer: Dealer;
  director: string;
  inspector: string;
  waitingSince: string;
  leaves: string;
}

export interface DealerRow {
  dealer: Dealer;
  health: DealerHealth;
  nextRun: Day | null;
  nextRunCars: number;
  counts: { ready: number; notOnLot: number; expiring: number };
  cars: OpsCar[];
  flags: DealerFlag[];
  /** Dispatch-owned issue, shown as one quiet line. */
  dispatchNote: string | null;
  score: number;
}

// ---- dates and times ------------------------------------------------------

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const clock = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

const asDate = (iso: string) => new Date(`${iso}T12:00:00Z`);
const addDays = (iso: string, n: number) => {
  const d = asDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
/** "Wed Nov 18", or "today" / "tomorrow". */
export const dayLabel = (iso: string) => {
  if (iso === TODAY_DATE) return 'today';
  if (iso === addDays(TODAY_DATE, 1)) return 'tomorrow';
  return asDate(iso).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).replace(',', '');
};
/** The dealer's first run on or after a date. */
const runOnOrAfter = (iso: string, runDay: Dealer['runDay']) => {
  let d = iso;
  const want = runDay === 'Tue' ? 2 : 4;
  while (asDate(d).getUTCDay() !== want) d = addDays(d, 1);
  return d;
};

/** A clock that starts at the demo moment and keeps moving, so waits read as live. */
export function useNow() {
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  return toMin(NOW_TIME) + Math.floor((now - start) / 60000);
}

// ---- readiness --------------------------------------------------------------

const DONE: CarStatus[] = ['picked_up', 'paid'];
const CLOSED: CarStatus[] = ['declined', 'expired', 'cancelled'];
const firstName = (s: string) => s.split(',')[0];

export function readiness(c: OpsCar): Readiness {
  if (DONE.includes(c.status)) return 'done';
  if (CLOSED.includes(c.status)) return 'closed';
  if (c.status === 'not_ready') return 'not_ready';
  if (c.status === 'offered') return c.expiresOn && c.expiresOn < DAY_DATE[c.day] ? 'expiring' : 'offer';
  if (c.onLotFrom && c.onLotFrom > TODAY_DATE) return 'not_on_lot';
  return 'ready';
}

/** Cars still to collect: today's and later runs, not done or closed. */
const upcoming = (c: OpsCar) => day(c.day).state !== 'done';

export function useDealerBoard() {
  const board = useOpsBoard();
  const [reminded, setReminded] = useState<Record<string, string>>({}); // key -> time sent
  const [log, setLog] = useState<string[]>([]);
  const now = useNow();
  const today = DAYS.find((d) => d.state === 'today')!;

  const live: LiveReprice[] = board.cars
    .filter((c) => c.status === 'reprice_pending' && c.day === today.id && c.waitingSince)
    .map((c) => {
      const dl = dealer(c.dealerId);
      return {
        car: c,
        dealer: dl,
        director: dl.director,
        inspector: inspectorName(board.routeFor(c.dealerId, c.day)?.inspectorId ?? null) ?? 'The inspector',
        waitingSince: c.waitingSince!,
        leaves: c.inspectorLeaves ?? '',
      };
    });

  const avgReprice = Math.round(
    DEALERS.reduce((s, d) => s + DEALER_HEALTH[d.id].repriceRate * DEALER_HEALTH[d.id].inspected, 0) /
      DEALERS.reduce((s, d) => s + DEALER_HEALTH[d.id].inspected, 0),
  );
  const medianReprice = (() => {
    const r = DEALERS.map((d) => DEALER_HEALTH[d.id].repriceRate).sort((a, b) => a - b);
    return (r[Math.floor((r.length - 1) / 2)] + r[Math.ceil((r.length - 1) / 2)]) / 2;
  })();

  const rows: DealerRow[] = DEALERS.map((dl) => {
    const health = DEALER_HEALTH[dl.id];
    const cars = board.cars.filter((c) => c.dealerId === dl.id && upcoming(c));
    const open = cars.filter((c) => !DONE.includes(c.status) && !CLOSED.includes(c.status));
    const nextRun = DAYS.find((d) => d.state !== 'done' && d.weekday === dl.runDay) ?? null;
    const contact = firstName(dl.contact);
    const flags: DealerFlag[] = [];

    for (const l of live.filter((x) => x.dealer.id === dl.id)) {
      flags.push({
        key: `live-${l.car.id}`, kind: 'live', carId: l.car.id, who: dl.director,
        title: `${l.car.car} re-price on the lot now`,
        cost: `${l.inspector} leaves ~${l.leaves}, otherwise a second trip`,
      });
    }
    for (const c of open) {
      const r = readiness(c);
      const runDate = DAY_DATE[c.day];
      if (r === 'expiring') {
        const lateCar = c.onLotFrom && c.onLotFrom > c.expiresOn!;
        flags.push({
          key: `expiring-${c.id}`, kind: 'expiring', carId: c.id, who: contact,
          title: lateCar
            ? `${c.car}: offer ends ${dayLabel(c.expiresOn!)}, car on the lot ${dayLabel(c.onLotFrom!)}`
            : `${c.car}: offer ends ${dayLabel(c.expiresOn!)}, before the ${dayLabel(runDate)} run`,
          cost: `${money(c.offer)} offer lapses unless ${contact} accepts`,
        });
      }
      if (r === 'not_on_lot' && c.onLotFrom! > runDate) {
        const next = runOnOrAfter(c.onLotFrom!, dl.runDay);
        flags.push({
          key: `rolls-${c.id}`, kind: 'rolls', carId: c.id, who: contact,
          title: `${c.car} reaches the lot ${dayLabel(c.onLotFrom!)}, after the ${dayLabel(runDate)} run`,
          cost: `rolls to ${dayLabel(next)}, cash a week later`,
        });
      }
      if (r === 'not_ready' && c.rolledFrom) {
        flags.push({
          key: `rolled-${c.id}`, kind: 'rolled', carId: c.id, who: contact,
          title: `${c.car} rolled from ${day(c.rolledFrom).label}: ${(c.note ?? 'not ready').toLowerCase()}`,
          cost: `rolls again if it isn't sorted by ${day(c.day).label}`,
        });
      }
    }
    if (health.repriceRate >= medianReprice * 2) {
      flags.push({
        key: `health-${dl.id}`, kind: 'health', who: contact,
        title: `Re-prices ${health.repriceRate}% of cars, about ${Math.round(health.repriceRate / medianReprice)}× the others`,
        cost: 'declarations run high, so prices get re-done on the lot and inspectors wait on directors',
      });
    }

    const route = nextRun ? board.routeFor(dl.id, nextRun.id) : undefined;
    const dispatchNote =
      route && !route.inspectorId && nextRun && open.some((c) => c.day === nextRun.id)
        ? `No inspector on ${nextRun.state === 'today' ? "today's" : `the ${nextRun.label}`} ${route.name} run yet`
        : null;

    const weight: Record<FlagKind, number> = { live: 100, expiring: 30, rolls: 30, rolled: 20, health: 15 };
    const score = flags.reduce((s, f) => s + weight[f.kind], 0) + (dispatchNote ? 5 : 0);

    return {
      dealer: dl,
      health,
      nextRun,
      nextRunCars: nextRun ? open.filter((c) => c.day === nextRun.id).length : 0,
      counts: {
        ready: open.filter((c) => readiness(c) === 'ready').length,
        notOnLot: open.filter((c) => readiness(c) === 'not_on_lot').length,
        expiring: open.filter((c) => readiness(c) === 'expiring').length,
      },
      cars,
      flags,
      dispatchNote,
      score,
    };
  }).sort((a, b) => b.score - a.score || DAYS.indexOf(a.nextRun!) - DAYS.indexOf(b.nextRun!));

  // ---- writes ----------------------------------------------------------------
  const note = (line: string) => setLog((l) => [line, ...l]);
  const remind = (key: string, who: string, dealerName: string) => {
    setReminded((r) => ({ ...r, [key]: clock(now) }));
    note(`Reminder sent to ${who} at ${dealerName}`);
  };
  const call = (who: string, dealerName: string) => note(`Calling ${who} at ${dealerName}`);
  const openInDispatch = (what: string) => note(`Opened in dispatch: ${what}`);

  return {
    cars: board.cars, live, rows, reminded, log, now, avgReprice,
    carsAt: board.carsAt, waitedMin: (since: string) => now - toMin(since), minutesTo: (t: string) => toMin(t) - now,
    remind, call, openInDispatch,
  };
}

export type DealerBoard = ReturnType<typeof useDealerBoard>;
