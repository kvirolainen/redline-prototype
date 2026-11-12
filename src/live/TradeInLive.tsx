import type { ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { api } from '../../convex/_generated/api';
import { addDays, longDate, nextPickup, shortDate } from '../domain/calendar';
import { carName } from '../modules/trade-in/fixtures';
import { LIVE_DEMO_CARS, TradeInEnvContext, type TradeInEnv, type TradeInSubmission } from '../modules/trade-in/env';
import { FULL_QUESTIONS, type QuestionId } from '../modules/trade-in/pricing';
import { DEMO_DEALER, useLiveWorld } from './world';

/** Desk answers → what the inspector checks the car against on pickup day. */
const DECLARED_FROM: Record<string, QuestionId[]> = {
  body: ['exterior', 'accidents'],
  rust: ['rust'],
  interior: ['interior'],
  lights: ['mechanical'],
  drive: ['driveable', 'mechanical'],
  tires: ['tireType', 'tires'],
};

function declared(s: TradeInSubmission) {
  const out: Record<string, string> = {};
  for (const [check, ids] of Object.entries(DECLARED_FROM)) {
    const words = ids.flatMap((id) => {
      const q = FULL_QUESTIONS.find((x) => x.id === id);
      return (s.answers[id] ?? []).map((v) => q?.options.find((o) => o.value === v)?.title).filter(Boolean) as string[];
    });
    if (words.length) out[check] = words.join(' · ');
  }
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
