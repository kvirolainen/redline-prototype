import { useState } from 'react';
import { money } from '../../domain/format';
import { CARS, DAYS, DEALERS, INSPECTORS, ROUTES, TRUCK_CAPACITY, type DayId, type OpsCar, type Route } from './fixtures';

// Local state for the ops board prototype: cars, routes and what Jordan has dealt with.
// The three variants share it, so the same click does the same thing everywhere.

export type ExceptionKind = 'reprice' | 'unassigned' | 'expiring' | 'not_ready';

export interface OpsException {
  key: string;
  kind: ExceptionKind;
  title: string;
  subject: string; // car or run
  detail: string;
  dealerId: string;
  day: DayId;
  age: string;
  carId?: string;
  routeId?: string;
  nudged: boolean;
}

/** Upcoming days a car or run can move to. */
export const futureDays = (except: DayId) => DAYS.filter((d) => d.state !== 'done' && d.id !== except);

export const day = (id: DayId) => DAYS.find((d) => d.id === id)!;
export const dealer = (id: string) => DEALERS.find((d) => d.id === id)!;
export const inspectorName = (id: string | null) => (id ? INSPECTORS.find((i) => i.id === id)!.name : null);

/** Cars Sam has already looked at (or that are past pickup). */
const INSPECTED = new Set(['confirmed', 'picked_up', 'paid', 'reprice_pending', 'declined', 'not_ready']);
export const isInspected = (c: OpsCar) => INSPECTED.has(c.status);

/** A car still counts on a truck unless it was declined, or only offered. */
export const onTruck = (c: OpsCar) => c.status !== 'declined' && c.status !== 'offered' && c.status !== 'not_ready';

export function useOpsBoard() {
  const [cars, setCars] = useState<OpsCar[]>(CARS);
  const [routes, setRoutes] = useState<Route[]>(ROUTES);
  const [handled, setHandled] = useState<Record<string, string>>({}); // key -> what was done
  const [nudged, setNudged] = useState<Record<string, true>>({});
  const [log, setLog] = useState<string[]>([]);

  const note = (line: string) => setLog((l) => [line, ...l]);

  // ---- reads -------------------------------------------------------------
  const carsAt = (dealerId: string, d: DayId) => cars.filter((c) => c.dealerId === dealerId && c.day === d);
  /** Cars that rolled off this run to a later one. */
  const rolledOut = (dealerId: string, d: DayId) => cars.filter((c) => c.dealerId === dealerId && c.rolledFrom === d && c.day !== d);
  const routesOn = (d: DayId) => routes.filter((r) => r.day === d);
  const routeFor = (dealerId: string, d: DayId) => routes.find((r) => r.day === d && r.stops.includes(dealerId));
  const routeCars = (r: Route) => r.stops.flatMap((s) => carsAt(s, r.day));
  const routeLoad = (r: Route) => routeCars(r).filter(onTruck).length;
  const busyInspector = (inspectorId: string, d: DayId) => routes.find((r) => r.day === d && r.inspectorId === inspectorId);

  const exceptions = ((): OpsException[] => {
    const out: OpsException[] = [];
    for (const c of cars) {
      const dl = dealer(c.dealerId);
      if (c.status === 'reprice_pending' && c.newPrice) {
        out.push({
          key: `reprice-${c.id}`, kind: 'reprice', title: `Re-price waiting on ${dl.director}`,
          subject: c.car, dealerId: c.dealerId, day: c.day, carId: c.id, age: `Waiting ${c.waiting ?? 'since this morning'}`,
          detail: `${money(c.offer)} → ${money(c.newPrice)}. ${c.reason ?? ''}`.trim(),
          nudged: !!nudged[`reprice-${c.id}`],
        });
      }
      if (c.status === 'offered' && c.expires) {
        out.push({
          key: `expiring-${c.id}`, kind: 'expiring', title: c.expires.startsWith('today') ? 'Offer expires today' : `Offer expires ${c.expires}`,
          subject: c.car, dealerId: c.dealerId, day: c.day, carId: c.id, age: `Ends ${c.expires}`,
          detail: `${money(c.offer)} offer, not accepted yet. If ${dl.contact.split(',')[0]} takes it, the car joins ${day(c.day).label}.`,
          nudged: !!nudged[`expiring-${c.id}`],
        });
      }
      if (c.rolledFrom && c.status === 'not_ready') {
        out.push({
          key: `rolled-${c.id}`, kind: 'not_ready', title: 'Not ready, rolled to next run',
          subject: c.car, dealerId: c.dealerId, day: c.day, carId: c.id, age: `From ${day(c.rolledFrom).label}`,
          detail: `${c.note ?? 'Not ready at pickup'}. Now on ${day(c.day).label}. Move it sooner if the dealer finds the keys.`,
          nudged: false,
        });
      }
    }
    for (const r of routes) {
      if (r.inspectorId || day(r.day).state === 'done') continue;
      const n = routeLoad(r);
      if (!n) continue;
      out.push({
        key: `unassigned-${r.id}`, kind: 'unassigned', title: 'No inspector on a run',
        subject: `${r.name} run · ${r.truck}`, dealerId: r.stops[0], day: r.day, routeId: r.id,
        age: day(r.day).state === 'today' ? `Leaves ${r.start} today` : `Leaves ${r.start}, ${day(r.day).label}`,
        detail: `${r.stops.map((s) => dealer(s).name).join(', ')} · ${n} cars`,
        nudged: false,
      });
    }
    const rank: Record<ExceptionKind, number> = { reprice: 0, unassigned: 1, expiring: 2, not_ready: 3 };
    return out.filter((e) => !handled[e.key]).sort((a, b) => rank[a.kind] - rank[b.kind]);
  })();

  const handledList = Object.entries(handled).map(([key, what]) => ({ key, what }));

  // ---- writes ------------------------------------------------------------
  /** Put the dealer on a run that day: its existing route, else the lightest one. */
  const ensureStop = (dealerId: string, d: DayId, rs: Route[]) => {
    if (rs.some((r) => r.day === d && r.stops.includes(dealerId))) return rs;
    const sameDay = rs.filter((r) => r.day === d);
    const target = sameDay.sort((a, b) => routeLoad(a) - routeLoad(b))[0];
    return rs.map((r) => (r.id === target.id ? { ...r, stops: [...r.stops, dealerId] } : r));
  };

  const moveCar = (carId: string, to: DayId) => {
    const c = cars.find((x) => x.id === carId)!;
    setRoutes((rs) => ensureStop(c.dealerId, to, rs));
    setCars((cs) =>
      cs.map((x) => (x.id === carId ? { ...x, day: to, status: x.status === 'not_ready' ? 'awaiting_pickup' : x.status } : x)),
    );
    if (c.rolledFrom) setHandled((h) => ({ ...h, [`rolled-${c.id}`]: `${c.car} moved to ${day(to).label}` }));
    note(`${c.car} moved to ${day(to).label}`);
  };

  /** Move a dealer's whole run (its open cars) to another day. */
  const moveRun = (dealerId: string, from: DayId, to: DayId) => {
    const moving = cars.filter((c) => c.dealerId === dealerId && c.day === from && !isInspected(c));
    const keepsStop = cars.some((c) => c.dealerId === dealerId && c.day === from && isInspected(c));
    setRoutes((rs) =>
      ensureStop(dealerId, to, rs).map((r) =>
        r.day === from && !keepsStop ? { ...r, stops: r.stops.filter((s) => s !== dealerId) } : r,
      ),
    );
    setCars((cs) => cs.map((c) => (moving.some((m) => m.id === c.id) ? { ...c, day: to } : c)));
    note(`${dealer(dealerId).name}: ${moving.length} cars moved from ${day(from).label} to ${day(to).label}`);
  };

  /** Move a stop to another truck on the same day. */
  const moveStop = (dealerId: string, d: DayId, toRouteId: string) => {
    setRoutes((rs) =>
      rs.map((r) => {
        if (r.day !== d) return r;
        if (r.id === toRouteId) return r.stops.includes(dealerId) ? r : { ...r, stops: [...r.stops, dealerId] };
        return { ...r, stops: r.stops.filter((s) => s !== dealerId) };
      }),
    );
    const to = routes.find((r) => r.id === toRouteId)!;
    note(`${dealer(dealerId).name} moved to the ${to.name} run (${to.truck})`);
  };

  const assignInspector = (routeId: string, inspectorId: string) => {
    const r = routes.find((x) => x.id === routeId)!;
    setRoutes((rs) => rs.map((x) => (x.id === routeId ? { ...x, inspectorId } : x)));
    const who = inspectorName(inspectorId);
    setHandled((h) => ({ ...h, [`unassigned-${routeId}`]: `${who} assigned to the ${r.name} run, ${day(r.day).label}` }));
    note(`${who} assigned to the ${r.name} run, ${day(r.day).label}`);
  };

  const nudge = (e: OpsException) => {
    setNudged((n) => ({ ...n, [e.key]: true }));
    const dl = dealer(e.dealerId);
    note(e.kind === 'reprice' ? `Reminder sent to ${dl.director} at ${dl.name}` : `Reminder sent to ${dl.contact.split(',')[0]} at ${dl.name}`);
  };

  const keepAsIs = (e: OpsException) => {
    setHandled((h) => ({ ...h, [e.key]: `${e.subject}: kept on ${day(e.day).label}` }));
    note(`${e.subject}: kept on ${day(e.day).label}`);
  };

  return {
    cars, routes, exceptions, handledList, log, TRUCK_CAPACITY,
    carsAt, rolledOut, routesOn, routeFor, routeCars, routeLoad, busyInspector,
    moveCar, moveRun, moveStop, assignInspector, nudge, keepAsIs,
  };
}

export type OpsBoard = ReturnType<typeof useOpsBoard>;
