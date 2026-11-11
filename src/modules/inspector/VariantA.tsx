import { useState, type ReactNode } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { DifferenceEditor } from './DifferenceEditor';
import { AREAS, CARS, CHECKS, RUN, STOPS, carById, carsAt, declaredFor, stopOf, type CheckItem, type InspectionCar } from './fixtures';
import { BigButton, CarLine, DifferenceList, Icon, NotReadySheet, OutcomeView, PriceChange, Progress, Screen, Sheet } from './parts';
import { useRun, type Run } from './useRun';

// A · Run → car → checklist. Today's run list, a checklist per car with the declared answer next to a
// Match / Different toggle, and an outcome sheet at the end.
export function InspectorVariantA({ startCar }: { startCar?: string }) {
  const run = useRun();
  const [carId, setCarId] = useState<string | undefined>(startCar);

  if (!carId) return <RunList run={run} onOpen={setCarId} />;
  const car = carById(carId);
  const nextCar = () => setCarId(CARS.find((c) => c.id !== carId && !run.outcomes[c.id])?.id);
  return <CarChecklist key={carId} run={run} car={car} onBack={() => setCarId(undefined)} onNext={nextCar} />;
}

function RunList({ run, onOpen }: { run: Run; onOpen: (id: string) => void }) {
  return (
    <Screen title={`${RUN.day} run`} subtitle={`${RUN.date} · ${RUN.truck} · ${CARS.length} cars at ${STOPS.length} dealers`}>
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-ink">
            {run.doneCount} of {CARS.length} cars done
          </span>
          <span className="text-muted">About 15 min a car</span>
        </div>
        <Progress done={run.doneCount} total={CARS.length} />
      </div>
      <ol className="space-y-6">
        {STOPS.map((s, i) => (
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
    </Screen>
  );
}

function CarChecklist({ run, car, onBack, onNext }: { run: Run; car: InspectionCar; onBack: () => void; onNext: () => void }) {
  const [sheet, setSheet] = useState<'finish' | 'not-ready'>();
  const outcome = run.outcomes[car.id];
  const answers = run.answersFor(car.id);
  const diffs = run.differences(car.id);
  const checked = run.checkedCount(car.id);
  const stop = stopOf(car);

  if (outcome)
    return (
      <Screen title={car.car} subtitle={stop.dealer} onBack={onBack}>
        <OutcomeView
          car={car}
          outcome={outcome}
          diffs={diffs}
          onLoad={() => run.loadOnTruck(car.id)}
          onNext={onNext}
          onUndo={() => run.reopen(car.id)}
        />
      </Screen>
    );

  const missingPhoto = diffs.some((d) => d.photos === 0);
  return (
    <Screen
      title={car.car}
      subtitle={`${stop.dealer} · ${car.spot}`}
      onBack={onBack}
      right={
        <button type="button" onClick={() => setSheet('not-ready')} className="h-10 rounded-pill border border-line px-3 text-sm font-medium text-ink">
          Not ready
        </button>
      }
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              {checked} of {CHECKS.length} checked
            </span>
            {diffs.length > 0 && (
              <span className="font-medium text-ink">
                {diffs.length} {diffs.length === 1 ? 'difference' : 'differences'}
              </span>
            )}
          </div>
          <BigButton disabled={checked < CHECKS.length} onClick={() => setSheet('finish')}>
            Finish inspection
          </BigButton>
        </div>
      }
    >
      <div className="rounded-card border border-line bg-white p-4">
        <CarLine car={car} />
        <p className="mt-3 text-sm text-body">
          Offer <span className="font-bold text-ink">{money(car.offer)}</span> · declared by {stop.contact.split(',')[0]}
        </p>
      </div>

      {AREAS.map((area) => (
        <section key={area.id} className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-muted">{area.label}</h3>
          <div className="overflow-hidden rounded-card border border-line bg-white">
            {CHECKS.filter((c) => c.area === area.id).map((item) => (
              <CheckRow key={item.id} run={run} car={car} item={item} answer={answers[item.id]} />
            ))}
          </div>
        </section>
      ))}

      {sheet === 'not-ready' && (
        <NotReadySheet car={car} onClose={() => setSheet(undefined)} onPick={(r) => run.notReady(car.id, r)} />
      )}
      {sheet === 'finish' && (
        <Sheet title={diffs.length ? 'Re-price this car' : 'Everything matches'} onClose={() => setSheet(undefined)}>
          {diffs.length === 0 ? (
            <>
              <p className="text-base text-body">
                All {CHECKS.length} checks match what {stop.dealer} declared. The offer stands at{' '}
                <span className="font-bold text-ink">{money(car.offer)}</span>.
              </p>
              <BigButton className="mt-6" onClick={() => run.confirm(car.id)}>
                Confirm at {money(car.offer)}
              </BigButton>
            </>
          ) : (
            <>
              <PriceChange from={car.offer} to={run.suggestedPrice(car.id)} />
              <div className="mt-3">
                <DifferenceList diffs={diffs} />
              </div>
              <p className="mt-4 text-sm text-muted">Dave, Sales Director at {stop.dealer}, sees this with your photos and decides.</p>
              {missingPhoto && <p className="mt-2 text-sm font-medium text-error">Add a photo to every difference first</p>}
              <BigButton className="mt-4" disabled={missingPhoto} onClick={() => run.sendReprice(car.id)}>
                Send re-price to Dave
              </BigButton>
            </>
          )}
        </Sheet>
      )}
    </Screen>
  );
}

function CheckRow({ run, car, item, answer }: { run: Run; car: InspectionCar; item: CheckItem; answer: ReturnType<Run['answersFor']>[string] | undefined }) {
  const different = answer?.result === 'different';
  return (
    <div className={`border-b border-line-light px-4 py-4 last:border-b-0 ${different ? 'bg-nudge' : ''}`}>
      <p className="text-base font-medium text-ink">{item.question}</p>
      <p className="mt-0.5 text-sm text-muted">Declared: {declaredFor(item, car)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Toggle selected={answer?.result === 'match'} onClick={() => run.setAnswer(car.id, item.id, { result: 'match' })}>
          <Icon name="check" /> Match
        </Toggle>
        <Toggle selected={different} onClick={() => !different && run.markDifferent(car, item.id)}>
          Different
        </Toggle>
      </div>
      {answer?.result === 'different' && (
        <div className="mt-4">
          <DifferenceEditor item={item} answer={answer} onChange={(p) => run.patchDifferent(car.id, item.id, p)} />
        </div>
      )}
    </div>
  );
}

function Toggle({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center gap-1.5 rounded-pill border text-base font-bold transition-colors ${
        selected ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
      }`}
    >
      {children}
    </button>
  );
}
