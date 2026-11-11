import { createContext, useContext } from 'react';
import {
  CARS,
  DAY_DATE,
  DAYS,
  DEALER_HEALTH,
  DEALERS,
  INSPECTORS,
  NOW_LABEL,
  NOW_TIME,
  ROUTES,
  TODAY_DATE,
  type Day,
  type DayId,
  type Dealer,
  type DealerHealth,
  type Inspector,
  type OpsCar,
  type Route,
} from './fixtures';

/** A note Jordan's action leaves on the shared record: a reminder sent, a call, a hand-off to dispatch. */
export interface OpsNote {
  dealer: string;
  car?: string;
  text: string;
}

/**
 * What the ops board needs from outside: the run days, dealers, routes and cars, and the demo moment.
 * Storybook uses the fixed fixtures; the app passes the live world and a note writer.
 */
export interface OpsEnv {
  days: Day[];
  /** Any run day by id, including ones outside the window (a car rolled from an older run). */
  day: (id: DayId) => Day;
  /** Calendar date of a run day, ISO. */
  dateOf: (id: DayId) => string;
  dealers: Dealer[];
  health: Record<string, DealerHealth>;
  inspectors: Inspector[];
  routes: Route[];
  cars: OpsCar[];
  /** Today, ISO. */
  today: string;
  /** "Thu Nov 12, 11:40" */
  nowLabel: string;
  /** Demo minutes after midnight when the clock is shared; absent, the board starts its own clock at `startTime`. */
  now?: number;
  startTime: string;
  /** Present in the app: cars and routes are read live, Jordan's actions write a note. */
  live?: { note: (n: OpsNote) => void };
}

export const FIXTURE_ENV: OpsEnv = {
  days: DAYS,
  day: (id) => DAYS.find((d) => d.id === id)!,
  dateOf: (id) => DAY_DATE[id],
  dealers: DEALERS,
  health: DEALER_HEALTH,
  inspectors: INSPECTORS,
  routes: ROUTES,
  cars: CARS,
  today: TODAY_DATE,
  nowLabel: NOW_LABEL,
  startTime: NOW_TIME,
};

export const OpsEnvContext = createContext<OpsEnv>(FIXTURE_ENV);
export const useOpsEnv = () => useContext(OpsEnvContext);
