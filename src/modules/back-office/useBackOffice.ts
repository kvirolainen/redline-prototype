import { useMemo, useState } from 'react';
import { money } from '../../domain/format';
import type { CarStatus } from '../../domain/statuses';
import { AUCTION_DAYS_TO_CASH, BACK_OFFICE_CARS, DEALER, NEXT_PICKUP, OFFERS_NOT_TAKEN, type BackOfficeCar } from './fixtures';

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

/** Local stand-in for the shared backend: the cars plus the three things the dealer can do. */
export function useBackOffice(initial: BackOfficeCar[] = BACK_OFFICE_CARS) {
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
        { at: 'Today, just now', who: 'Dave', text: `Offer refreshed: ${money(c.offer)} holds until ${NEXT_PICKUP}`, kind: 'offer' },
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

  const setReady = (vin: string, ready: boolean) =>
    update(vin, (c) => ({
      ...c,
      ready,
      status: ready && c.status === 'not_ready' ? 'awaiting_pickup' : c.status,
      note: ready ? undefined : c.note,
      events: [
        ...c.events,
        { at: 'Today, just now', who: 'Maria', text: ready ? 'Marked ready: on the lot, both keys, ownership papers' : 'Marked not ready yet', kind: 'pickup' },
      ],
    }));

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

  const stats = useMemo(() => computeStats(cars), [cars]);
  /** Cars on the next pickup the dealer can still pull back for its own lot. */
  const nextRun = cars.filter((c) => c.pickup === NEXT_PICKUP && (c.status === 'awaiting_pickup' || c.status === 'not_ready' || c.status === 'kept'));
  const needsYou = cars.filter((c) => c.status === 'reprice_pending' || (c.status === 'offered' && c.expiresSoon));

  return { cars, stats, needsYou, nextRun, acceptReprice, declineReprice, refreshOffer, keep, undoKeep, setReady, acceptOffer };
}

export type BackOffice = ReturnType<typeof useBackOffice>;
