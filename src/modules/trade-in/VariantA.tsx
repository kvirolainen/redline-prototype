import { useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { Stepper } from '../../components/ui/Stepper';
import { DATES } from './fixtures';
import { ModuleBar, Confirmation, FirmOffer, FloorOffer, KmField, QuestionBlock, TradeInListPicks, VehicleCard, VinField } from './parts';
import { QUESTIONS, type Step } from './pricing';
import { useTradeIn } from './useTradeIn';

const STEPS = ['Basic info', 'Features', 'Condition', 'Offer'];
const STEP_KEYS: Step[] = ['vehicle', 'features', 'condition'];
const TITLES = ['Basic info', 'Vehicle features', 'Condition and history'];

/** A · Step by step: Clutch's own sell flow, re-pointed at the dealer desk. */
export function TradeInVariantA() {
  const t = useTradeIn();
  const [step, setStep] = useState(0);

  if (t.outcome && t.quote)
    return (
      <Frame>
        <Stepper steps={STEPS} current={3} />
        <Confirmation
          t={t}
          q={t.quote}
          onRestart={() => {
            t.reset();
            setStep(0);
          }}
        />
      </Frame>
    );

  const qs = step < 3 ? QUESTIONS.filter((q) => q.step === STEP_KEYS[step]) : [];
  const stepDone = qs.every((q) => (t.answers[q.id] ?? []).length > 0) && (step > 0 || (!!t.car && t.km > 0));

  return (
    <Frame>
      <Stepper steps={STEPS} current={step} />
      {step === 3 && t.quote ? (
        <div className="mx-auto max-w-[1000px] px-8 py-10">
          {t.quote.review ? (
            <FloorOffer t={t} q={t.quote} onAccept={() => t.setOutcome('floor-accepted')} />
          ) : (
            <FirmOffer t={t} q={t.quote} onAccept={() => t.setOutcome('accepted')} />
          )}
          <button type="button" onClick={() => setStep(2)} className="mt-6 text-sm text-body hover:underline">
            ← Change answers
          </button>
        </div>
      ) : (
        <div className="mx-auto grid max-w-[1000px] gap-8 px-8 py-10 lg:grid-cols-[1fr_300px] lg:gap-10">
          <div className="space-y-8">
            <h2 className="text-h4 font-bold text-ink">{TITLES[step]}</h2>
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <VinField t={t} className="flex-1" />
                  <Button variant="outline" className="h-14" onClick={() => t.lookup()}>
                    Look up
                  </Button>
                </div>
                <TradeInListPicks t={t} />
                {t.car && <KmField t={t} />}
              </div>
            )}
            {(step > 0 || t.car) && qs.map((q) => <QuestionBlock key={q.id} q={q} t={t} />)}
            <div className="flex items-center justify-between border-t border-line pt-6">
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="text-sm text-body hover:underline">
                  ← Back
                </button>
              ) : (
                <span />
              )}
              <Button disabled={!stepDone} onClick={() => setStep(step + 1)}>
                {step === 2 ? 'Get offer' : 'Continue'}
              </Button>
            </div>
          </div>
          <aside className="order-first space-y-4 self-start lg:sticky lg:top-6 lg:order-none">
            <VehicleCard car={t.car} km={t.km} />
            <div className="rounded-card border border-line bg-white p-6 text-sm">
              <p className="font-medium text-ink">Accepted cars go out on {DATES.pickup}</p>
              <p className="mt-1 text-muted">Your regular Thursday pickup. Clutch checks each car against these answers on the day.</p>
            </div>
          </aside>
        </div>
      )}
    </Frame>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <ModuleBar />
      {children}
    </div>
  );
}
