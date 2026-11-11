import { createContext, useContext } from 'react';
import { CIVIC, DATES, ELANTRA, F150, HRV, type DecodedCar } from './fixtures';
import type { Answers, Quote } from './pricing';

/** What a finished trade-in hands to the backend. */
export interface TradeInSubmission {
  car: DecodedCar;
  km: number;
  answers: Answers;
  quote: Quote;
  mode: 'accepted' | 'review-sent';
  reviewReasons: string[];
}

/**
 * What the screen needs from outside: the dates it shows, the demo cars it offers, and where a finished trade-in
 * goes. Storybook uses the fixed fixtures; the app passes the live calendar and a submit that writes the car.
 * `submit` resolves to an error message, or null when it worked.
 */
export interface TradeInEnv {
  dates: typeof DATES;
  demoCars: DecodedCar[];
  submit?: (s: TradeInSubmission) => Promise<string | null>;
}

export const FIXTURE_ENV: TradeInEnv = { dates: DATES, demoCars: [CIVIC, ELANTRA, F150] };

export const TradeInEnvContext = createContext<TradeInEnv>(FIXTURE_ENV);
export const useTradeInEnv = () => useContext(TradeInEnvContext);

/** In the live demo the Civic is already on Clutch's books, so the HR-V leads the demo cars. */
export const LIVE_DEMO_CARS = [HRV, ELANTRA, F150];
