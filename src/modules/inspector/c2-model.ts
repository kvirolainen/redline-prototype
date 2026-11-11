import type { InspectionCar, Stop } from './fixtures';
import type { Outcome } from './useRun';

// Small rules C2 shares between the run screen and the car screen.

/** "2019 Honda Civic EX" → "Civic", "2017 Mazda CX-5 GS" → "CX-5": what Sam and Dave call the car out loud. */
export const shortCar = (car: InspectionCar) => car.car.split(' ')[2] ?? car.car;

/** "Yorkdale Honda" → "Yorkdale". */
export const shortDealer = (stop: Stop) => stop.dealer.split(' ')[0];

/** The end of the pickup window, when the truck leaves: "10:15 – 11:45" → "11:45". */
export const leaveLabel = (stop: Stop) => stop.window.split('–')[1]?.trim() ?? stop.window;

/** Leave time as minutes after midnight. Pickup windows run in the day, so "1:00" is 1 pm. */
export const leaveMin = (stop: Stop) => {
  const [h, m] = leaveLabel(stop).split(':').map(Number);
  return (h < 7 ? h + 12 : h) * 60 + (m || 0);
};

export const minutesLabel = (n: number) => (n < 1 ? 'just now' : `${n} min`);

/** A car Sam has nothing more to do with today. */
export const isSettled = (o: Outcome | undefined) =>
  !!o && ((o.kind === 'confirmed' && o.loaded) || (o.kind === 'reprice' && !!o.declined) || o.kind === 'not_ready');

export const isWaiting = (o: Outcome | undefined) => o?.kind === 'reprice' && !o.declined;

export const isAccepted = (o: Outcome | undefined) => o?.kind === 'confirmed' && !o.loaded && !!o.accepted;
