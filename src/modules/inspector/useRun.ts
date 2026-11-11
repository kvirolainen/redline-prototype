import { useState } from 'react';
import type { CarStatus } from '../../domain/statuses';
import { CARS, CHECKS, RUN, carById, declaredFor, type CheckItem, type InspectionCar } from './fixtures';

export type Answer =
  | { result: 'match' }
  | { result: 'different'; finding: number; note: string; photos: number };

export type Outcome =
  | { kind: 'confirmed'; loaded: boolean }
  | { kind: 'reprice'; from: number; to: number }
  | { kind: 'not_ready'; reason: string; next: string };

export interface Difference {
  item: CheckItem;
  declared: string;
  finding: string;
  note: string;
  adjustment: number;
  photos: number;
}

type Answers = Record<string, Record<string, Answer>>;

// Local state for one inspector's run: answers per car and item, and the outcome per car.
export function useRun() {
  const [answers, setAnswers] = useState<Answers>({});
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});

  const answersFor = (carId: string) => answers[carId] ?? {};

  const setAnswer = (carId: string, itemId: string, a: Answer | undefined) =>
    setAnswers((prev) => {
      const car = { ...(prev[carId] ?? {}) };
      if (a) car[itemId] = a;
      else delete car[itemId];
      return { ...prev, [carId]: car };
    });

  /** Mark an item as different, pre-filling the scripted finding and note for the demo car. */
  const markDifferent = (car: InspectionCar, itemId: string) => {
    const s = car.script?.[itemId];
    setAnswer(car.id, itemId, { result: 'different', finding: s?.finding ?? 0, note: s?.note ?? '', photos: 0 });
  };

  const patchDifferent = (carId: string, itemId: string, patch: Partial<{ finding: number; note: string; photos: number }>) => {
    const cur = answersFor(carId)[itemId];
    if (cur?.result !== 'different') return;
    setAnswer(carId, itemId, { ...cur, ...patch });
  };

  const differences = (carId: string): Difference[] => {
    const car = carById(carId);
    const a = answersFor(carId);
    return CHECKS.flatMap((item) => {
      const ans = a[item.id];
      if (ans?.result !== 'different') return [];
      const f = item.findings[ans.finding];
      return [{ item, declared: declaredFor(item, car), finding: f.label, note: ans.note, adjustment: f.adjustment, photos: ans.photos }];
    });
  };

  const suggestedPrice = (carId: string) =>
    carById(carId).offer + differences(carId).reduce((sum, d) => sum + d.adjustment, 0);

  const checkedCount = (carId: string) => Object.keys(answersFor(carId)).length;

  const setOutcome = (carId: string, o: Outcome | undefined) =>
    setOutcomes((prev) => {
      const next = { ...prev };
      if (o) next[carId] = o;
      else delete next[carId];
      return next;
    });

  const confirm = (carId: string) => setOutcome(carId, { kind: 'confirmed', loaded: false });
  const loadOnTruck = (carId: string) => setOutcome(carId, { kind: 'confirmed', loaded: true });
  const sendReprice = (carId: string) => setOutcome(carId, { kind: 'reprice', from: carById(carId).offer, to: suggestedPrice(carId) });
  const notReady = (carId: string, reason: string) => setOutcome(carId, { kind: 'not_ready', reason, next: RUN.nextRun });

  /** Undo, so a reviewer can walk the same car again. */
  const reopen = (carId: string) => {
    setOutcome(carId, undefined);
    setAnswers((prev) => ({ ...prev, [carId]: {} }));
  };

  const statusOf = (carId: string): CarStatus => {
    const o = outcomes[carId];
    if (!o) return 'awaiting_pickup';
    if (o.kind === 'confirmed') return o.loaded ? 'picked_up' : 'confirmed';
    if (o.kind === 'reprice') return 'reprice_pending';
    return 'not_ready';
  };

  const doneCount = CARS.filter((c) => outcomes[c.id]).length;

  return {
    answersFor, setAnswer, markDifferent, patchDifferent, differences, suggestedPrice, checkedCount,
    outcomes, confirm, loadOnTruck, sendReprice, notReady, reopen, statusOf, doneCount,
  };
}

export type Run = ReturnType<typeof useRun>;
