import { useEffect, useState } from 'react';
import { money } from '../../domain/format';
import type { CarStatus } from '../../domain/statuses';
import { useOpsEnv, type OpsEnv } from './env';
import type { Day, Dealer, DealerHealth, OpsCar } from './fixtures';
import { useOpsBoard } from './useOpsBoard';

// What changes when the seller is a dealer: the dealer is the main object, with its people,
// its cars on the way and its track record. Trucks, routes and rosters stay in dispatch.
// Only what
// needs judgment (a dealer's track record, slow payments, a director who hasn't answered) lands in Needs you.

export type Readiness = 'ready' | 'unconfirmed' | 'not_on_lot' | 'expiring' | 'offer' | 'not_ready' | 'done' | 'closed';

export type FlagKind = 'live' | 'expiring' | 'rolls' | 'rolled' | 'unconfirmed' | 'health';

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

/** An alert for Jordan: something only a person can settle. Reminders never land here; they go out on their own. */
export interface Need {
  key: string;
  kind: 'call' | 'health';
  tag: string;
  title: string;
  dealer: Dealer;
  /** What's going on, in one line. */
  detail: string;
  carId?: string;
}

export interface LiveReprice {
  car: OpsCar;
  dealer: Dealer;
  director: string;
  inspector: string;
  waitingSince: string;
  leaves: string;
  /** Texts the system sent the director, as clock times. */
  texts: string[];
  /** The next automatic text, if one is still due before the inspector leaves. */
  nextText: string | null;
  /** Both texts unanswered, or the inspector about to leave: now it needs a call. */
  escalated: boolean;
}

export interface DealerRow {
  dealer: Dealer;
  health: DealerHealth;
  nextRun: Day | null;
  nextRunCars: number;
  counts: { ready: number; unconfirmed: number; notOnLot: number; expiring: number; notReady: number };
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
/** "Wed Nov 18", or "today" / "tomorrow" relative to `today`. */
export const dayLabel = (iso: string, today: string) => {
  if (iso === today) return 'today';
  if (iso === addDays(today, 1)) return 'tomorrow';
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
export function useNow(startTime: string) {
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  return toMin(startTime) + Math.floor((now - start) / 60000);
}

// ---- readiness --------------------------------------------------------------

const DONE: CarStatus[] = ['picked_up', 'paid'];
const CLOSED: CarStatus[] = ['declined', 'expired', 'cancelled'];
const firstName = (s: string) => s.split(',')[0];

export function readiness(c: OpsCar, env: Pick<OpsEnv, 'dateOf' | 'today'>): Readiness {
  if (DONE.includes(c.status)) return 'done';
  if (CLOSED.includes(c.status)) return 'closed';
  if (c.status === 'not_ready') return 'not_ready';
  if (c.status === 'offered') return c.expiresOn && c.expiresOn < env.dateOf(c.day) ? 'expiring' : 'offer';
  if (c.status === 'appraising') return 'offer';
  if (c.onLotFrom && c.onLotFrom > env.today) return 'not_on_lot';
  // Accepted and on the lot, but the dealer's sales manager hasn't confirmed keys and papers yet (Back office check).
  if (c.status === 'awaiting_pickup' && c.ready === false) return 'unconfirmed';
  return 'ready';
}

/** The director gets a text when the re-price is raised and a second one 10 minutes later. If both go unanswered
 *  (20 minutes), or the inspector leaves within 15, a person has to call. */
export function textsFor(since: string, leaves: string, now: number) {
  const s = toMin(since);
  const second = s + 10;
  const texts = [clock(s), ...(now >= second ? [clock(second)] : [])];
  const leaveAt = leaves ? toMin(leaves) : Infinity;
  const escalated = now - s >= 20 || leaveAt - now <= 15;
  return { texts, nextText: now < second && !escalated && second < leaveAt ? clock(second) : null, escalated };
}

export function useDealerBoard() {
  const env = useOpsEnv();
  const board = useOpsBoard();
  const { day, dealer, inspectorName } = board;
  const localNow = useNow(env.startTime);
  const now = env.now ?? localNow;
  const today = env.days.find((d) => d.state === 'today');
  const label = (iso: string) => dayLabel(iso, env.today);
  const ready = (c: OpsCar) => readiness(c, env);
  /** Cars still to collect: today's and later runs, not done or closed. */
  const upcoming = (c: OpsCar) => day(c.day).state !== 'done';

  const live: LiveReprice[] = board.cars
    .filter((c) => c.status === 'reprice_pending' && !!today && c.day === today.id && c.waitingSince)
    .map((c) => {
      const dl = dealer(c.dealerId);
      return {
        car: c,
        dealer: dl,
        director: dl.director,
        inspector: inspectorName(board.routeFor(c.dealerId, c.day)?.inspectorId ?? null) ?? 'The inspector',
        waitingSince: c.waitingSince!,
        leaves: c.inspectorLeaves ?? '',
        ...textsFor(c.waitingSince!, c.inspectorLeaves ?? '', now),
      };
    });

  const avgReprice = Math.round(
    env.dealers.reduce((s, d) => s + env.health[d.id].repriceRate * env.health[d.id].inspected, 0) /
      Math.max(env.dealers.reduce((s, d) => s + env.health[d.id].inspected, 0), 1),
  );
  const medianCash = (() => {
    const r = env.dealers.map((d) => env.health[d.id].daysToCash).sort((a, b) => a - b);
    return (r[Math.floor((r.length - 1) / 2)] + r[Math.ceil((r.length - 1) / 2)]) / 2;
  })();
  const medianReprice = (() => {
    const r = env.dealers.map((d) => env.health[d.id].repriceRate).sort((a, b) => a - b);
    return (r[Math.floor((r.length - 1) / 2)] + r[Math.ceil((r.length - 1) / 2)]) / 2;
  })();
  /** One bar for "re-prices too often", used by the table cell and the Needs-you card alike. */
  const repriceBar = medianReprice * 2;

  const rows: DealerRow[] = env.dealers.map((dl) => {
    const health = env.health[dl.id];
    const cars = board.cars.filter((c) => c.dealerId === dl.id && upcoming(c));
    const open = cars.filter((c) => !DONE.includes(c.status) && !CLOSED.includes(c.status));
    // Today's run counts as the next pickup only while it still has cars to collect; once it's done, the week after.
    const runs = env.days.filter((d) => d.state !== 'done' && d.weekday === dl.runDay);
    const nextRun = runs.find((d) => d.state !== 'today' || open.some((c) => c.day === d.id)) ?? runs[0] ?? null;
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
      const r = ready(c);
      const runDate = env.dateOf(c.day);
      if (r === 'expiring') {
        const lateCar = c.onLotFrom && c.onLotFrom > c.expiresOn!;
        flags.push({
          key: `expiring-${c.id}`, kind: 'expiring', carId: c.id, who: contact,
          title: lateCar
            ? `${c.car}: offer ends ${label(c.expiresOn!)}, car on the lot ${label(c.onLotFrom!)}`
            : `${c.car}: offer ends ${label(c.expiresOn!)}, before the ${label(runDate)} run`,
          cost: `${money(c.offer)} offer lapses unless ${contact} accepts`,
        });
      }
      if (r === 'not_on_lot' && c.onLotFrom! > runDate) {
        const next = runOnOrAfter(c.onLotFrom!, dl.runDay);
        flags.push({
          key: `rolls-${c.id}`, kind: 'rolls', carId: c.id, who: contact,
          title: `${c.car} reaches the lot ${label(c.onLotFrom!)}, after the ${label(runDate)} run: goes on the ${label(next)} run`,
          cost: `rolls to ${label(next)}, cash a week later`,
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
    const unconfirmed = open.filter((c) => ready(c) === 'unconfirmed');
    if (unconfirmed.length) {
      const n = unconfirmed.length;
      flags.push({
        key: `unconfirmed-${dl.id}`, kind: 'unconfirmed', who: contact,
        title: `${n === 1 ? unconfirmed[0].car : `${n} cars`} not confirmed ready by the dealer yet`,
        cost: 'a car that isn’t ready waits a week',
      });
    }
    if (health.repriceRate >= repriceBar) {
      flags.push({
        key: `reprice-${dl.id}`, kind: 'health', who: contact,
        title: `Re-prices ${health.repriceRate}% of cars, about ${Math.round(health.repriceRate / medianReprice)}× the others`,
        cost: 'declarations run high, so prices get re-done on the lot and inspectors wait on directors',
      });
    }
    if (health.acceptRate < 60) {
      flags.push({
        key: `accept-${dl.id}`, kind: 'health', who: contact,
        title: `Takes ${health.acceptRate}% of offers`,
        cost: 'the rest go to auction or a competitor',
      });
    }
    if (health.daysToCash > 5) {
      flags.push({
        key: `cash-${dl.id}`, kind: 'health', who: contact,
        title: `Waits ${health.daysToCash.toFixed(1)} days for payment, about ${Math.round(health.daysToCash / medianCash)}× the others`,
        cost: 'slow money is the fastest way to lose a dealer',
      });
    }

    const route = nextRun ? board.routeFor(dl.id, nextRun.id) : undefined;
    const dispatchNote =
      route && !route.inspectorId && nextRun && open.some((c) => c.day === nextRun.id)
        ? `No inspector on ${nextRun.state === 'today' ? "today's" : `the ${nextRun.label}`} ${route.name} run yet`
        : null;

    // Sorted by what's in motion this week; the track record has its own card in Needs you.
    const weight: Record<FlagKind, number> = { live: 100, expiring: 30, rolls: 30, rolled: 20, unconfirmed: 10, health: 0 };
    const score = flags.reduce((s, f) => s + weight[f.kind], 0) + (dispatchNote ? 5 : 0);

    return {
      dealer: dl,
      health,
      nextRun,
      // Cars sold onto that run; open offers aren't on a truck until the dealer takes them.
      nextRunCars: nextRun ? open.filter((c) => c.day === nextRun.id && c.status !== 'offered' && c.status !== 'appraising').length : 0,
      counts: {
        ready: open.filter((c) => ready(c) === 'ready').length,
        unconfirmed: open.filter((c) => ready(c) === 'unconfirmed').length,
        notOnLot: open.filter((c) => ready(c) === 'not_on_lot').length,
        expiring: open.filter((c) => ready(c) === 'expiring').length,
        notReady: open.filter((c) => ready(c) === 'not_ready').length,
      },
      cars,
      flags,
      dispatchNote,
      score,
    };
  }).sort((a, b) => b.score - a.score || env.days.indexOf(a.nextRun!) - env.days.indexOf(b.nextRun!));

  // ---- Needs you: alerts only ---------------------------------------------
  const needs: Need[] = [];
  for (const l of live.filter((x) => x.escalated)) {
    needs.push({
      key: `call-${l.car.id}`, kind: 'call', tag: 'On the lot now', dealer: l.dealer, carId: l.car.id,
      title: `${l.car.car} · ${l.dealer.name}`,
      detail: `${l.director} hasn't answered the re-price, ${money(l.car.offer)} → ${money(l.car.newPrice!)}. ${l.inspector} leaves ~${l.leaves}; without an answer the car waits a week.`,
    });
  }
  // One card per dealer whose track record needs a conversation: re-prices, acceptance, payment speed.
  for (const r of rows) {
    const h = r.flags.filter((f) => f.kind === 'health');
    if (!h.length) continue;
    needs.push({
      key: `health-${r.dealer.id}`, kind: 'health', tag: 'Track record', dealer: r.dealer,
      title: r.dealer.name,
      detail: h.map((f) => `${f.title}: ${f.cost}.`).join(' '),
    });
  }
  const order: Record<Need['kind'], number> = { call: 0, health: 1 };
  needs.sort((a, b) => order[a.kind] - order[b.kind]);

  return {
    cars: board.cars, live, rows, needs, now, avgReprice, repriceBar,
    days: env.days, dealers: env.dealers, today: env.today, day, dayLabel: label, readiness: ready,
    carsAt: board.carsAt, routeFor: board.routeFor, inspectorName,
    waitedMin: (since: string) => now - toMin(since), minutesTo: (t: string) => toMin(t) - now,
  };
}

export type DealerBoard = ReturnType<typeof useDealerBoard>;
