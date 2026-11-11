import type { ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { OfferCard } from '../../components/ui/OfferCard';
import { OptionCard } from '../../components/ui/OptionCard';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { AUCTION_COSTS, carName, DATES, DEALER, kmLabel, reference, TRADE_IN_LIST, USER, type DecodedCar } from './fixtures';
import { kmNudge, nudgeFor, type Question, type Quote } from './pricing';
import type { TradeIn } from './useTradeIn';


/** Slim bar on top of the screen: what this is, for whom, and the next pickup day. */
export function ModuleBar({ title = 'New trade-in', right }: { title?: string; right?: ReactNode }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-8">
      <div className="flex items-baseline gap-3">
        <h1 className="text-title font-bold text-ink">{title}</h1>
        <span className="text-sm text-muted">
          {DEALER.name} · {USER.name}, {USER.role}
        </span>
      </div>
      {right ?? (
        <span className="text-sm text-muted">
          Next pickup <span className="font-medium text-ink">{DATES.pickup}</span>
        </span>
      )}
    </header>
  );
}

/** "Your vehicle" summary card, as in Clutch's sell flow. */
export function VehicleCard({ car, km, children }: { car: DecodedCar | null; km: number; children?: ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-white p-6">
      <p className="text-title font-bold text-ink">Your vehicle</p>
      {car ? (
        <>
          <p className="mt-2 text-sm text-muted">
            {carName(car)} · {car.transmission}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="VIN" v={car.vin} />
            {km > 0 && <Row k="Mileage" v={kmLabel(km)} />}
            <Row k="Colour" v={car.colour} />
          </dl>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">Look up a VIN to see the car here.</p>
      )}
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium text-ink">{v}</dd>
    </div>
  );
}

/** Today's trade-ins from the dealer's list, one tap fills VIN and km. */
export function TradeInListPicks({ t, onPicked }: { t: TradeIn; onPicked?: (c: DecodedCar) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">Today’s trade-ins:</span>
      {TRADE_IN_LIST.map(({ car }) => (
        <button
          key={car.vin}
          type="button"
          onClick={() => {
            t.pick(car);
            onPicked?.(car);
          }}
          className={`h-8 rounded-pill border px-3 text-caption font-medium transition-colors ${
            t.vin === car.vin ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
          }`}
        >
          {car.year} {car.make} {car.model} · {kmLabel(car.listKm)}
        </button>
      ))}
    </div>
  );
}

export function KmField({ t, className = '', inlineNudge = true }: { t: TradeIn; className?: string; inlineNudge?: boolean }) {
  return (
    <Field
      label="Odometer"
      suffix="km"
      inputMode="numeric"
      value={t.kmText}
      onChange={(e) => t.setKmText(e.target.value)}
      onBlur={() => t.km && t.setKmText(t.km.toLocaleString('en-CA'))}
      nudge={inlineNudge && t.car ? kmNudge(t.car, t.km) ?? undefined : undefined}
      className={className}
    />
  );
}

export function VinField({ t, className = '' }: { t: TradeIn; className?: string }) {
  return (
    <Field
      label="VIN"
      value={t.vin}
      maxLength={17}
      onChange={(e) => t.setVin(e.target.value.toUpperCase())}
      error={t.vinError ?? undefined}
      className={className}
    />
  );
}

/** One question with full-width option cards and an honesty nudge under the answer. */
export function QuestionBlock({ q, t, compact }: { q: Question; t: TradeIn; compact?: boolean }) {
  const picked = t.answers[q.id] ?? [];
  const nudge = t.car ? nudgeFor(t.car, q.id, picked) : null;
  return (
    <fieldset>
      <legend className="mb-3 text-base text-body">
        {q.label}
        {q.multi && <span className="text-muted"> Select all that apply.</span>}
      </legend>
      <div className={compact ? 'grid gap-2 lg:grid-cols-2' : 'space-y-2'}>
        {q.options.map((o) => (
          <OptionCard
            key={o.value}
            title={o.title}
            helper={compact ? undefined : o.helper}
            multi={q.multi}
            selected={picked.includes(o.value)}
            onClick={() => t.answer(q.id, o.value)}
          />
        ))}
      </div>
      {nudge && <p className="mt-2 rounded-card bg-nudge px-4 py-3 text-sm text-body">{nudge}</p>}
    </fieldset>
  );
}

/** The "why sell to Clutch" line, opened up: what the same car nets at auction. */
export function AuctionCompare({ amount, auctionNet, label = 'Clutch offer' }: { amount: number; auctionNet: number; label?: string }) {
  const hammer = auctionNet + AUCTION_COSTS.fees + AUCTION_COSTS.transport;
  return (
    <div className="rounded-card border border-line bg-white p-6">
      <p className="text-base font-medium text-ink">Versus sending it to auction</p>
      <dl className="mt-4 space-y-2 text-sm">
        <Line k="Expected auction price" v={money(hammer)} />
        <Line k="Auction fees" v={`−${money(AUCTION_COSTS.fees)}`} />
        <Line k="Transport to the auction" v={`−${money(AUCTION_COSTS.transport)}`} />
        <div className="flex justify-between border-t border-line-light pt-2">
          <dt className="font-medium text-ink">Estimated auction net</dt>
          <dd className="font-medium text-ink">{money(auctionNet)}</dd>
        </div>
        <Line k="Cash in" v={`about ${AUCTION_COSTS.weeksToCash} weeks`} />
        <div className="flex justify-between border-t border-line-light pt-2">
          <dt className="font-bold text-ink">{label}</dt>
          <dd className="font-bold text-ink">{money(amount)}</dd>
        </div>
        <Line k="Cash in" v="2 business days after pickup" />
      </dl>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd className="text-body">{v}</dd>
    </div>
  );
}

export const ACCEPT_LABEL = 'Accept — add to next Thursday’s pickup';

/** Firm offer: the Clutch card, the auction comparison, and the one main action. */
export function FirmOffer({ t, q, onAccept, side = true }: { t: TradeIn; q: Quote; onAccept: () => void; side?: boolean }) {
  const car = t.car!;
  return (
    <div className={side ? 'grid items-start gap-6 lg:grid-cols-[1fr_320px]' : 'space-y-6'}>
      <div>
        <h2 className="mb-6 text-h4 font-bold text-ink">Here’s your firm offer</h2>
        <OfferCard
          amount={q.firm}
          car={carName(car)}
          vin={car.vin}
          km={t.km}
          reference={reference(car)}
          auctionEstimate={q.auctionNet}
          validUntil={DATES.validUntil}
        />
        <div className="mt-6 flex items-center gap-4">
          <Button className="whitespace-nowrap" onClick={onAccept}>{ACCEPT_LABEL}</Button>
          <span className="text-sm text-muted">Pickup {DATES.pickup}, with your regular run</span>
        </div>
      </div>
      <AuctionCompare amount={q.firm} auctionNet={q.auctionNet} />
    </div>
  );
}

/** No instant answer: a guaranteed floor now, the firm offer later today. */
export function FloorOffer({ t, q, onAccept, side = true }: { t: TradeIn; q: Quote; onAccept: () => void; side?: boolean }) {
  const car = t.car!;
  const floor = q.review!.floor;
  return (
    <div className={side ? 'grid items-start gap-6 lg:grid-cols-[1fr_320px]' : 'space-y-6'}>
      <div>
        <h2 className="text-h4 font-bold text-ink">This one needs a closer look</h2>
        <p className="mt-2 text-base text-muted">{q.review!.reason}</p>
        <div className="mt-6 overflow-hidden rounded-card border border-line bg-white">
          <div className="px-6 py-8 text-center">
            <p className="text-base text-ink">Guaranteed floor</p>
            <p className="mt-3 text-price font-bold text-ink">{money(floor)}</p>
            <p className="mt-3 text-sm text-muted">
              The firm offer arrives by {DATES.firmBy} and won’t be lower than this.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-line px-6 py-5 text-sm">
            <div>
              <dt className="font-medium text-ink">Make/Model</dt>
              <dd className="mt-1 text-muted">{carName(car)}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Mileage</dt>
              <dd className="mt-1 text-muted">{kmLabel(t.km)}</dd>
            </div>
          </dl>
        </div>
        <p className="mt-4 rounded-card bg-nudge px-4 py-3 text-sm text-body">
          You can close the customer’s deal on the floor now. The firm offer lands in your back office today.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <Button className="whitespace-nowrap" onClick={onAccept}>Accept floor — hold for next Thursday</Button>
        </div>
      </div>
      <AuctionCompare amount={floor} auctionNet={q.auctionNet} label="Clutch floor" />
    </div>
  );
}

/** After accepting: where the car is now and what happens next. */
export function Confirmation({ t, q, onRestart }: { t: TradeIn; q: Quote; onRestart: () => void }) {
  const car = t.car!;
  const floor = t.outcome === 'floor-accepted';
  const amount = floor ? q.review!.floor : q.firm;
  return (
    <div className="mx-auto max-w-[640px] py-10">
      <div className="grid size-12 place-items-center rounded-full bg-success">
        <svg viewBox="0 0 12 12" className="size-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" />
        </svg>
      </div>
      <h2 className="mt-6 text-h3 font-bold text-ink">
        {floor ? 'Floor locked in. Held for next Thursday’s pickup' : 'Added to next Thursday’s pickup'}
      </h2>
      <p className="mt-2 text-base text-muted">
        {carName(car)} joins {DEALER.name}’s pickup on {DATES.pickupLong}.
      </p>
      <div className="mt-8 rounded-card border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <span className="text-base font-medium text-ink">{floor ? 'Guaranteed floor' : 'Firm offer'}</span>
          <span className="flex items-center gap-3">
            <StatusChip status={floor ? 'offered' : 'awaiting_pickup'} />
            <span className="text-title font-bold text-ink">{money(amount)}</span>
          </span>
        </div>
        <ol className="space-y-4 px-6 py-5 text-sm text-body">
          {floor && <Next n={1} text={`The firm offer arrives in your back office by ${DATES.firmBy}. It can only be ${money(amount)} or more.`} />}
          <Next n={floor ? 2 : 1} text={`On ${DATES.pickup}, Sam from Clutch checks the car against what you declared. It takes about 15 minutes.`} />
          <Next n={floor ? 3 : 2} text="If it matches, it’s picked up and you’re paid within 2 business days." />
          <Next n={floor ? 4 : 3} text="If something differs, your director gets a new price with the reason and decides. Declined, the car stays with you." />
        </ol>
      </div>
      <p className="mt-4 text-sm text-muted">
        Reference {reference(car)} · {floor ? 'Floor' : 'Offer'} holds until {DATES.validUntil}
      </p>
      <div className="mt-8">
        <Button variant="outline" onClick={onRestart}>
          Start another trade-in
        </Button>
      </div>
    </div>
  );
}

function Next({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line text-caption font-bold text-ink">{n}</span>
      <span>{text}</span>
    </li>
  );
}
