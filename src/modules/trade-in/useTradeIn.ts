import { useState } from 'react';
import { CIVIC, decodeVin, type DecodedCar } from './fixtures';
import { QUESTIONS, quote as priceQuote, type Answers, type Question, type QuestionId } from './pricing';

export type Outcome = null | 'accepted' | 'floor-accepted' | 'review-sent';

/** Local state for one trade-in: VIN, km, answers, the live quote and the outcome. Shared by all variants. */
export function useTradeIn(scope: Question[] = QUESTIONS, start: 'demo' | 'blank' = 'demo') {
  const startVin = start === 'demo' ? CIVIC.vin : '';
  const startKm = start === 'demo' ? CIVIC.listKm.toLocaleString('en-CA') : '';
  const [vin, setVin] = useState(startVin);
  const [kmText, setKmText] = useState(startKm);
  const [car, setCar] = useState<DecodedCar | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [outcome, setOutcome] = useState<Outcome>(null);

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
    setAnswers({});
    return found;
  }

  function pick(c: DecodedCar) {
    setVin(c.vin);
    setKmText(c.listKm.toLocaleString('en-CA'));
    setVinError(null);
    setCar(c);
    setAnswers({});
  }

  function answer(id: QuestionId, value: string) {
    const q = QUESTIONS.find((x) => x.id === id)!;
    setAnswers((a) => {
      if (!q.multi) return { ...a, [id]: [value] };
      const cur = a[id] ?? [];
      if (value === 'none') return { ...a, [id]: cur.includes('none') ? [] : ['none'] };
      const rest = cur.filter((v) => v !== 'none');
      return { ...a, [id]: rest.includes(value) ? rest.filter((v) => v !== value) : [...rest, value] };
    });
  }

  function reset() {
    setVin(startVin);
    setKmText(startKm);
    setCar(null);
    setAnswers({});
    setOutcome(null);
    setVinError(null);
  }

  const quote = car && km > 0 ? priceQuote(car, km, answers, scope) : null;

  return {
    vin, setVin, kmText, setKmText, km, car, vinError, lookup, pick,
    answers, answer, quote, outcome, setOutcome, reset,
  };
}

export type TradeIn = ReturnType<typeof useTradeIn>;
