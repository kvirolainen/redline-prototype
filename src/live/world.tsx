import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { demoNowMin, type DemoMeta } from '../domain/calendar';

// The live layer. In the app, one query brings the whole demo world (clock, dealers, cars, events) and every module
// reads from it, so a change on one screen shows on all of them. In Storybook there's no backend: modules fall back
// to their own fixtures, which is what keeps design review fast.

export type LiveCar = Doc<'cars'>;
export type LiveDealer = Doc<'dealers'>;
export type LiveEvent = Doc<'events'>;

export interface World {
  meta: DemoMeta;
  dealers: LiveDealer[];
  cars: LiveCar[];
  events: LiveEvent[];
}

/** True only inside the app, where a Convex client exists. */
export const BackendContext = createContext(false);
export const useHasBackend = () => useContext(BackendContext);

const WorldContext = createContext<World | null>(null);

/** The live world, or null outside the app (Storybook). */
export const useWorld = () => useContext(WorldContext);

/** Like useWorld, for components that only render inside a WorldProvider. */
export function useLiveWorld() {
  const w = useContext(WorldContext);
  if (!w) throw new Error('useLiveWorld outside WorldProvider');
  return w;
}

/** Demo minutes after midnight, ticking forward in real time. */
export function useDemoNow(meta: DemoMeta) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);
  return demoNowMin(meta, now);
}

export function WorldProvider({ children, empty }: { children: ReactNode; empty: ReactNode }) {
  const data = useQuery(api.world.get);
  if (data === undefined) return <div className="grid flex-1 place-items-center p-10 text-sm text-muted">Loading…</div>;
  if (!data.meta) return <>{empty}</>;
  // Keyed by the clock's start: a reset or a skip remounts the screens, so no screen keeps state about cars that
  // changed or no longer exist.
  return (
    <WorldContext.Provider value={{ ...data, meta: data.meta }}>
      <Fragment key={data.meta.setAt}>{children}</Fragment>
    </WorldContext.Provider>
  );
}

/** The persona's dealer for the demo: Maria and Dave both work at Yorkdale Honda. */
export const DEMO_DEALER = 'yorkdale';
