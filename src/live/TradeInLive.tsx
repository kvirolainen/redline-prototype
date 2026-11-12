import type { ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '../../convex/_generated/api';
import { addDays, longDate, nextPickup, shortDate } from '../domain/calendar';
import { carName } from '../modules/trade-in/fixtures';
import { LIVE_DEMO_CARS, TradeInEnvContext, type TradeInEnv, type TradeInSubmission } from '../modules/trade-in/env';
import { FULL_QUESTIONS, type QuestionId } from '../modules/trade-in/pricing';
import { DEMO_DEALER, useLiveWorld } from './world';

/** Desk answers → what the inspector checks the car against on pickup day. Only answers that differ from a clean
 *  car are stored: a missing check falls back to the inspector's clean wording ("No rust"), so a clean car reads the
 *  same whether it came from the seed or from the desk. */
function declared(s: TradeInSubmission) {
  const has = (id: QuestionId, v: string) => (s.answers[id] ?? []).includes(v);
  const title = (id: QuestionId, v: string) => FULL_QUESTIONS.find((q) => q.id === id)?.options.find((o) => o.value === v)?.title ?? v;
  const out: Record<string, string> = {};
  const body = [
    ...(s.answers.exterior ?? []).filter((v) => v !== 'none' && v !== 'glass').map((v) => title('exterior', v)),
    ...(has('accidents', 'yes') ? [title('accidents', 'yes')] : []),
  ];
  if (body.length) out.body = body.join(' · ');
  if (has('exterior', 'glass')) out.glass = 'Chipped or cracked glass';
  if (has('rust', 'yes')) out.rust = 'Some rust';
  const interior = (s.answers.interior ?? []).filter((v) => v !== 'none').map((v) => title('interior', v));
  if (interior.length) out.interior = interior.join(' · ');
  if (has('mechanical', 'yes')) out.lights = 'A mechanical issue or warning light';
  const drive = [...(has('driveable', 'no') ? ['Not driveable'] : []), ...(has('mechanical', 'yes') ? ['has a mechanical issue'] : [])];
  if (drive.length) out.drive = drive.join(', ');
  const tires = [...(has('tireType', 'winter') ? ['Winter tires on'] : []), ...(has('tires', 'old') ? ['all-seasons replaced over a year ago'] : [])];
  if (tires.length) out.tires = tires.join(', ').replace(/^./, (c) => c.toUpperCase());
  return out;
}

export function TradeInLive({ children }: { children: ReactNode }) {
  const world = useLiveWorld();
  const submitTradeIn = useMutation(api.cars.submitTradeIn);
  const dealer = world.dealers.find((d) => d.key === DEMO_DEALER)!;
  const pickup = nextPickup(world.meta.today, dealer.runDay);

  const env: TradeInEnv = {
    dates: {
      today: shortDate(world.meta.today),
      pickup: shortDate(pickup),
      pickupLong: longDate(pickup),
      validUntil: shortDate(addDays(world.meta.today, 7)),
      firmBy: '3:00 pm today',
    },
    demoCars: LIVE_DEMO_CARS,
    submit: async (s) => {
      try {
        await submitTradeIn({
          dealer: DEMO_DEALER,
          who: 'Sales Manager',
          vin: s.car.vin,
          car: carName(s.car),
          trim: `${s.car.body} · ${s.car.transmission}`,
          colour: s.car.colour,
          km: s.km,
          keys: s.answers.keys?.[0] === '1' ? 1 : 2,
          offer: s.quote.firm,
          auction: s.quote.auctionNet,
          declared: declared(s),
          review: s.mode === 'review-sent' ? s.reviewReasons : undefined,
          demo: LIVE_DEMO_CARS.some((c) => c.vin === s.car.vin),
        });
        return null;
      } catch (e) {
        return e instanceof ConvexError ? String(e.data) : 'Couldn’t save the trade-in. Try again.';
      }
    },
  };

  return <TradeInEnvContext.Provider value={env}>{children}</TradeInEnvContext.Provider>;
}
