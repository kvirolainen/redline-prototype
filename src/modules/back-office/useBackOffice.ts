import { createContext, useContext, useMemo, useState } from 'react';
import { money } from '../../domain/format';
import type { CarStatus } from '../../domain/statuses';
import { AUCTION_DAYS_TO_CASH, BACK_OFFICE_CARS, DEALER, NEXT_PICKUP, OFFERS_NOT_TAKEN, READY_CHECKS, TODAY, type BackOfficeCar, type ReadyCheck } from './fixtures';

const SOLD: CarStatus[] = ['awaiting_pickup', 'not_ready', 'reprice_pending', 'confirmed', 'picked_up', 'paid'];

export interface Stats {
  sold: number;
  aboveAuction: number;
  daysToCash: number;
  acceptance: number;
  repriceRate: number;
}

export function computeStats(cars: BackOfficeCar[]): Stats {
  const sold = cars.filter((c) => SOLD.includes(c.status));
  const accepted = cars.filter((c) => SOLD.includes(c.status) || c.status === 'declined').length;
  const paid = cars.filter((c) => c.daysToCash !== undefined);
  const inspected = cars.filter((c) => c.inspected);
  return {
    sold: sold.length,
    aboveAuction: sold.reduce((s, c) => s + (c.offer - c.auction), 0),
    daysToCash: Math.round(paid.reduce((s, c) => s + (c.daysToCash ?? 0), 0) / Math.max(paid.length, 1)),
    acceptance: Math.round((accepted / (accepted + OFFERS_NOT_TAKEN)) * 100),
    repriceRate: Math.round((inspected.filter((c) => c.repriced).length / Math.max(inspected.length, 1)) * 100),
  };
}

export { AUCTION_DAYS_TO_CASH };

/** Derived lists every version shows: cars the dealer can still pull from the next pickup, and what needs a decision. */
export function summarize(cars: BackOfficeCar[], nextPickup: string) {
  return {
    stats: computeStats(cars),
    nextRun: cars.filter((c) => c.pickup === nextPickup && (c.status === 'awaiting_pickup' || c.status === 'not_ready' || c.status === 'kept')),
    needsYou: cars.filter((c) => c.status === 'reprice_pending' || (c.status === 'offered' && c.expiresSoon)),
  };
}

/** What the screen needs from outside: the dealer, the dates, and in the app the live cars and actions. */
export interface BackOfficeEnv {
  dealer: string;
  today: string;
  nextPickup: string;
  live?: BackOffice;
}

export const BackOfficeEnvContext = createContext<BackOfficeEnv>({ dealer: DEALER, today: TODAY, nextPickup: NEXT_PICKUP });
export const useBackOfficeEnv = () => useContext(BackOfficeEnvContext);

/** The live backend's cars and actions inside the app; local fixtures in Storybook. */
export function useBackOffice(initial: BackOfficeCar[] = BACK_OFFICE_CARS): BackOffice {
  const env = useBackOfficeEnv();
  const local = useLocalBackOffice(initial);
  return env.live ?? local;
}

/** Local stand-in for the shared backend: the cars plus the things the dealer can do. */
function useLocalBackOffice(initial: BackOfficeCar[] = BACK_OFFICE_CARS) {
  const [cars, setCars] = useState<BackOfficeCar[]>(() => structuredClone(initial));

  const update = (vin: string, fn: (c: BackOfficeCar) => BackOfficeCar) =>
    setCars((list) => list.map((c) => (c.vin === vin ? fn(c) : c)));

  const acceptReprice = (vin: string) =>
    update(vin, (c) => ({
      ...c,
      status: 'confirmed',
      offer: c.reprice ? c.reprice.to : c.offer,
      auction: c.reprice ? c.reprice.auctionAsFound : c.auction,
      events: [
        ...c.events,
        { at: 'Today, just now', who: 'Dave', text: `Accepted the re-price: ${money(c.reprice?.to ?? c.offer)}`, kind: 'decision' },
        { at: 'Today, just now', who: 'Redline', text: 'Confirmed. Sam loads it on today’s truck; payment within 2 business days', kind: 'pickup' },
      ],
    }));

  const declineReprice = (vin: string) =>
    update(vin, (c) => ({
      ...c,
      status: 'declined',
      note: 'Re-price declined. Stays with the dealer',
      events: [
        ...c.events,
        { at: 'Today, just now', who: 'Dave', text: `Declined the re-price. Car stays with ${DEALER}`, kind: 'decision' },
      ],
    }));

  const refreshOffer = (vin: string) =>
    update(vin, (c) => ({
      ...c,
      expires: NEXT_PICKUP,
      expiresSoon: false,
      events: [
        ...c.events,
        { at: 'Today, just now', who: 'Maria', text: `Offer refreshed: ${money(c.offer)} holds until ${NEXT_PICKUP}`, kind: 'offer' },
      ],
    }));

  const keep = (vin: string) =>
    update(vin, (c) => ({
      ...c,
      status: 'kept',
      note: 'Kept for your lot',
      events: [...c.events, { at: 'Today, just now', who: 'Dave', text: `Kept for the lot. Off the ${c.pickup} pickup`, kind: 'decision' }],
    }));

  const undoKeep = (vin: string) =>
    update(vin, (c) => ({
      ...c,
      status: 'awaiting_pickup',
      note: undefined,
      events: [...c.events, { at: 'Today, just now', who: 'Dave', text: `Back on the ${c.pickup} pickup`, kind: 'decision' }],
    }));

  const setReady = (vin: string, checks: ReadyCheck[]) =>
    update(vin, (c) => {
      const missing = READY_CHECKS.filter((r) => !checks.includes(r.id));
      const ready = missing.length === 0;
      return {
        ...c,
        ready,
        readyChecks: ready ? undefined : checks,
        status: ready && c.status === 'not_ready' ? 'awaiting_pickup' : c.status,
        note: ready ? undefined : c.note,
        events: [
          ...c.events,
          {
            at: 'Today, just now',
            who: 'Maria',
            text: ready ? 'Marked ready: on the lot, both keys, ownership papers' : `Not ready yet: missing ${missing.map((m) => m.label.toLowerCase()).join(', ')}`,
            kind: 'pickup',
          },
        ],
      };
    });

  const acceptOffer = (vin: string) =>
    update(vin, (c) => ({
      ...c,
      status: 'awaiting_pickup',
      pickup: NEXT_PICKUP,
      expires: undefined,
      expiresSoon: false,
      ready: false,
      events: [...c.events, { at: 'Today, just now', who: 'Maria', text: `Accepted. Joined the next pickup, ${NEXT_PICKUP}`, kind: 'accept' }],
    }));

  const { stats, nextRun, needsYou } = useMemo(() => summarize(cars, NEXT_PICKUP), [cars]);

  return { cars, stats, needsYou, nextRun, acceptReprice, declineReprice, refreshOffer, keep, undoKeep, setReady, acceptOffer };
}

type Act = (vin: string) => void;
export interface BackOffice extends ReturnType<typeof summarize> {
  cars: BackOfficeCar[];
  acceptReprice: Act;
  declineReprice: Act;
  refreshOffer: Act;
  keep: Act;
  undoKeep: Act;
  setReady: (vin: string, checks: ReadyCheck[]) => void;
  acceptOffer: Act;
}
