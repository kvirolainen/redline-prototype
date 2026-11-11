import type { ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { SegmentedProgress } from '../../components/ui/Stepper';
import { money } from '../../domain/format';
import { carName, DEALER, kmLabel, reference } from './fixtures';
import { useTradeInEnv } from './env';
import { FULL_QUESTIONS, INSTANT_KM_LIMIT, type Question, type QuestionId, type Quote } from './pricing';
import { useTradeIn, type TradeIn } from './useTradeIn';

// B2 · One screen. B, refined for a manager who does this many times a week, on the desk computer
// that she and the customer both look at. Clutch's full question list, every question always in
// the same place, no scrolling at 1440 × 900. The price shows once, when every answer is in, so
// nobody watches a number move while they answer.

/** Two columns that each flow on their own with an even rhythm: the car's history and body, then what comes with it.
 *  Rows are as tall as their content; nothing stretches to fill the screen. One question per line, except pairs that
 *  read as one thought (mechanical + driveable, rims + tire sets, the two tire questions); Rust sits right under
 *  Exterior damage. */
const COLUMNS: { title: string; rows: QuestionId[][] }[] = [
  { title: 'History and damage', rows: [['title'], ['accidents'], ['exterior'], ['rust'], ['interior'], ['mechanical', 'driveable']] },
  { title: 'Equipment and overall', rows: [['payout'], ['keys'], ['features'], ['rims', 'tireSets'], ['tireType', 'tires'], ['condition']] },
];

const Q = (id: QuestionId) => FULL_QUESTIONS.find((q) => q.id === id)!;

/** Short labels so each question fits on one line. Anything missing falls back to the full text. */
const LABEL: Partial<Record<QuestionId, string>> = {
  title: 'Disclosures',
  accidents: 'Accidents or claims',
  payout: 'Loan or lease',
  exterior: 'Exterior damage',
  rust: 'Rust',
  mechanical: 'Mechanical or lights',
  interior: 'Interior damage',
  driveable: 'Driveable',
  keys: 'Keys',
  features: 'Features or modifications',
  rims: 'Original rims',
  tireSets: 'Sets of tires',
  tireType: 'Tires on it now',
  tires: 'All-seasons under a year old',
  condition: 'Overall condition',
};

const SHORT: Record<string, string> = {
  'title:none': 'None',
  'title:rebuilt': 'Salvage or rebuilt',
  'title:flood': 'Fire or flood',
  'title:stolen': 'Stolen',
  'accidents:none': 'None',
  'accidents:yes': '1 or more',
  'exterior:none': 'None',
  'exterior:minor': 'Minor',
  'exterior:moderate': 'Moderate',
  'exterior:bodywork': 'Cracked',
  'exterior:glass': 'Glass',
  'mechanical:no': 'None',
  'mechanical:yes': 'Yes',
  'interior:none': 'None',
  'interior:stains': 'Stains',
  'interior:rips': 'Rips or tears',
  'interior:dash': 'Dash or panels',
  'keys:2': '2 or more',
  'keys:1': '1',
  'features:none': 'None',
  'features:cosmetic': 'Cosmetic',
  'features:wrap': 'Wrap',
  'features:performance': 'Performance',
  'features:software': 'Software',
  'features:rims': 'Rims',
  'tireSets:1': '1',
  'tireSets:2': '2',
  'tireSets:3': '3 or more',
  'tires:new': 'Yes',
  'tires:old': 'No',
};

/** Small grey hint beside a label, for words that need a definition. */
const HINT: Partial<Record<QuestionId, string>> = {
  exterior: 'minor is under a golf ball',
};

/** Pale-yellow notes under an answer, after Clutch's own flow, worded for both people at the desk. */
function noteFor(t: TradeIn, id: QuestionId): string | null {
  const picked = t.answers[id] ?? [];
  if (!t.car) return null;
  if (id === 'exterior' && picked.includes('none'))
    return `Only about 1 in 10 cars from ${t.car.year} has none. It’s checked at pickup.`;
  if (id === 'accidents' && picked.includes('none'))
    return 'Paint and panels are checked at pickup. A repair mentioned now keeps the offer.';
  if (id === 'tires' && picked.length)
    return 'Replaced in the last 12 months usually means 6 mm of tread or more.';
  return null;
}

function kmNote(t: TradeIn): string | null {
  if (!t.car || !t.km) return null;
  if (t.km > INSTANT_KM_LIMIT) return null; // the offer box says why
  const age = 2026 - t.car.year;
  if (t.km > age * 40000) return 'That looks high for this car’s age. Check the odometer so the offer is right.';
  if (t.km < age * 3000) return 'That looks low for this car’s age. Check the odometer so the offer is right.';
  return null;
}

/** Every reason the offer needs a person, in plain words. */
function reviewReasons(t: TradeIn): string[] {
  const out: string[] = [];
  if (t.km > INSTANT_KM_LIMIT) out.push(`Over ${INSTANT_KM_LIMIT.toLocaleString('en-CA')} km`);
  for (const q of FULL_QUESTIONS)
    for (const v of t.answers[q.id] ?? []) {
      const o = q.options.find((x) => x.value === v);
      if (o?.review) out.push(o.title);
    }
  return out;
}

/** @param onOpenBackOffice the app shell switches to Back office; Storybook leaves it empty. */
export function TradeInVariantB2({ onOpenBackOffice }: { onOpenBackOffice?: () => void } = {}) {
  const t = useTradeIn(FULL_QUESTIONS, 'blank', FULL_QUESTIONS);

  if (t.outcome && t.quote)
    return (
      <div className="min-h-screen bg-canvas">
        <Header />
        <Done t={t} q={t.quote} onOpenBackOffice={onOpenBackOffice} />
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Header />
      <div className="mx-auto w-full max-w-[1400px] space-y-4 px-6 py-4 min-[1400px]:space-y-5 min-[1400px]:px-8 min-[1400px]:py-5 [@media(max-height:940px)]:space-y-3 [@media(max-height:940px)]:py-3">
        {/* The car and its price, across the top: where both people look first. */}
        <div className="grid grid-cols-[1fr_450px] rounded-panel border border-line bg-white min-[1400px]:grid-cols-[1fr_480px]">
          <CarRow t={t} />
          <OfferBox t={t} />
        </div>
        {/* The questions get the full width, so answers have room and never wrap. */}
        <div className="grid grid-cols-2 divide-x divide-line-light rounded-panel border border-line bg-white">
          {COLUMNS.map((c) => (
            <section key={c.title} className="px-8 pt-4 pb-5 min-[1400px]:px-10 min-[1400px]:pt-6 min-[1400px]:pb-7 [@media(max-height:940px)]:pt-4 [@media(max-height:940px)]:pb-5">
              <h2 className="text-caption font-bold tracking-wide text-muted uppercase">{c.title}</h2>
              <div className="mt-3 space-y-5 min-[1400px]:mt-4 min-[1400px]:space-y-6 [@media(max-height:940px)]:mt-3 [@media(max-height:940px)]:space-y-3.5">
                {c.rows.map((ids) => (
                  <Line key={ids.join()} ids={ids} t={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Slim title bar; the app shell above it already says who is viewing. */
function Header() {
  const { dates: DATES } = useTradeInEnv();
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
  const { demoCars } = useTradeInEnv();
  const note = kmNote(t);
  return (
    <div className="px-8 py-5 min-[1400px]:px-10 min-[1400px]:py-6 [@media(max-height:940px)]:py-4">
      <div className="grid grid-cols-[1fr_220px] gap-4">
        <Input
          label="VIN"
          value={t.vin}
          maxLength={17}
          placeholder="17 characters, on the dash or door frame"
          onChange={(v) => {
            const vin = v.toUpperCase();
            t.setVin(vin);
            if (vin.length === 17) t.lookup(vin);
            else if (t.car) t.clearCar();
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
      {t.car && (
        <p className="mt-3 text-sm text-muted">
          <span className="font-bold text-ink">{carName(t.car)}</span> · {t.car.colour} · {t.car.transmission}
        </p>
      )}
      {note && <Note>{note}</Note>}
      {!t.car && (
        <p className="mt-2 text-caption text-muted">
          Demo cars:{' '}
          {demoCars.map((c, i) => (
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
        className={`flex h-11 items-center rounded-card border bg-white px-4 min-[1400px]:h-12 ${
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

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-2 rounded-card bg-nudge px-3 py-2 text-caption text-body min-[1400px]:text-sm">{children}</p>;
}

/** Label above, answers as pills below, one left edge for everything. Black = picked, as in Clutch's flow. */
function Line({ ids, t }: { ids: QuestionId[]; t: TradeIn }) {
  const notes = ids.map((id) => noteFor(t, id)).filter(Boolean) as string[];
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6">
        {ids.map((id) => (
          <Answer key={id} q={Q(id)} t={t} wide={ids.length === 1} />
        ))}
      </div>
      {notes.map((n) => (
        <Note key={n}>{n}</Note>
      ))}
    </div>
  );
}

function Answer({ q, t, wide }: { q: Question; t: TradeIn; wide: boolean }) {
  const picked = t.answers[q.id] ?? [];
  return (
    <fieldset id={`q-${q.id}`} className={`scroll-mt-24 rounded-card ${wide ? 'col-span-2' : ''}`}>
      <legend className="text-base font-medium text-ink">
        {LABEL[q.id] ?? q.label}
        {q.multi && <span className="font-normal text-subtle"> · all that apply</span>}
        {HINT[q.id] && <span className="font-normal text-subtle"> · {HINT[q.id]}</span>}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2 [@media(max-height:940px)]:mt-1.5">
        {q.options.map((o) => {
          const on = picked.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              title={o.helper ?? o.title}
              onClick={() => t.answer(q.id, o.value)}
              className={`h-9 rounded-pill border px-3.5 text-sm transition-colors min-[1400px]:h-10 min-[1400px]:px-4 min-[1400px]:text-base ${
                on ? 'border-ink bg-ink font-medium text-white' : 'border-line bg-white text-ink hover:border-ink'
              }`}
            >
              {SHORT[`${q.id}:${o.value}`] ?? o.title}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The price box, top right. Shows progress until every answer is in, then the one result. */
function OfferBox({ t }: { t: TradeIn }) {
  const { dates: DATES } = useTradeInEnv();
  const q = t.quote;
  const reasons = reviewReasons(t);
  const answered = FULL_QUESTIONS.filter((x) => t.answers[x.id]?.length).length;
  const total = FULL_QUESTIONS.length;
  return (
    <div className="flex flex-col justify-center border-l border-line-light px-8 py-5 min-[1400px]:px-10">
      {reasons.length && q ? (
        <ByHand t={t} q={q} reasons={reasons} />
      ) : q?.complete ? (
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm text-muted">Clutch’s firm offer</p>
            <p className="mt-1 text-[40px] leading-[44px] font-bold text-ink tabular-nums">{money(q.firm)}</p>
            <p className="mt-1 text-caption text-muted">
              Holds until {DATES.validUntil}
            </p>
          </div>
          <Button className="shrink-0 px-8" disabled={t.submitting} onClick={() => t.setOutcome('accepted')}>
            Accept offer
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-ink">Clutch’s offer</p>
            <p className="text-sm text-muted">
              {answered} of {total} answered
            </p>
          </div>
          <div className="mt-3">
            <SegmentedProgress total={total} done={answered} />
          </div>
          <p className="mt-3 text-sm text-muted">
            {!t.car ? 'Shows here once the VIN and every answer are in.' : !t.km ? 'Shows here once the odometer and every answer are in.' : 'Shows here once every answer is in.'}
          </p>
          {answered > 0 && <Missing t={t} />}
        </>
      )}
    </div>
  );
}

/** The questions still open, each a link that jumps to it, so a skipped one is easy to find. */
function Missing({ t }: { t: TradeIn }) {
  const open = FULL_QUESTIONS.filter((x) => !t.answers[x.id]?.length);
  if (!open.length) return null;
  const shown = open.slice(0, 4);
  const jump = (id: QuestionId) => {
    const el = document.getElementById(`q-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    el.animate([{ backgroundColor: 'var(--color-nudge)' }, { backgroundColor: 'transparent' }], { duration: 1400 });
  };
  return (
    <p className="mt-1 text-sm text-muted">
      Left:{' '}
      {shown.map((x, i) => (
        <span key={x.id}>
          {i > 0 && ', '}
          <button type="button" className="font-medium text-ink underline hover:text-brand" onClick={() => jump(x.id)}>
            {LABEL[x.id] ?? x.label}
          </button>
        </span>
      ))}
      {open.length > shown.length && ` and ${open.length - shown.length} more`}
    </p>
  );
}

/** No instant offer: when it comes and why on the left, the one action on the right. */
function ByHand({ t, q, reasons }: { t: TradeIn; q: Quote; reasons: string[] }) {
  const { dates: DATES } = useTradeInEnv();
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-title font-bold text-ink">Offer by {DATES.firmBy}</p>
        <p className="mt-1 text-sm text-muted">A Clutch appraiser prices this one:</p>
        <p className="mt-0.5 text-sm font-medium text-ink">{reasons.join(' · ')}</p>
      </div>
      <Button className="shrink-0 px-6" disabled={!q.complete || t.submitting} onClick={() => t.setOutcome('review-sent', reasons)}>
        {q.complete ? 'Send to Clutch' : `${q.answered} of ${q.total} answered`}
      </Button>
    </div>
  );
}

/** After the action, in Clutch's own offer-card style: the result, what happens next, two ways on. */
function Done({ t, q, onOpenBackOffice }: { t: TradeIn; q: Quote; onOpenBackOffice?: () => void }) {
  const { dates: DATES } = useTradeInEnv();
  const car = t.car!;
  const review = t.outcome === 'review-sent';
  const reasons = reviewReasons(t);
  const steps = review
    ? [
        { icon: <IconClock />, title: `By ${DATES.firmBy}`, text: 'A Clutch appraiser sets the offer' },
        { icon: <IconCheck />, title: 'In Back office', text: 'The dealership accepts it or passes' },
        { icon: <IconTruck />, title: DATES.pickup, text: `Picked up with ${DEALER.name}’s regular run` },
      ]
    : [
        { icon: <IconTruck />, title: DATES.pickup, text: `Picked up with ${DEALER.name}’s regular run` },
        { icon: <IconCheck />, title: 'About 15 minutes', text: 'A Clutch inspector checks it against these answers' },
        { icon: <IconDollar />, title: 'Within 2 business days', text: `${DEALER.name} is paid` },
      ];
  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-success text-white">
        <svg viewBox="0 0 12 12" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M2.5 6.5l2.5 2.5 4.5-5" />
        </svg>
      </span>
      <h2 className="mt-4 text-h3 font-bold text-ink">{review ? 'Sent to Clutch' : 'Offer accepted'}</h2>

      <div className="mt-8 overflow-hidden rounded-card border border-brand/15 bg-white text-left shadow-[0_12px_32px_-12px_rgba(255,70,76,0.25)]">
        <div className="border-b border-brand/15 px-6 py-7 text-center">
          <p className="text-base text-ink">{review ? 'Offer' : 'Total value of vehicle'}</p>
          {review ? (
            <p className="mt-2 text-h4 font-bold text-ink">Coming by {DATES.firmBy}</p>
          ) : (
            <p className="mt-2 text-price font-bold text-ink tabular-nums">{money(q.firm)}</p>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 px-8 py-6 text-base">
          {[
            ['Make/Model', carName(car)],
            ['VIN', car.vin],
            ['Mileage', kmLabel(t.km)],
            ['Reference code', reference(car)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-medium text-ink">{k}</dt>
              <dd className="mt-1 text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        {review && (
          <ul className="space-y-2 border-t border-brand/15 px-8 py-5">
            {reasons.map((r) => (
              <li key={r} className="rounded-card bg-nudge px-3 py-2 text-sm text-body">
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3 className="mt-12 text-h4 font-bold text-ink">What happens next</h3>
      <ol className="mt-6 grid grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <li key={i} className="relative">
            {i > 0 && <span className="absolute top-6 right-1/2 mr-8 h-px w-[calc(100%-48px)] bg-line" aria-hidden />}
            <span className="relative mx-auto grid size-12 place-items-center rounded-full bg-brand-tint text-brand">{s.icon}</span>
            <p className="mt-3 text-sm font-bold text-ink">{s.title}</p>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
      {!review && (
        <p className="mx-auto mt-6 max-w-[520px] text-caption text-muted">
          If something differs at pickup, Clutch sends a new price with the reason, and the dealership decides.
        </p>
      )}

      <div className="mt-10 flex flex-col items-center gap-4">
        <Button className="px-10" onClick={t.reset}>
          Start another trade-in
        </Button>
        <button type="button" onClick={onOpenBackOffice} className="text-base font-bold text-brand hover:underline">
          Open Back office
        </button>
      </div>
    </div>
  );
}

const icon = 'size-6';
function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 7h11v9H2zM13 10h4l4 3v3h-8z" />
      <circle cx="6" cy="17.5" r="1.8" fill="white" />
      <circle cx="17" cy="17.5" r="1.8" fill="white" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 12l2 2 4-4" />
    </svg>
  );
}
function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.2c-.4-.8-1.4-1.3-2.5-1.3-1.5 0-2.5.8-2.5 1.9 0 2.6 5.2 1.4 5.2 4.2 0 1.1-1.1 2-2.7 2-1.2 0-2.2-.5-2.6-1.4M12 6.5v11" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
