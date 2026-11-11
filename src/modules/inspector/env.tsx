import { createContext, useContext } from 'react';
import type { CarStatus } from '../../domain/statuses';
import { CARS, RUN, STOPS, type InspectionCar, type Stop } from './fixtures';
import type { Difference, Outcome } from './useRun';

/** The run header: which day, which truck, whose run. */
export type RunInfo = typeof RUN;

/**
 * Outcomes and writes from the shared backend. Answers per checklist item stay on the phone (an inspection in
 * progress); what Sam decides, and what the director decides on another screen, comes back from here.
 */
export interface InspectorLive {
  outcomes: Record<string, Outcome>;
  statuses: Record<string, CarStatus>;
  confirm: (carId: string) => void;
  loadOnTruck: (carId: string) => void;
  sendReprice: (carId: string, to: number, diffs: Difference[]) => void;
  notReady: (carId: string, reason: string) => void;
  reopen: (carId: string) => void;
}

/** What the screen needs from outside: today's run, its stops and cars, and in the app the live outcomes and writes. */
export interface InspectorEnv {
  run: RunInfo;
  stops: Stop[];
  cars: InspectionCar[];
  live?: InspectorLive;
}

export const FIXTURE_ENV: InspectorEnv = { run: RUN, stops: STOPS, cars: CARS };

export const InspectorEnvContext = createContext<InspectorEnv>(FIXTURE_ENV);

/** The env plus lookups over its stops and cars. */
export function useInspectorEnv() {
  const env = useContext(InspectorEnvContext);
  return {
    ...env,
    carById: (id: string) => env.cars.find((c) => c.id === id),
    carsAt: (stopId: string) => env.cars.filter((c) => c.stopId === stopId),
    stopOf: (car: InspectionCar) => env.stops.find((s) => s.id === car.stopId)!,
    /** The dealer's next pickup day, where a not-ready car goes. */
    nextRunOf: (car: InspectionCar) => car.nextRun ?? env.run.nextRun,
    /** Who decides on a re-price at this car's dealer. */
    directorOf: (car: InspectionCar) => env.stops.find((s) => s.id === car.stopId)?.director ?? 'Dave',
  };
}
