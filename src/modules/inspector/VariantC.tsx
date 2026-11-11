import { useState } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { DifferenceEditor } from './DifferenceEditor';
import { useInspectorEnv } from './env';
import { AREAS, CHECKS, declaredFor, type AreaId, type InspectionCar } from './fixtures';
import { BigButton, Icon, NotReadySheet, OutcomeView, Progress, Screen } from './parts';
import { useRun, type Run } from './useRun';

// C · Exceptions only. Checks are grouped by area and collapsed; one tap says "All matches declared".
// Only an area with a difference opens up, and only the differing item asks for detail and a photo.
export function InspectorVariantC({ startCar }: { startCar?: string }) {
  const run = useRun();
  const env = useInspectorEnv();
  const [carId, setCarId] = useState<string | undefined>(startCar);

  const car = carId ? env.carById(carId) : undefined;
  if (!car) return <RunList run={run} onOpen={setCarId} />;
  const nextCar = () => {
    const next = env.carsAt(car.stopId).find((c) => c.id !== car.id && !run.outcomes[c.id]);
    setCarId(next?.id);
  };
  return <CarAreas key={car.id} run={run} car={car} onBack={() => setCarId(undefined)} onNext={nextCar} />;
}

/** Today's stops in driving order, each with its cars: the whole run on one scrolling screen. */
function RunList({ run, onOpen }: { run: Run; onOpen: (id: string) => void }) {
  const { run: info, stops, cars, carsAt } = useInspectorEnv();
  return (
    <Screen title={`${info.day} run`} subtitle={`${info.date} · ${info.truck} · ${cars.length} cars at ${stops.length} dealers`}>
      {stops.length === 0 ? (
        <p className="rounded-panel border border-line bg-white p-5 text-base text-body">No pickup run for you today. Your next run shows here on the day.</p>
      ) : (
        <>
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-ink">
                {run.doneCount} of {cars.length} cars done
              </span>
              <span className="text-muted">About 15 min a car</span>
            </div>
            <Progress done={run.doneCount} total={Math.max(cars.length, 1)} />
          </div>
          <ol className="space-y-6">
            {stops.map((s, i) => (
              <li key={s.id}>
                <div className="mb-3 flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-title font-bold text-ink">{s.dealer}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {s.window} · {s.address}
                    </p>
                    <p className="text-sm text-muted">Ask for {s.contact}</p>
                  </div>
                </div>
                <ul className="overflow-hidden rounded-card border border-line bg-white">
                  {carsAt(s.id).map((c) => (
                    <li key={c.id} className="border-b border-line-light last:border-b-0">
                      <button type="button" onClick={() => onOpen(c.id)} className="flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas">
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-medium text-ink">{c.car}</span>
                          <span className="mt-0.5 block text-sm text-muted">
                            {c.spot} · {money(c.offer)}
                          </span>
                          <span className="mt-2 block">
                            <StatusChip status={run.statusOf(c.id)} />
                          </span>
                        </span>
                        <Icon name="chevron" className="size-5 shrink-0 text-subtle" />
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </>
      )}
    </Screen>
  );
}

function CarAreas({ run, car, onBack, onNext }: { run: Run; car: InspectionCar; onBack: () => void; onNext: () => void }) {
  const [open, setOpen] = useState<AreaId>();
  const [notReady, setNotReady] = useState(false);
  const outcome = run.outcomes[car.id];
  const answers = run.answersFor(car.id);
  const diffs = run.differences(car.id);
  const env = useInspectorEnv();
  const stop = env.stopOf(car);

  if (outcome)
    return (
      <Screen title={car.car} subtitle={stop.dealer} onBack={onBack}>
        <OutcomeView
          car={car}
          outcome={outcome}
          diffs={diffs}
          onLoad={() => run.loadOnTruck(car.id)}
          onNext={onNext}
          nextLabel={env.carsAt(car.stopId).some((c) => c.id !== car.id && !run.outcomes[c.id]) ? 'Next car here' : `Done at ${stop.dealer}`}
          onUndo={() => run.reopen(car.id)}
        />
      </Screen>
    );

  const itemsIn = (a: AreaId) => CHECKS.filter((c) => c.area === a);
  const resolved = (a: AreaId) => itemsIn(a).every((i) => answers[i.id]);
  const left = AREAS.filter((a) => !resolved(a.id)).length;
  const price = run.suggestedPrice(car.id);
  const missingPhoto = diffs.some((d) => d.photos === 0);

  const allMatch = (a: AreaId) => {
    itemsIn(a).forEach((i) => run.setAnswer(car.id, i.id, { result: 'match' }));
    setOpen(undefined);
  };
  const doneWith = (a: AreaId) => {
    itemsIn(a).forEach((i) => !answers[i.id] && run.setAnswer(car.id, i.id, { result: 'match' }));
    setOpen(undefined);
  };

  return (
    <Screen
      title={car.car}
      subtitle={`${stop.dealer} · ${car.spot}`}
      onBack={onBack}
      right={
        <button type="button" onClick={() => setNotReady(true)} className="h-10 rounded-pill border border-line px-3 text-sm font-medium text-ink">
          Not ready
        </button>
      }
      footer={
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">{diffs.length ? 'Suggested price' : 'Offer'}</span>
            <span className="flex items-baseline gap-2">
              {diffs.length > 0 && <span className="text-sm text-muted line-through">{money(car.offer)}</span>}
              <span className="text-h4 font-bold text-ink">{money(price)}</span>
            </span>
          </div>
          {left > 0 ? (
            <BigButton disabled>
              {left} {left === 1 ? 'area' : 'areas'} left to check
            </BigButton>
          ) : diffs.length === 0 ? (
            <BigButton onClick={() => run.confirm(car.id)}>Confirm at {money(car.offer)}</BigButton>
          ) : (
            <BigButton disabled={missingPhoto} onClick={() => run.sendReprice(car.id)}>
              {missingPhoto ? 'Add a photo to every difference' : `Send re-price to ${env.directorOf(car)}`}
            </BigButton>
          )}
        </div>
      }
    >
      <p className="mb-4 text-base text-body">
        Walk around the car. If an area is what {stop.contact.split(',')[0]} declared, tap <span className="font-bold text-ink">All match</span>.
        Open an area only when something's different.
      </p>

      <div className="space-y-3">
        {AREAS.map((area) => {
          const items = itemsIn(area.id);
          const areaDiffs = diffs.filter((d) => d.item.area === area.id);
          const isOpen = open === area.id;
          const done = resolved(area.id);

          if (!isOpen && done)
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setOpen(area.id)}
                className={`flex w-full items-center gap-3 rounded-card border px-4 py-4 text-left ${
                  areaDiffs.length ? 'border-warning bg-nudge' : 'border-line bg-white'
                }`}
              >
                {areaDiffs.length ? (
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-warning text-sm font-bold text-ink">!</span>
                ) : (
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-white">
                    <Icon name="check" className="size-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium text-ink">{area.label}</span>
                  <span className="block text-sm text-muted">
                    {areaDiffs.length
                      ? areaDiffs.map((d) => `${d.finding} −${money(-d.adjustment)}`).join(' · ')
                      : 'All matches declared'}
                  </span>
                </span>
                <span className="text-sm font-medium text-muted">Change</span>
              </button>
            );

          if (!isOpen)
            return (
              <div key={area.id} className="rounded-card border border-line bg-white p-4">
                <p className="text-base font-medium text-ink">{area.label}</p>
                <p className="mt-0.5 text-sm text-muted">{items.map((i) => `${i.question}: ${declaredFor(i, car)}`).join(' · ')}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(area.id)}
                    className="h-12 rounded-pill border border-line bg-white text-sm font-bold text-ink hover:border-ink"
                  >
                    Something's different
                  </button>
                  <button
                    type="button"
                    onClick={() => allMatch(area.id)}
                    className="inline-flex h-12 items-center justify-center gap-1.5 rounded-pill bg-ink text-sm font-bold text-white hover:bg-body"
                  >
                    <Icon name="check" className="size-4" /> All match
                  </button>
                </div>
              </div>
            );

          return (
            <div key={area.id} className="overflow-hidden rounded-card border border-ink bg-white">
              <p className="border-b border-line px-4 py-3 text-base font-bold text-ink">{area.label}: what's different?</p>
              {items.map((item) => {
                const a = answers[item.id];
                const different = a?.result === 'different';
                return (
                  <div key={item.id} className={`border-b border-line-light px-4 py-4 last:border-b-0 ${different ? 'bg-nudge' : ''}`}>
                    <button
                      type="button"
                      aria-pressed={different}
                      onClick={() => (different ? run.setAnswer(car.id, item.id, undefined) : run.markDifferent(car, item.id))}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-medium text-ink">{item.question}</span>
                        <span className="block text-sm text-muted">Declared: {declaredFor(item, car)}</span>
                      </span>
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-xs border ${
                          different ? 'border-ink bg-ink text-white' : 'border-subtle bg-white'
                        }`}
                      >
                        {different && <Icon name="check" className="size-4" />}
                      </span>
                    </button>
                    {a?.result === 'different' && (
                      <div className="mt-4">
                        <DifferenceEditor item={item} answer={a} onChange={(p) => run.patchDifferent(car.id, item.id, p)} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="border-t border-line px-4 py-3">
                <BigButton variant="outline" onClick={() => doneWith(area.id)}>
                  Done, the rest matches
                </BigButton>
              </div>
            </div>
          );
        })}
      </div>

      {notReady && <NotReadySheet car={car} onClose={() => setNotReady(false)} onPick={(r) => run.notReady(car.id, r)} />}
    </Screen>
  );
}
