import { useMemo, type ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ROUTE_TEMPLATES, UNASSIGNED_RUNS, clock, dayLabel, nextPickup, runWindow, shortDate, toMin, weekday, type RunDay } from '../domain/calendar';
import { OpsEnvContext, type OpsEnv } from '../modules/ops-board/env';
import { INSPECTORS, type Day, type Dealer, type DealerHealth, type OpsCar, type Route } from '../modules/ops-board/fixtures';
import { useDemoNow, useLiveWorld, type LiveCar, type LiveDealer } from './world';

// Cars that never reach a pickup run: still being priced, or kept by the dealer for its own lot.
const OFF_BOARD = ['appraising', 'kept'];

const toDay = ({ date, state }: RunDay): Day => ({
  id: date,
  label: shortDate(date),
  weekday: weekday(date),
  date: shortDate(date).split(' ').slice(1).join(' '),
  state,
});

const toDealer = (d: LiveDealer): Dealer => ({ id: d.key, name: d.name, area: d.area, runDay: d.runDay, contact: d.contact, director: d.director, window: d.window });

/** "Windshield: declared clean, found cracked. Rear bumper: …" */
const reasonOf = (items: NonNullable<LiveCar['reprice']>['items']) =>
  items.map((i) => `${i.label}: declared ${i.declared.toLowerCase()}, found ${i.found.toLowerCase()}`).join('. ') + (items.length ? '.' : '');

/** A live car as the ops board reads it. Its run day is its booked pickup; an open offer sits on the run it would join. */
function toOpsCar(c: LiveCar, dealer: LiveDealer, today: string): OpsCar | null {
  if (OFF_BOARD.includes(c.status)) return null;
  const runDate = c.runDate ?? (c.status === 'offered' ? nextPickup(today, dealer.runDay) : undefined);
  if (!runDate) return null;
  const r = c.status === 'reprice_pending' ? c.reprice : undefined;
  const [rDay, rTime] = r ? r.at.split('T') : [];
  const since = r ? (rDay === today ? clock(toMin(rTime)) : shortDate(rDay)) : undefined;
  return {
    id: c.key,
    dealerId: c.dealer,
    day: runDate,
    car: c.car,
    vin: c.vin,
    km: c.km,
    offer: c.offer,
    status: c.status,
    newPrice: r?.to,
    reason: r ? reasonOf(r.items) : undefined,
    waiting: since && `since ${since}`,
    // The live band only shows a re-price raised today, while the inspector is still on the lot.
    waitingSince: r && rDay === today ? since : undefined,
    // The truck leaves at the end of the dealer's pickup window, the same time the inspector's phone shows.
    inspectorLeaves: r ? (dealer.window ? (dealer.window.split('–')[1]?.trim() ?? clock(r.inspectorLeaves)) : clock(r.inspectorLeaves)) : undefined,
    rolledFrom: c.rolledFrom,
    note: c.note,
    expires: c.status === 'offered' && c.expiresOn ? dayLabel(c.expiresOn, today) : undefined,
    expiresOn: c.expiresOn,
    onLotFrom: c.onLotFrom,
    ready: c.ready,
    missing: missingOf(c),
  };
}

const CHECK_MISSING: Record<string, string> = { lot: 'not on the lot yet', keys: 'second key missing', papers: 'ownership papers missing' };

/** What the sales manager's check still lacks, as Back office shows it ("Second key missing"). */
function missingOf(c: { ready?: boolean; readyChecks?: string[] }) {
  if (c.ready !== false) return undefined;
  const ticked = c.readyChecks ?? [];
  if (!ticked.length) return 'Not checked by the dealer yet';
  const m = Object.keys(CHECK_MISSING).filter((k) => !ticked.includes(k)).map((k) => CHECK_MISSING[k]).join(', ');
  return m ? m[0].toUpperCase() + m.slice(1) : undefined;
}

export function OpsLive({ children }: { children: ReactNode }) {
  const world = useLiveWorld();
  const now = useDemoNow(world.meta);
  const today = world.meta.today;
  const opsNote = useMutation(api.cars.opsNote);

  const base = useMemo(() => {
    const window = runWindow(today);
    const days = window.map(toDay);
    const inWindow = new Set(days.map((d) => d.id));
    const day = (id: string): Day =>
      days.find((d) => d.id === id) ?? toDay({ date: id, state: id < today ? 'done' : id === today ? 'today' : 'planned' });

    const routes: Route[] = window.flatMap(({ date }) =>
      ROUTE_TEMPLATES.filter((t) => t.weekday === weekday(date)).map((t) => ({
        id: `${date}-${t.name.toLowerCase()}`,
        day: date,
        name: t.name,
        truck: t.truck,
        inspectorId: UNASSIGNED_RUNS.has(`${date}:${t.name}`) ? null : t.inspector,
        start: t.start,
        stops: t.stops,
      })),
    );

    const health: Record<string, DealerHealth> = Object.fromEntries(
      world.dealers.map((d) => [d.key, { repriceRate: d.repriceRate, acceptRate: d.acceptRate, daysToCash: d.daysToCash, inspected: d.inspected }]),
    );
    const byKey = new Map(world.dealers.map((d) => [d.key, d]));
    const cars = world.cars
      .map((c) => {
        const d = byKey.get(c.dealer);
        return d ? toOpsCar(c, d, today) : null;
      })
      .filter((c): c is OpsCar => !!c && inWindow.has(c.day));

    return { days, day, routes, health, cars, dealers: world.dealers.map(toDealer) };
  }, [world, today]);

  const env: OpsEnv = {
    ...base,
    dateOf: (id) => id,
    inspectors: INSPECTORS,
    today,
    nowLabel: `${shortDate(today)}, ${clock(Math.min(now, 23 * 60 + 59))}`,
    now,
    startTime: clock(now),
    live: { note: (n) => void opsNote(n) },
  };

  return <OpsEnvContext.Provider value={env}>{children}</OpsEnvContext.Provider>;
}
