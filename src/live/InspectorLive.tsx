import type { ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ROUTE_TEMPLATES, longDate, nextPickup, shortDate, weekday } from '../domain/calendar';
import type { CarStatus } from '../domain/statuses';
import { InspectorEnvContext, type InspectorEnv, type InspectorLive as LiveOps } from '../modules/inspector/env';
import { CARS as SCRIPTED, type InspectionCar, type Stop } from '../modules/inspector/fixtures';
import type { Outcome } from '../modules/inspector/useRun';
import { useLiveWorld, type LiveCar } from './world';

const INSPECTOR = 'sam';
// Who the timeline shows for the inspector's actions: a role, never a name.
const WHO = 'Inspector';
/** Statuses a car can have once it's on a pickup run. */
const ON_RUN: CarStatus[] = ['awaiting_pickup', 'not_ready', 'reprice_pending', 'confirmed', 'picked_up', 'paid', 'declined'];

/** What the car's live status means on the phone. Awaiting pickup = nothing decided yet. */
function outcomeOf(c: LiveCar, nextRun: string): Outcome | undefined {
  const r = c.reprice;
  const sent = r?.items.map((i) => ({
    label: i.label,
    declared: i.declared,
    found: i.found,
    amount: i.amount,
    photos: r.photos.filter((p) => p.startsWith(i.label)).length,
  }));
  switch (c.status) {
    case 'confirmed':
      return { kind: 'confirmed', loaded: false, accepted: c.repriced && r ? { from: r.from, to: r.to } : undefined };
    case 'picked_up':
    case 'paid':
      return { kind: 'confirmed', loaded: true };
    case 'reprice_pending':
      return r ? { kind: 'reprice', from: r.from, to: r.to, sent } : undefined;
    case 'declined':
      return r ? { kind: 'reprice', from: r.from, to: r.to, sent, declined: true } : undefined;
    case 'not_ready':
      return { kind: 'not_ready', reason: c.note ?? 'Not ready', next: nextRun };
    default:
      return undefined;
  }
}

/** Sam's run today, from the live world: his routes' stops in driving order, and the cars on them. */
export function InspectorLive({ children }: { children: ReactNode }) {
  const world = useLiveWorld();
  const today = world.meta.today;

  const m = {
    confirmMatch: useMutation(api.cars.confirmMatch),
    sendReprice: useMutation(api.cars.sendReprice),
    markNotReady: useMutation(api.cars.markNotReady),
    reopenInspection: useMutation(api.cars.reopenInspection),
  };

  const routes = ROUTE_TEMPLATES.filter((r) => r.weekday === weekday(today) && r.inspector === INSPECTOR);
  const stopKeys = [...new Set(routes.flatMap((r) => r.stops))];
  const dealers = stopKeys.flatMap((k) => world.dealers.filter((d) => d.key === k));

  const stops: Stop[] = dealers.map((d) => ({
    id: d.key,
    dealer: d.name,
    address: d.address,
    contact: d.contact,
    window: d.window,
    director: d.director,
  }));

  const live = world.cars.filter(
    (c) => stopKeys.includes(c.dealer) && ON_RUN.includes(c.status) && (c.runDate === today || c.rolledFrom === today),
  );

  const nextRunOf = (c: LiveCar) => {
    const d = dealers.find((x) => x.key === c.dealer)!;
    return shortDate(nextPickup(today, d.runDay));
  };

  const cars: InspectionCar[] = stopKeys.flatMap((k) =>
    live
      .filter((c) => c.dealer === k)
      .map((c) => ({
        id: c.key,
        stopId: c.dealer,
        car: c.car,
        trim: c.trim,
        colour: c.colour,
        vin: c.vin,
        km: c.km,
        keys: c.keys,
        offer: c.offer,
        spot: c.spot ?? 'On the lot',
        script: SCRIPTED.find((s) => s.vin === c.vin)?.script,
        declared: c.declared,
        nextRun: nextRunOf(c),
      })),
  );

  const outcomes: Record<string, Outcome> = {};
  const statuses: Record<string, CarStatus> = {};
  for (const c of live) {
    statuses[c.key] = c.status;
    const o = outcomeOf(c, c.status === 'not_ready' && c.runDate ? shortDate(c.runDate) : nextRunOf(c));
    if (o) outcomes[c.key] = o;
  }

  const ops: LiveOps = {
    outcomes,
    statuses,
    confirm: (key) => void m.confirmMatch({ key, who: WHO, load: false }),
    loadOnTruck: (key) => void m.confirmMatch({ key, who: WHO, load: true }),
    sendReprice: (key, to, diffs) =>
      void m.sendReprice({
        key,
        who: WHO,
        to,
        items: diffs.map((d) => ({
          label: d.item.question,
          declared: d.declared,
          found: d.note ? `${d.finding}. ${d.note}` : d.finding,
          amount: d.adjustment,
        })),
        photos: diffs.flatMap((d) => Array.from({ length: d.photos }, (_, i) => `${d.item.question}, photo ${i + 1}`)),
      }),
    notReady: (key, reason) => void m.markNotReady({ key, who: WHO, reason }),
    reopen: (key) => void m.reopenInspection({ key, who: WHO }),
  };

  const truck = routes[0]?.truck ?? '';
  const env: InspectorEnv = {
    run: {
      day: longDate(today).split(',')[0],
      date: `Today, ${shortDate(today)}`,
      nextRun: dealers[0] ? shortDate(nextPickup(today, dealers[0].runDay)) : '',
      truck,
      inspector: WHO,
    },
    stops,
    cars,
    live: ops,
  };

  return <InspectorEnvContext.Provider value={env}>{children}</InspectorEnvContext.Provider>;
}
