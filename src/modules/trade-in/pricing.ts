// Pricing stub. Clutch's real calculator plugs in here; everything below is a placeholder model
// so the screens behave believably: a clean demo Civic at 68,400 km comes out at exactly $17,850.
import type { DecodedCar } from './fixtures';

export type Step = 'vehicle' | 'features' | 'condition';

export interface Option {
  value: string;
  title: string;
  helper?: string;
  /** Dollars off the offer when picked. */
  deduct?: number;
  /** Picking this one means the offer can't be instant. */
  review?: boolean;
}

export interface Question {
  id: QuestionId;
  step: Step;
  label: string;
  multi?: boolean;
  /** Questions that move the price enough to ask in a quick firm-up. */
  mover?: boolean;
  /** Assumed answer when a quick flow skips the question. */
  assumed?: string;
  options: Option[];
}

export type QuestionId = 'keys' | 'title' | 'features' | 'exterior' | 'accidents' | 'mechanical' | 'interior' | 'tires';
export type Answers = Partial<Record<QuestionId, string[]>>;

export const QUESTIONS: Question[] = [
  {
    id: 'title', step: 'vehicle', label: 'Any title or history to disclose?', mover: true,
    options: [
      { value: 'clean', title: 'Clean title', helper: 'No salvage, rebuilt, flood or theft history' },
      { value: 'rebuilt', title: 'Salvage, rebuilt or total loss', review: true },
      { value: 'flood', title: 'Fire or flood damage', review: true },
      { value: 'stolen', title: 'Previously stolen', review: true },
    ],
  },
  {
    id: 'keys', step: 'vehicle', label: 'How many keys come with it?', assumed: '2',
    options: [
      { value: '2', title: '2 or more keys' },
      { value: '1', title: '1 key', deduct: 250 },
    ],
  },
  {
    id: 'features', step: 'features', label: 'Any modifications?', multi: true, assumed: 'none',
    options: [
      { value: 'none', title: 'No modifications' },
      { value: 'rims', title: 'Aftermarket rims', deduct: 150 },
      { value: 'cosmetic', title: 'Cosmetic modifications or a wrap', deduct: 200 },
      { value: 'performance', title: 'Performance or suspension upgrades', deduct: 300 },
    ],
  },
  {
    id: 'exterior', step: 'condition', label: 'Any exterior damage?', multi: true, mover: true,
    options: [
      { value: 'none', title: 'No exterior damage' },
      { value: 'minor', title: 'Minor cosmetic damage', helper: 'Scratches or dents smaller than a golf ball', deduct: 300 },
      { value: 'moderate', title: 'Moderate damage', helper: 'Dents or scrapes larger than a golf ball', deduct: 650 },
      { value: 'bodywork', title: 'Cracked or repainted bodywork', deduct: 700 },
      { value: 'glass', title: 'Chipped or cracked glass', deduct: 450 },
    ],
  },
  {
    id: 'accidents', step: 'condition', label: 'Any accidents or insurance claims?', mover: true,
    options: [
      { value: 'none', title: 'No accidents or claims' },
      { value: 'yes', title: '1 or more accidents or claims', deduct: 900 },
    ],
  },
  {
    id: 'mechanical', step: 'condition', label: 'Any mechanical issues or warning lights?', mover: true,
    options: [
      { value: 'no', title: 'No issues, no warning lights' },
      { value: 'yes', title: 'Has a mechanical issue or warning light', deduct: 1100 },
    ],
  },
  {
    id: 'interior', step: 'condition', label: 'Any interior damage?', multi: true, mover: true,
    options: [
      { value: 'none', title: 'No interior damage' },
      { value: 'stains', title: 'Stains or odours', deduct: 200 },
      { value: 'rips', title: 'Rips or tears', deduct: 300 },
      { value: 'dash', title: 'Damaged dash or panels', deduct: 350 },
    ],
  },
  {
    id: 'tires', step: 'condition', label: 'When were the all-season tires replaced?', assumed: 'new',
    options: [
      { value: 'new', title: 'In the last 12 months', helper: 'Usually 6 mm of tread or more' },
      { value: 'old', title: 'Over a year ago', deduct: 200 },
    ],
  },
];

export const question = (id: QuestionId) => QUESTIONS.find((q) => q.id === id)!;
export const MOVERS = QUESTIONS.filter((q) => q.mover);

/** Largest amount a question can move the price: the worst single option, or the worst two for multi-select. */
export function swing(q: Question) {
  const d = q.options.map((o) => o.deduct ?? 0).sort((a, b) => b - a);
  return q.multi ? d[0] + d[1] : d[0];
}

const round50 = (n: number) => Math.round(n / 50) * 50;
const round100 = (n: number) => Math.round(n / 100) * 100;

export const INSTANT_KM_LIMIT = 200000;

export interface Quote {
  firm: number;
  low: number;
  high: number;
  auctionNet: number;
  answered: number;
  total: number;
  complete: boolean;
  /** Set when the offer can't be instant: a guaranteed floor now, the firm offer later today. */
  review: null | { floor: number; reason: string };
}

/**
 * @param scope which questions count for "complete"; the quick flow passes only the movers and
 *   fills the rest with their assumed answers.
 */
export function quote(car: DecodedCar, km: number, answers: Answers, scope: Question[] = QUESTIONS): Quote {
  const filled: Answers = { ...answers };
  for (const q of QUESTIONS) if (!scope.includes(q) && !filled[q.id]?.length && q.assumed) filled[q.id] = [q.assumed];

  let firm = car.baseFirm - round50((km - car.listKm) * 0.05);
  let auctionNet = car.auctionNet - round50((km - car.listKm) * 0.045);
  let reviewReason: string | null = null;
  let unansweredSwing = 0;
  let answered = 0;

  for (const q of QUESTIONS) {
    const picked = filled[q.id] ?? [];
    if (scope.includes(q)) {
      if (picked.length) answered++;
      else unansweredSwing += swing(q);
    }
    for (const v of picked) {
      const o = q.options.find((x) => x.value === v);
      if (!o) continue;
      firm -= o.deduct ?? 0;
      auctionNet -= Math.round((o.deduct ?? 0) * 0.8);
      if (o.review) reviewReason = `${o.title}: a Clutch appraiser reviews branded titles by hand.`;
    }
  }

  if (km > INSTANT_KM_LIMIT) reviewReason = `Over ${INSTANT_KM_LIMIT.toLocaleString('en-CA')} km: a Clutch appraiser checks high-mileage cars by hand.`;
  if (reviewReason?.startsWith('Salvage') || reviewReason?.startsWith('Fire') || reviewReason?.startsWith('Previously')) {
    firm = round50(firm * 0.6);
    auctionNet = round50(auctionNet * 0.58);
  }

  const high = firm;
  const low = firm - round50(unansweredSwing * 0.6);
  return {
    firm, low, high, auctionNet: round50(auctionNet), answered, total: scope.length,
    complete: answered === scope.length,
    review: reviewReason ? { floor: round100(firm * 0.9), reason: reviewReason } : null,
  };
}

/** Honesty nudge shown under an answer, after Clutch's own sell flow. */
export function nudgeFor(car: DecodedCar, id: QuestionId, picked: string[]) {
  if (id === 'exterior' && picked.includes('none'))
    return `Only about 1 in 10 cars from ${car.year} has no exterior damage. Sam checks this on pickup day, and a difference means a new price for your director to approve.`;
  if (id === 'accidents' && picked.includes('none'))
    return 'Pickup-day inspection checks paint depth and panel gaps. Declaring a past repair now keeps the price you accept.';
  return null;
}

export function kmNudge(car: DecodedCar, km: number) {
  if (km > INSTANT_KM_LIMIT) return 'Over 200,000 km we can’t price instantly. You’ll get a guaranteed floor now and the firm offer by 3:00 pm today.';
  const age = 2026 - car.year;
  if (km > age * 40000) return 'That looks high for this car’s age. Check the odometer so the offer is right.';
  if (km > 0 && km < age * 3000) return 'That looks low for this car’s age. Check the odometer so the offer is right.';
  return null;
}
