import type { ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { SegmentedProgress } from '../../components/ui/Stepper';
import { money } from '../../domain/format';
import { carName, DATES, DEALER, KNOWN_CARS, kmLabel, reference } from './fixtures';
import { INSTANT_KM_LIMIT, QUESTIONS, type Question, type Quote } from './pricing';
import { useTradeIn, type TradeIn } from './useTradeIn';

// B2 · One screen. B, refined for a manager who does this many times a week, on a laptop that both
// she and the customer look at: every question is always in the same place, nothing scrolls at
// 1280 × 800, and every word on screen is fine for the customer to read.

/** Short answer labels so each question fits on one row. Anything missing falls back to the full title. */
const SHORT: Record<string, string> = {
  'title:clean': 'Clean',
  'title:rebuilt': 'Salvage or rebuilt',
  'title:flood': 'Fire or flood',
  'title:stolen': 'Was stolen',
  'keys:2': '2 or more',
  'keys:1': '1 key',
  'features:none': 'None',
  'features:rims': 'Aftermarket rims',
  'features:cosmetic': 'Wrap or cosmetic',
  'features:performance': 'Performance',
  'exterior:none': 'None',
  'exterior:minor': 'Small scratches',
  'exterior:moderate': 'Dents',
  'exterior:bodywork': 'Repainted',
  'exterior:glass': 'Chipped glass',
  'accidents:none': 'None',
  'accidents:yes': '1 or more',
  'mechanical:no': 'None',
  'mechanical:yes': 'Issue or warning light',
  'interior:none': 'None',
  'interior:stains': 'Stains or odours',
  'interior:rips': 'Rips or tears',
  'interior:dash': 'Damaged dash',
  'tires:new': 'Within a year',
  'tires:old': 'Over a year ago',
};

/** Short row labels, same order as Clutch's sell flow. */
const LABEL: Record<string, string> = {
  title: 'Title history',
  keys: 'Keys',
  features: 'Modifications',
  exterior: 'Exterior damage',
  accidents: 'Accidents or claims',
  mechanical: 'Mechanical issues',
  interior: 'Interior damage',
  tires: 'Tires replaced',
};

/** Plain notes under an answer, worded for both people at the desk. */
function noteFor(t: TradeIn, q: Question): string | null {
  const picked = t.answers[q.id] ?? [];
  if (!t.car) return null;
  if (q.id === 'exterior' && picked.includes('none'))
    return `Only about 1 in 10 cars from ${t.car.year} has none. It’s checked at pickup.`;
  if (q.id === 'accidents' && picked.includes('none'))
    return 'Paint and panels are checked at pickup. A repair mentioned now keeps this price.';
  return null;
}

function kmNote(t: TradeIn): string | null {
  if (!t.car || !t.km) return null;
  if (t.km > INSTANT_KM_LIMIT) return `Over ${INSTANT_KM_LIMIT.toLocaleString('en-CA')} km, Clutch prices the car by hand. The offer comes by ${DATES.firmBy}.`;
  const age = 2026 - t.car.year;
  if (t.km > age * 40000 || t.km < age * 3000) return 'That looks unusual for the car’s age. Worth checking the odometer.';
  return null;
}

export function TradeInVariantB2() {
  const t = useTradeIn(QUESTIONS, 'blank');

  if (t.outcome && t.quote)
    return (
      <div className="min-h-screen bg-canvas">
        <Header />
        <Done t={t} q={t.quote} />
      </div>
    );

  return (
    <div className="min-h-screen bg-canvas">
      <Header />
      <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_340px] gap-6 px-8 py-5 xl:grid-cols-[1fr_380px]">
        <div className="rounded-panel border border-line bg-white">
          <CarRow t={t} />
          <div className={t.car ? '' : 'pointer-events-none opacity-40'} aria-disabled={!t.car}>
            {QUESTIONS.map((q) => (
              <AnswerRow key={q.id} q={q} t={t} />
            ))}
          </div>
        </div>
        <aside className="self-start">
          <OfferPanel t={t} />
        </aside>
      </div>
    </div>
  );
}

/** Slim title bar; the app shell above it already says who is viewing. */
function Header() {
  return (
    <header className="flex h-12 items-center justify-between border-b border-line bg-white px-8">
      <h1 className="text-base font-bold text-ink">New trade-in</h1>
      <span className="text-sm text-muted">
        {DEALER.name} · next pickup <span className="font-medium text-ink">{DATES.pickup}</span>
      </span>
    </header>
  );
}

/** VIN and odometer. A full VIN looks the car up by itself. */
function CarRow({ t }: { t: TradeIn }) {
  const note = kmNote(t);
  return (
    <div className="border-b border-line px-6 py-4">
      <div className="grid grid-cols-[1fr_200px] gap-3">
        <Input
          label="VIN"
          value={t.vin}
          maxLength={17}
          placeholder="17 characters, on the dash or door frame"
          onChange={(v) => {
            const vin = v.toUpperCase();
            t.setVin(vin);
            if (vin.length === 17) t.lookup(vin);
          }}
          error={t.vinError}
        />
        <Input
          label="Odometer"
          suffix="km"
          value={t.kmText}
          inputMode="numeric"
          onChange={t.setKmText}
          onBlur={() => t.km && t.setKmText(t.km.toLocaleString('en-CA'))}
        />
      </div>
      {note && <p className="mt-2 text-sm text-body">{note}</p>}
      {!t.car && (
        <p className="mt-3 text-caption text-muted">
          Demo cars:{' '}
          {KNOWN_CARS.map((c, i) => (
            <span key={c.vin}>
              {i > 0 && ' · '}
              <button type="button" className="underline hover:text-ink" onClick={() => t.pick(c)}>
                {c.year} {c.make} {c.model}, {kmLabel(c.listKm)}
              </button>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function Input({
  label, value, onChange, onBlur, suffix, error, ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  suffix?: string;
  error?: string | null;
  maxLength?: number;
  placeholder?: string;
  inputMode?: 'numeric';
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-caption font-medium text-muted">{label}</span>
      <span
        className={`flex h-11 items-center rounded-card border bg-white px-3 ${
          error ? 'border-error' : 'border-line hover:border-body focus-within:border-ink'
        }`}
      >
        <input
          className="h-full w-full bg-transparent font-mono text-base text-ink outline-none placeholder:font-sans placeholder:text-sm placeholder:text-subtle"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          {...rest}
        />
        {suffix && <span className="ml-2 text-sm text-subtle">{suffix}</span>}
      </span>
      {error && <span className="mt-1 block text-caption font-medium text-error">{error}</span>}
    </label>
  );
}

/** One question on one row: label left, answers as pills right. Black = picked, as in Clutch's flow. */
function AnswerRow({ q, t }: { q: Question; t: TradeIn }) {
  const picked = t.answers[q.id] ?? [];
  const note = noteFor(t, q);
  return (
    <fieldset className="grid grid-cols-[150px_1fr] items-start gap-4 border-b border-line-light px-6 py-2.5 last:border-b-0">
      <legend className="sr-only">{q.label}</legend>
      <span className="pt-1.5 text-sm font-medium text-ink" aria-hidden>
        {LABEL[q.id]}
        {q.multi && <span className="block text-caption font-normal text-subtle">Pick all that apply</span>}
      </span>
      <div>
        <div className="flex flex-wrap gap-2">
          {q.options.map((o) => {
            const on = picked.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={on}
                title={o.helper ?? o.title}
                onClick={() => t.answer(q.id, o.value)}
                className={`h-9 rounded-pill border px-3.5 text-sm transition-colors ${
                  on ? 'border-ink bg-ink font-medium text-white' : 'border-line bg-white text-ink hover:border-ink'
                }`}
              >
                {SHORT[`${q.id}:${o.value}`] ?? o.title}
              </button>
            );
          })}
        </div>
        {note && <p className="mt-1.5 text-caption text-muted">{note}</p>}
      </div>
    </fieldset>
  );
}

/** The part both people read: the car, the number, and the one action. */
function OfferPanel({ t }: { t: TradeIn }) {
  const q = t.quote;
  return (
    <div className="rounded-panel border border-line bg-white p-6">
      {t.car ? (
        <div className="border-b border-line-light pb-4">
          <p className="text-base font-bold text-ink">{carName(t.car)}</p>
          <p className="mt-1 text-caption text-muted">
            {t.car.colour} · {t.car.transmission}
            {t.km > 0 && ` · ${kmLabel(t.km)}`}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">Enter the VIN and odometer. The offer builds here as you answer.</p>
      )}
      {t.car && !q && <p className="pt-4 text-sm text-muted">Add the odometer reading to see an offer.</p>}
      {q && (q.review ? <ByHand t={t} q={q} /> : <Instant t={t} q={q} />)}
    </div>
  );
}

function Instant({ t, q }: { t: TradeIn; q: Quote }) {
  const left = q.total - q.answered;
  return (
    <>
      <BigNumber
        label={q.complete ? 'Firm offer' : 'Estimate'}
        value={q.complete ? money(q.firm) : `${money(q.low)} – ${money(q.high)}`}
        small={!q.complete}
        sub={q.complete ? `Holds until ${DATES.validUntil}` : `${left} ${left === 1 ? 'question' : 'questions'} left to a firm offer`}
      />
      <SegmentedProgress total={q.total} done={q.answered} />
      <Button className="mt-5 w-full" disabled={!q.complete} onClick={() => t.setOutcome('accepted')}>
        Accept offer
      </Button>
      <p className="mt-3 text-center text-caption text-muted">Clutch picks the car up {DATES.pickup}</p>
    </>
  );
}

function ByHand({ t, q }: { t: TradeIn; q: Quote }) {
  return (
    <>
      <BigNumber label={`Offer by ${DATES.firmBy}`} value={`${money(q.review!.floor)} – ${money(q.firm)}`} small sub="Estimate. A Clutch appraiser sets the final number." />
      <SegmentedProgress total={q.total} done={q.answered} />
      <Button className="mt-5 w-full" disabled={!q.complete} onClick={() => t.setOutcome('review-sent')}>
        {q.complete ? 'Send to Clutch' : 'Answer all to send'}
      </Button>
      <p className="mt-3 text-center text-caption text-muted">Picked up {DATES.pickup} once accepted</p>
    </>
  );
}

function BigNumber({ label, value, sub, small }: { label: string; value: string; sub: string; small?: boolean }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 font-bold whitespace-nowrap text-ink tabular-nums ${small ? 'text-[30px] leading-[48px]' : 'text-[40px] leading-[48px]'}`}>{value}</p>
      <p className="mt-1 text-caption text-muted">{sub}</p>
    </div>
  );
}

/** After the action: what happens next, in words the customer can read too. */
function Done({ t, q }: { t: TradeIn; q: Quote }) {
  const car = t.car!;
  const review = t.outcome === 'review-sent';
  const steps: ReactNode[] = review
    ? [
        `A Clutch appraiser sets the offer by ${DATES.firmBy}. It shows up in Back office to accept.`,
        `Once accepted, Clutch picks the car up ${DATES.pickup} with ${DEALER.name}’s regular run.`,
      ]
    : [
        `${DATES.pickup}: a Clutch inspector checks the car against these answers. About 15 minutes.`,
        `If it matches, Clutch takes the car and ${DEALER.name} is paid within 2 business days.`,
        'If something differs, Clutch sends a new price with the reason, and the dealership decides.',
      ];
  return (
    <div className="mx-auto max-w-[600px] py-12">
      <h2 className="text-h3 font-bold text-ink">{review ? 'Sent to Clutch' : 'Offer accepted'}</h2>
      <p className="mt-2 text-base text-muted">
        {carName(car)} · {review ? `estimate ${money(q.review!.floor)} – ${money(q.firm)}` : money(q.firm)}
      </p>
      <ol className="mt-8 space-y-4 rounded-panel border border-line bg-white px-6 py-5 text-sm text-body">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line text-caption font-bold text-ink">{i + 1}</span>
            <span className="pt-0.5">{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-caption text-muted">Reference {reference(car)}</p>
      <Button variant="outline" className="mt-8" onClick={t.reset}>
        Start another trade-in
      </Button>
    </div>
  );
}
