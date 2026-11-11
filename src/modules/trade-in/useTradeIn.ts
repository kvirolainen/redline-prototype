import { useState } from 'react';
import { CIVIC, decodeVin, type DecodedCar } from './fixtures';
import { useTradeInEnv } from './env';
import { QUESTIONS, quote as priceQuote, type Answers, type Question, type QuestionId } from './pricing';

export type Outcome = null | 'accepted' | 'floor-accepted' | 'review-sent';

/** Local state for one trade-in: VIN, km, answers, the live quote and the outcome. Shared by all variants. */
export function useTradeIn(scope: Question[] = QUESTIONS, start: 'demo' | 'blank' = 'demo', all: Question[] = QUESTIONS) {
  const startVin = start === 'demo' ? CIVIC.vin : '';
  const startKm = start === 'demo' ? CIVIC.listKm.toLocaleString('en-CA') : '';
  const [vin, setVin] = useState(startVin);
  const [kmText, setKmText] = useState(startKm);
  const [car, setCar] = useState<DecodedCar | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [outcome, setOutcomeState] = useState<Outcome>(null);
  const [submitting, setSubmitting] = useState(false);
  const env = useTradeInEnv();

  const km = Number(kmText.replace(/[^0-9]/g, '')) || 0;

  function lookup(v = vin) {
    const found = decodeVin(v);
    if (!found) {
      setVinError('We couldn’t find that VIN. Check the 17 characters on the dash or the driver’s door frame.');
      setCar(null);
      return null;
    }
    setVinError(null);
    setCar(found);
    // The one-screen version lets people answer before the VIN, so it keeps the answers.
    if (start === 'demo') setAnswers({});
    return found;
  }

  function pick(c: DecodedCar) {
    setVin(c.vin);
    setKmText(c.listKm.toLocaleString('en-CA'));
    setVinError(null);
    setCar(c);
    if (start === 'demo') setAnswers({});
  }

  function clearCar() {
    setCar(null);
    setVinError(null);
  }

  function answer(id: QuestionId, value: string) {
    const q = all.find((x) => x.id === id)!;
    setAnswers((a) => {
      if (!q.multi) return { ...a, [id]: [value] };
      const cur = a[id] ?? [];
      if (value === 'none') return { ...a, [id]: cur.includes('none') ? [] : ['none'] };
      const rest = cur.filter((v) => v !== 'none');
      return { ...a, [id]: rest.includes(value) ? rest.filter((v) => v !== value) : [...rest, value] };
    });
  }

  /** Demo shortcut: answers a typical well-kept car would get (cheapest answer each, a few minor scratches, good overall). */
  function fillDemo() {
    const typical: Record<string, string> = { exterior: 'minor', condition: 'good' };
    setAnswers(
      Object.fromEntries(
        all.map((q) => {
          const ok = q.options.filter((o) => !o.review);
          const pick = ok.find((o) => o.value === typical[q.id]) ?? [...ok].sort((a, b) => (a.deduct ?? 0) - (b.deduct ?? 0))[0];
          return [q.id, [pick.value]];
        }),
      ),
    );
  }

  function reset() {
    setVin(startVin);
    setKmText(startKm);
    setCar(null);
    setAnswers({});
    setOutcomeState(null);
    setVinError(null);
  }

  const quote = car && km > 0 ? priceQuote(car, km, answers, scope, all) : null;

  /** Finish the trade-in. In the app this saves the car first; a refusal (e.g. the car is already with Clutch)
   *  shows under the VIN and keeps the screen as it is. */
  async function setOutcome(o: Outcome, reviewReasons: string[] = []) {
    if (o && o !== 'floor-accepted' && env.submit && car && quote) {
      setSubmitting(true);
      const err = await env.submit({ car, km, answers, quote, mode: o, reviewReasons });
      setSubmitting(false);
      if (err) {
        setVinError(err);
        return;
      }
    }
    setOutcomeState(o);
  }

  return {
    vin, setVin, kmText, setKmText, km, car, vinError, lookup, pick, clearCar,
    answers, answer, fillDemo, quote, outcome, setOutcome, submitting, reset,
  };
}

export type TradeIn = ReturnType<typeof useTradeIn>;
