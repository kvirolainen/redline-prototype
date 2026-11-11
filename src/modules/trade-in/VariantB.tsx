import type { ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { SegmentedProgress } from '../../components/ui/Stepper';
import { money } from '../../domain/format';
import { carName, DATES, kmLabel } from './fixtures';
import { ACCEPT_LABEL, AuctionCompare, Confirmation, KmField, ModuleBar, QuestionBlock, TradeInListPicks, VinField } from './parts';
import { kmNudge, QUESTIONS, type Quote } from './pricing';
import { useTradeIn, type TradeIn } from './useTradeIn';

const GROUPS: { title: string; step: string }[] = [
  { title: 'Title and keys', step: 'vehicle' },
  { title: 'Modifications', step: 'features' },
  { title: 'Condition', step: 'condition' },
];

/** B · One page, live offer: every question on one scroll, the offer tightening beside it. */
export function TradeInVariantB() {
  const t = useTradeIn();
  const kmWarning = t.car ? kmNudge(t.car, t.km) : null;

  if (t.outcome && t.quote)
    return (
      <div className="min-h-screen bg-canvas">
        <ModuleBar />
        <div className="px-8">
          <Confirmation t={t} q={t.quote} onRestart={t.reset} />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-canvas">
      <ModuleBar />
      <section className="border-b border-line bg-white px-8 py-6">
        <div className="mx-auto max-w-[1000px] space-y-4">
          <div className="grid grid-cols-[1fr_220px_auto] items-end gap-3">
            <VinField t={t} />
            <KmField t={t} inlineNudge={false} />
            <Button className="h-14" onClick={() => t.lookup()}>
              Look up
            </Button>
          </div>
          {kmWarning && <p className="rounded-card bg-nudge px-4 py-3 text-sm text-body">{kmWarning}</p>}
          <TradeInListPicks t={t} />
        </div>
      </section>
      <div className="mx-auto grid max-w-[1000px] grid-cols-[1fr_300px] gap-8 px-8 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {t.car ? (
            GROUPS.map((g) => (
              <section key={g.step} className="space-y-6">
                <h2 className="border-b border-line pb-2 text-title font-bold text-ink">{g.title}</h2>
                {QUESTIONS.filter((q) => q.step === g.step).map((q) => (
                  <QuestionBlock key={q.id} q={q} t={t} compact />
                ))}
              </section>
            ))
          ) : (
            <div className="rounded-card border border-dashed border-line px-6 py-16 text-center text-base text-muted">
              Look up the VIN, or pick a car from today’s trade-ins. The questions show up here.
            </div>
          )}
        </div>
        <aside className="sticky top-6 self-start">
          <OfferPanel t={t} />
        </aside>
      </div>
    </div>
  );
}

function OfferPanel({ t }: { t: TradeIn }) {
  const q = t.quote;
  if (!t.car || !q)
    return (
      <Panel>
        <p className="text-base font-medium text-ink">Offer</p>
        <p className="mt-2 text-sm text-muted">Shows up as soon as the car is looked up, and firms up as you answer.</p>
      </Panel>
    );

  const head = (
    <div className="border-b border-line-light pb-4">
      <p className="text-sm font-medium text-ink">{carName(t.car)}</p>
      <p className="text-caption text-muted">
        {kmLabel(t.km)} · {t.car.vin}
      </p>
    </div>
  );

  if (q.review) return <FloorPanel t={t} q={q} head={head} />;

  return (
    <div className="space-y-4">
      <Panel>
        {head}
        <div className="py-5 text-center">
          {q.complete ? (
            <>
              <p className="text-sm text-ink">Firm offer</p>
              <p className="mt-2 text-price font-bold text-ink">{money(q.firm)}</p>
              <p className="mt-2 inline-block rounded-pill border border-line px-3 py-1 text-caption font-bold text-ink">
                Beats auction by {money(q.firm - q.auctionNet)}
              </p>
              <p className="mt-2 text-caption text-muted">Firm until {DATES.validUntil}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-ink">Estimated range</p>
              <p className="mt-2 text-h4 font-bold text-ink">
                {money(q.low)} – {money(q.high)}
              </p>
              <p className="mt-2 text-caption text-muted">Auction net est. {money(q.auctionNet)}</p>
            </>
          )}
        </div>
        <SegmentedProgress total={q.total} done={q.answered} />
        <p className="mt-2 text-caption text-muted">
          {q.complete ? 'All questions answered' : `${q.answered} of ${q.total} answered · ${q.total - q.answered} more to firm it up`}
        </p>
        <Button className="mt-5 h-auto min-h-12 w-full px-4 py-3 leading-tight" disabled={!q.complete} onClick={() => t.setOutcome('accepted')}>
          {q.complete ? ACCEPT_LABEL : 'Answer all to get a firm offer'}
        </Button>
      </Panel>
      {q.complete && <AuctionCompare amount={q.firm} auctionNet={q.auctionNet} />}
    </div>
  );
}

function FloorPanel({ t, q, head }: { t: TradeIn; q: Quote; head: ReactNode }) {
  const floor = q.review!.floor;
  return (
    <Panel>
      {head}
      <div className="py-5 text-center">
        <p className="text-sm text-ink">Guaranteed floor</p>
        <p className="mt-2 text-price font-bold text-ink">{money(floor)}</p>
        <p className="mt-2 text-caption text-muted">Firm offer by {DATES.firmBy}, never lower than this</p>
      </div>
      <p className="rounded-card bg-nudge px-4 py-3 text-sm text-body">{q.review!.reason}</p>
      <Button className="mt-5 w-full" onClick={() => t.setOutcome('floor-accepted')}>
        Accept the floor
      </Button>
      <p className="mt-3 text-center text-caption text-muted">
        Held for next Thursday’s pickup. Answer the rest so the firm offer comes back faster.
      </p>
    </Panel>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-panel border border-line bg-white p-6">{children}</div>;
}
