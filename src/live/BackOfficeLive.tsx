import { useMemo, type ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { addDays, formatAt, nextPickup, shortDate, toMin } from '../domain/calendar';
import type { BackOfficeCar } from '../modules/back-office/fixtures';
import { BackOfficeEnvContext, summarize, type BackOffice, type BackOfficeEnv } from '../modules/back-office/useBackOffice';
import { DEMO_DEALER, useDemoNow, useLiveWorld, type LiveCar, type LiveEvent } from './world';

const CLOSED = ['paid', 'declined', 'expired', 'cancelled', 'kept'];

const waited = (mins: number) => (mins < 60 ? `Waiting ${Math.max(mins, 1)} min` : `Waiting ${Math.floor(mins / 60)} h${mins % 60 >= 15 ? ` ${mins % 60} min` : ''}`);

/** A live car as the Back office screen reads it: dates as labels, its own events, the wait on a re-price. */
function toBackOfficeCar(c: LiveCar, events: LiveEvent[], today: string, nowMin: number): BackOfficeCar {
  const r = c.reprice;
  return {
    vin: c.vin,
    car: c.car,
    km: c.km,
    offer: c.offer,
    auction: c.auction,
    status: c.status,
    pickup: c.runDate ? shortDate(c.runDate) : 'Not booked',
    expires: c.status === 'offered' && c.expiresOn ? shortDate(c.expiresOn) : undefined,
    expiresSoon: c.status === 'offered' && !!c.expiresOn && c.expiresOn <= addDays(today, 1),
    inspected: c.inspected,
    repriced: c.repriced,
    daysToCash: c.daysToCash,
    note: c.note,
    ready: c.ready,
    fromReview: c.fromReview,
    reprice: r && {
      from: r.from,
      to: r.to,
      by: r.by,
      at: formatAt(r.at, today),
      waiting: r.at.startsWith(today) ? waited(nowMin - toMin(r.at.split('T')[1])) : 'Waiting since ' + shortDate(r.at),
      items: r.items,
      photos: r.photos,
      auctionAsFound: r.auctionAsFound,
    },
    events: events.filter((e) => e.car === c.key).map((e) => ({ at: formatAt(e.at, today), who: e.who, text: e.text, kind: e.kind })),
  };
}

export function BackOfficeLive({ children }: { children: ReactNode }) {
  const world = useLiveWorld();
  const nowMin = useDemoNow(world.meta);
  const today = world.meta.today;
  const dealer = world.dealers.find((d) => d.key === DEMO_DEALER)!;
  const next = shortDate(nextPickup(today, dealer.runDay));

  const m = {
    acceptReprice: useMutation(api.cars.acceptReprice),
    declineReprice: useMutation(api.cars.declineReprice),
    refreshOffer: useMutation(api.cars.refreshOffer),
    keep: useMutation(api.cars.keep),
    undoKeep: useMutation(api.cars.undoKeep),
    setReady: useMutation(api.cars.setReady),
    acceptOffer: useMutation(api.cars.acceptOffer),
  };

  const mine = world.cars.filter((c) => c.dealer === DEMO_DEALER);
  // The screen keys cars by VIN; a VIN can come back after a closed sale, so the open one wins.
  const keyOf = (vin: string) => (mine.find((c) => c.vin === vin && !CLOSED.includes(c.status)) ?? mine.find((c) => c.vin === vin))!.key;

  const cars = useMemo(
    () => mine.map((c) => toBackOfficeCar(c, world.events, today, nowMin)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world, nowMin],
  );

  // Who acts: the director decides on prices and what to keep; the sales manager handles offers and readiness.
  const live: BackOffice = {
    cars,
    ...summarize(cars, next),
    acceptReprice: (vin) => void m.acceptReprice({ key: keyOf(vin), who: 'Dave' }),
    declineReprice: (vin) => void m.declineReprice({ key: keyOf(vin), who: 'Dave' }),
    refreshOffer: (vin) => void m.refreshOffer({ key: keyOf(vin), who: 'Dave' }),
    keep: (vin) => void m.keep({ key: keyOf(vin), who: 'Dave' }),
    undoKeep: (vin) => void m.undoKeep({ key: keyOf(vin), who: 'Dave' }),
    setReady: (vin, ready) => void m.setReady({ key: keyOf(vin), ready, who: 'Maria' }),
    acceptOffer: (vin) => void m.acceptOffer({ key: keyOf(vin), who: 'Maria' }),
  };

  const env: BackOfficeEnv = { dealer: dealer.name, today: shortDate(today), nextPickup: next, live };
  return <BackOfficeEnvContext.Provider value={env}>{children}</BackOfficeEnvContext.Provider>;
}
