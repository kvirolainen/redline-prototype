import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { demoNowMin, toMin } from '../../domain/calendar';
import type { CarStatus } from '../../domain/statuses';
import { useWorld } from '../../live/world';
import { InspectorEnvContext, type InspectorEnv, type InspectorLive } from './env';
import { CARS as SCRIPTED, type InspectionCar, type Stop } from './fixtures';
import type { Difference, Outcome, SentItem } from './useRun';

// C2 outside the app (Storybook): a small in-memory stand-in for the backend, set up like the live demo world at its
// start. Thursday Nov 12, 10:40, Sam on the lot at Yorkdale Honda: the RAV4 and CR-V are already on Truck 3, the
// Civic and the CX-5 are next, Vaughan Ford after. Dave's answer is played from a demo-only control.

const START_MIN = 10 * 60 + 40;

const STOPS: Stop[] = [
  { id: 'yorkdale', dealer: 'Yorkdale Honda', address: '3401 Dufferin St, Toronto', contact: 'Sales Manager', window: '10:15 – 11:45', director: 'Sales Director' },
  { id: 'vaughan', dealer: 'Vaughan Ford', address: '8111 Jane St, Vaughan', contact: 'Used Car Manager', window: '12:15 – 1:00', director: 'Sales Director' },
];

const civicScript = SCRIPTED.find((c) => c.id === 'civic')?.script;

const CARS: InspectionCar[] = [
  { id: 'civic', stopId: 'yorkdale', car: '2019 Honda Civic EX', trim: 'Sedan · CVT', colour: 'Lunar Silver', vin: '2HGFC2F69KH512345', km: 68400, keys: 2, offer: 17850, spot: 'Back row, spot 14', script: civicScript },
  { id: 'cx5', stopId: 'yorkdale', car: '2017 Mazda CX-5 GS', trim: 'AWD · Automatic', colour: 'Soul Red', vin: 'JM3KFBCL1H0198765', km: 102300, keys: 2, offer: 13900, spot: 'Service bay 2' },
  { id: 'rav4', stopId: 'yorkdale', car: '2020 Toyota RAV4 LE', trim: 'AWD · Automatic', colour: 'Magnetic Grey', vin: '2T3B1RFV0LC067821', km: 54200, keys: 2, offer: 24300, spot: 'Back row, spot 15' },
  { id: 'crv', stopId: 'yorkdale', car: '2021 Honda CR-V LX', trim: 'AWD · CVT', colour: 'Modern Steel', vin: '2HKRW2H26MH604412', km: 48900, keys: 2, offer: 26700, spot: 'Back row, spot 16' },
  { id: 'f150', stopId: 'vaughan', car: '2018 Ford F-150 XLT', trim: 'SuperCrew 4x4', colour: 'Oxford White', vin: '1FTEW1EP4JFB27719', km: 112400, keys: 2, offer: 24900, spot: 'Truck row' },
  { id: 'escape20', stopId: 'vaughan', car: '2020 Ford Escape SE', trim: 'AWD · Automatic', colour: 'Rapid Red', vin: '1FMCU9G60LUA80233', km: 61800, keys: 2, offer: 17300, spot: 'Front lot' },
];

const NEXT_RUN = 'Thu Nov 19';

interface DemoCar {
  status: CarStatus;
  offer: number;
  reprice?: { from: number; to: number; sent: SentItem[]; at: number };
  repriced?: boolean;
  note?: string;
}

/** The time the screen works with: demo minutes after midnight, and when each pending re-price was sent. */
export interface C2Time {
  now: number;
  sentAt: Record<string, number>;
}

/** Demo-only controls: what Back office and the clock would do in the app. */
export interface C2Demo {
  answer: (carId: string, accept: boolean) => void;
  pass: (min: number) => void;
  skipTo: (min: number) => void;
}

const DemoContext = createContext<{ time: C2Time; demo: C2Demo } | null>(null);

/** The demo controls, or null in the app (the answer comes from Back office there). */
export const useC2Demo = () => useContext(DemoContext)?.demo ?? null;

function useTick() {
  const [ms, setMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setMs(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  return ms;
}

/** Demo minutes and send times: from the live world in the app, from the stand-in in Storybook. */
export function useC2Time(): C2Time {
  const demo = useContext(DemoContext);
  const world = useWorld();
  const ms = useTick();
  if (demo) return demo.time;
  if (!world) return { now: START_MIN, sentAt: {} };
  const sentAt: Record<string, number> = {};
  for (const c of world.cars) if (c.status === 'reprice_pending' && c.reprice) sentAt[c.key] = toMin(c.reprice.at.slice(11, 16));
  return { now: demoNowMin(world.meta, ms), sentAt };
}

function outcomeOf(c: DemoCar): Outcome | undefined {
  const r = c.reprice;
  switch (c.status) {
    case 'confirmed':
      return { kind: 'confirmed', loaded: false, accepted: c.repriced && r ? { from: r.from, to: r.to } : undefined };
    case 'picked_up':
      return { kind: 'confirmed', loaded: true };
    case 'reprice_pending':
      return r && { kind: 'reprice', from: r.from, to: r.to, sent: r.sent };
    case 'declined':
      return r && { kind: 'reprice', from: r.from, to: r.to, sent: r.sent, declined: true };
    case 'not_ready':
      return { kind: 'not_ready', reason: c.note ?? 'Not ready', next: NEXT_RUN };
    default:
      return undefined;
  }
}

const initial = (): Record<string, DemoCar> =>
  Object.fromEntries(CARS.map((c) => [c.id, { status: c.id === 'rav4' || c.id === 'crv' ? 'picked_up' : 'awaiting_pickup', offer: c.offer }]));

/** Wraps C2 in Storybook: the run, its cars and decisions in memory, a demo clock, and Dave's answer on demand. */
export function C2DemoWorld({ children }: { children: ReactNode }) {
  const [cars, setCars] = useState(initial);
  const [startMs] = useState(() => Date.now());
  const [offset, setOffset] = useState(0);
  const ms = useTick();
  const now = START_MIN + Math.floor((ms - startMs) / 60000) + offset;

  const patch = (id: string, p: Partial<DemoCar> | ((c: DemoCar) => Partial<DemoCar>)) =>
    setCars((prev) => ({ ...prev, [id]: { ...prev[id], ...(typeof p === 'function' ? p(prev[id]) : p) } }));
  const base = (id: string) => CARS.find((c) => c.id === id)!.offer;

  const live: InspectorLive = {
    outcomes: Object.fromEntries(Object.entries(cars).flatMap(([id, c]) => {
      const o = outcomeOf(c);
      return o ? [[id, o]] : [];
    })),
    statuses: Object.fromEntries(Object.entries(cars).map(([id, c]) => [id, c.status])),
    confirm: (id) => patch(id, { status: 'confirmed' }),
    loadOnTruck: (id) => patch(id, { status: 'picked_up' }),
    sendReprice: (id, to, diffs: Difference[]) =>
      patch(id, (c) => ({
        status: 'reprice_pending',
        reprice: {
          from: c.offer,
          to,
          at: now,
          sent: diffs.map((d) => ({ label: d.item.question, declared: d.declared, found: d.finding, amount: d.adjustment, photos: d.photos })),
        },
      })),
    notReady: (id, reason) => patch(id, { status: 'not_ready', note: reason }),
    reopen: (id) => patch(id, { status: 'awaiting_pickup', offer: base(id), reprice: undefined, repriced: false, note: undefined }),
  };

  const sentAt: Record<string, number> = {};
  for (const [id, c] of Object.entries(cars)) if (c.status === 'reprice_pending' && c.reprice) sentAt[id] = c.reprice.at;

  const demo: C2Demo = {
    answer: (id, accept) =>
      patch(id, (c) =>
        c.status !== 'reprice_pending' || !c.reprice
          ? {}
          : accept
            ? { status: 'confirmed', repriced: true, offer: c.reprice.to }
            : { status: 'declined', repriced: true },
      ),
    pass: (min) => setOffset((o) => o + min),
    skipTo: (min) => setOffset((o) => o + Math.max(0, min - now)),
  };

  const env: InspectorEnv = {
    run: { day: 'Thursday', date: 'Today, Thu Nov 12', nextRun: NEXT_RUN, truck: 'Truck 3', inspector: 'Inspector' },
    stops: STOPS,
    cars: CARS.map((c) => ({ ...c, offer: cars[c.id].offer, nextRun: NEXT_RUN })),
    live,
  };

  return (
    <DemoContext.Provider value={{ time: { now, sentAt }, demo }}>
      <InspectorEnvContext.Provider value={env}>{children}</InspectorEnvContext.Provider>
    </DemoContext.Provider>
  );
}
