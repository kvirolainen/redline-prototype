import { useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { SegmentedProgress } from '../../components/ui/Stepper';
import { money } from '../../domain/format';
import { carName, kmLabel } from './fixtures';
import { Confirmation, FirmOffer, FloorOffer, KmField, ModuleBar, QuestionBlock, TradeInListPicks, VinField } from './parts';
import { MOVERS, swing } from './pricing';
import { useTradeIn } from './useTradeIn';

type Screen = 'entry' | 'range' | 'firm' | 'offer';

// What the quick flow fills in for the questions it skips (the assumed answers in pricing.ts).
const ASSUMED = '2 or more keys, no modifications, all-season tires replaced in the last 12 months';

/** C · Quick quote first: a range in ten seconds to open the conversation, then only the questions that move the price. */
export function TradeInVariantC() {
  const t = useTradeIn(MOVERS);
  const [screen, setScreen] = useState<Screen>('entry');
  const [i, setI] = useState(0);
  const q = t.quote;

  const restart = () => {
    t.reset();
    setScreen('entry');
    setI(0);
  };

  if (t.outcome && q)
    return (
      <Frame>
        <div className="px-8">
          <Confirmation t={t} q={q} onRestart={restart} />
        </div>
      </Frame>
    );

  if (screen === 'entry' || !t.car || !q)
    return (
      <Frame>
        <div className="mx-auto max-w-[640px] px-8 py-14">
          <h2 className="text-h3 font-bold text-ink">Quick quote</h2>
          <p className="mt-2 text-base text-muted">VIN and odometer. A price range in seconds, to start the conversation with your customer.</p>
          <div className="mt-8 space-y-4">
            <VinField t={t} />
            <KmField t={t} />
            <TradeInListPicks t={t} />
          </div>
          <Button
            className="mt-8"
            disabled={t.km <= 0}
            onClick={() => {
              if (t.lookup()) setScreen('range');
            }}
          >
            Get quick quote
          </Button>
        </div>
      </Frame>
    );

  const car = t.car;

  if (screen === 'range') {
    const floorNow = q.review;
    return (
      <Frame>
        <div className="mx-auto max-w-[760px] px-8 py-12 text-center">
          <p className="text-sm text-muted">
            {carName(car)} · {kmLabel(t.km)}
          </p>
          {floorNow ? (
            <>
              <h2 className="mt-6 text-base text-ink">Guaranteed floor</h2>
              <p className="mt-2 text-display-l font-bold text-ink">{money(floorNow.floor)}</p>
              <p className="mx-auto mt-4 max-w-[520px] text-base text-muted">
                {floorNow.reason} The firm offer arrives by 3:00 pm today and won’t be lower than this.
              </p>
              <div className="mt-8 flex justify-center">
                <Button onClick={() => setScreen('offer')}>See the floor offer</Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-6 text-base text-ink">Quick quote</h2>
              <p className="mt-2 text-display-l font-bold text-ink">
                {money(q.low)} – {money(q.high)}
              </p>
              <p className="mt-3 text-base text-muted">
                Estimated auction net <span className="font-medium text-ink">{money(q.auctionNet)}</span>, paid in about 3 weeks
              </p>
              <p className="mx-auto mt-8 max-w-[520px] rounded-card bg-nudge px-4 py-3 text-sm text-body">
                Good enough to talk numbers with your customer. It isn’t firm yet: {MOVERS.length} questions move the price, the rest
                we assume.
              </p>
              <div className="mt-8 flex justify-center">
                <Button onClick={() => setScreen('firm')}>Firm it up · {MOVERS.length} questions</Button>
              </div>
            </>
          )}
          <button type="button" onClick={() => setScreen('entry')} className="mt-6 text-sm text-body hover:underline">
            ← Change VIN or km
          </button>
        </div>
      </Frame>
    );
  }

  if (screen === 'firm') {
    const cur = MOVERS[i];
    const answered = (t.answers[cur.id] ?? []).length > 0;
    const last = i === MOVERS.length - 1;
    return (
      <Frame>
        <div className="border-b border-line bg-white px-8 py-5">
          <div className="mx-auto flex max-w-[760px] items-center justify-between gap-8">
            <div className="min-w-0">
              <p className="text-sm text-muted">
                {carName(car)} · {kmLabel(t.km)}
              </p>
              <p className="mt-1 text-h4 font-bold text-ink">
                {q.review
                  ? `Floor ${money(q.review.floor)}`
                  : q.complete
                    ? money(q.firm)
                    : `${money(q.low)} – ${money(q.high)}`}
              </p>
            </div>
            <div className="w-[220px] shrink-0">
              <SegmentedProgress total={MOVERS.length} done={q.answered} />
              <p className="mt-2 text-caption text-muted">
                {q.answered} of {MOVERS.length} answered
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[760px] px-8 py-10">
          <p className="mb-4 text-caption font-bold text-brand">
            {String(i + 1).padStart(2, '0')} / {String(MOVERS.length).padStart(2, '0')} ·{' '}
            {swing(cur) > 0 ? `can move the price by up to ${money(swing(cur))}` : 'decides whether the offer can be instant'}
          </p>
          <QuestionBlock q={cur} t={t} />
          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            <button
              type="button"
              onClick={() => (i === 0 ? setScreen('range') : setI(i - 1))}
              className="text-sm text-body hover:underline"
            >
              ← Back
            </button>
            <Button disabled={!answered} onClick={() => (last ? setScreen('offer') : setI(i + 1))}>
              {last ? 'Get firm offer' : 'Next'}
            </Button>
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <div className="mx-auto max-w-[1000px] px-8 py-10">
        {q.review ? (
          <FloorOffer t={t} q={q} onAccept={() => t.setOutcome('floor-accepted')} />
        ) : (
          <>
            <FirmOffer t={t} q={q} onAccept={() => t.setOutcome('accepted')} />
            <p className="mt-6 text-sm text-muted">
              We assumed: {ASSUMED}. Sam checks these on pickup day like everything else.
            </p>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            setI(0);
            setScreen(q.answered ? 'firm' : 'range');
          }}
          className="mt-4 text-sm text-body hover:underline"
        >
          ← Change answers
        </button>
      </div>
    </Frame>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <ModuleBar title="Quick quote" />
      {children}
    </div>
  );
}
