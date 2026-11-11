import { useState } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import { SegmentedProgress } from '../../components/ui/Stepper';
import { money } from '../../domain/format';
import { DifferenceEditor } from './DifferenceEditor';
import { AREAS, CARS, CHECKS, RUN, carById, declaredFor, stopOf } from './fixtures';
import { BigButton, CarLine, DifferenceList, Icon, NotReadySheet, OutcomeView, PriceChange, Screen } from './parts';
import { useRun, type Run } from './useRun';

type Step = 'intro' | number | 'summary';

// B · One car at a time. A focused flow: one question per screen with the dealer's declared answer
// shown big; differences add up into a suggested re-price as Sam goes.
export function InspectorVariantB({ startCar = 'civic' }: { startCar?: string }) {
  const run = useRun();
  const [carId, setCarId] = useState(startCar);
  const [step, setStep] = useState<Step>('intro');
  const [finished, setFinished] = useState(false);

  const open = (id: string) => {
    setCarId(id);
    setStep('intro');
  };
  const nextCar = () => {
    const i = CARS.findIndex((c) => c.id === carId);
    const next = [...CARS.slice(i + 1), ...CARS.slice(0, i)].find((c) => !run.outcomes[c.id]);
    if (next) open(next.id);
    else setFinished(true);
  };

  const car = carById(carId);
  const outcome = run.outcomes[carId];
  const position = CARS.findIndex((c) => c.id === carId) + 1;
  const subtitle = `Car ${position} of ${CARS.length} · ${stopOf(car).dealer}`;
  const allDone = run.doneCount === CARS.length;

  if (finished) return <RunDone run={run} />;
  if (outcome)
    return (
      <Screen title={car.car} subtitle={subtitle}>
        <OutcomeView
          car={car}
          outcome={outcome}
          diffs={run.differences(carId)}
          onLoad={() => run.loadOnTruck(carId)}
          onNext={nextCar}
          nextLabel={allDone ? 'Finish the run' : 'Next car'}
          onUndo={() => {
            run.reopen(carId);
            setStep('intro');
          }}
        />
      </Screen>
    );

  if (step === 'intro') return <Intro run={run} carId={carId} subtitle={subtitle} onStart={() => setStep(0)} onOpen={open} />;
  if (step === 'summary') return <Summary run={run} carId={carId} subtitle={subtitle} onBack={() => setStep(CHECKS.length - 1)} />;
  return (
    <Question
      key={step}
      run={run}
      carId={carId}
      index={step}
      onBack={() => setStep(step === 0 ? 'intro' : step - 1)}
      onNext={() => setStep(step === CHECKS.length - 1 ? 'summary' : step + 1)}
    />
  );
}

function PricePill({ run, carId }: { run: Run; carId: string }) {
  const offer = carById(carId).offer;
  const price = run.suggestedPrice(carId);
  const changed = price !== offer;
  return (
    <span className={`inline-flex h-9 items-center rounded-pill border px-3 text-sm font-bold ${changed ? 'border-warning bg-nudge text-ink' : 'border-line text-ink'}`}>
      {money(price)}
    </span>
  );
}

function Intro({ run, carId, subtitle, onStart, onOpen }: { run: Run; carId: string; subtitle: string; onStart: () => void; onOpen: (id: string) => void }) {
  const [notReady, setNotReady] = useState(false);
  const car = carById(carId);
  const stop = stopOf(car);
  return (
    <Screen
      title={`${RUN.day} run`}
      subtitle={`${RUN.date} · ${run.doneCount} of ${CARS.length} done`}
      footer={
        <div className="space-y-2">
          <BigButton onClick={onStart}>Start inspection</BigButton>
          <BigButton variant="outline" onClick={() => setNotReady(true)}>
            Car or keys not here
          </BigButton>
        </div>
      }
    >
      <p className="mb-2 text-sm font-medium text-muted">Up next · {subtitle}</p>
      <div className="rounded-panel border border-line bg-white p-5">
        <CarLine car={car} />
        <dl className="mt-5 space-y-3 text-base">
          <Row icon="pin" label={stop.dealer} detail={`${car.spot} · ${stop.address}`} />
          <Row icon="key" label={`${car.keys} ${car.keys === 1 ? 'key' : 'keys'} declared`} detail={`Ask ${stop.contact}`} />
          <Row icon="clock" label="About 15 minutes" detail={`${CHECKS.length} checks against what the dealer declared`} />
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">Offer</span>
          <span className="text-h4 font-bold text-ink">{money(car.offer)}</span>
        </div>
      </div>

      <p className="mt-8 mb-2 text-sm font-medium text-muted">Rest of the run</p>
      <ul className="overflow-hidden rounded-card border border-line bg-white">
        {CARS.filter((c) => c.id !== carId).map((c) => (
          <li key={c.id} className="border-b border-line-light last:border-b-0">
            <button type="button" onClick={() => onOpen(c.id)} className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left hover:bg-canvas">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{c.car}</span>
                <span className="block truncate text-caption text-muted">{stopOf(c).dealer}</span>
              </span>
              <StatusChip status={run.statusOf(c.id)} />
            </button>
          </li>
        ))}
      </ul>
      {notReady && <NotReadySheet car={car} onClose={() => setNotReady(false)} onPick={(r) => run.notReady(carId, r)} />}
    </Screen>
  );
}

function Row({ icon, label, detail }: { icon: 'pin' | 'key' | 'clock'; label: string; detail: string }) {
  return (
    <div className="flex gap-3">
      <Icon name={icon} className="mt-0.5 size-5 shrink-0 text-muted" />
      <div className="min-w-0">
        <dt className="font-medium text-ink">{label}</dt>
        <dd className="text-sm text-muted">{detail}</dd>
      </div>
    </div>
  );
}

function Question({ run, carId, index, onBack, onNext }: { run: Run; carId: string; index: number; onBack: () => void; onNext: () => void }) {
  const car = carById(carId);
  const item = CHECKS[index];
  const answer = run.answersFor(carId)[item.id];
  const area = AREAS.find((a) => a.id === item.area)!;
  const different = answer?.result === 'different';

  return (
    <Screen
      title={car.car}
      subtitle={`Check ${index + 1} of ${CHECKS.length} · ${area.label}`}
      onBack={onBack}
      right={<PricePill run={run} carId={carId} />}
      footer={
        different ? (
          <BigButton disabled={answer.photos === 0} onClick={onNext}>
            {answer.photos === 0 ? 'Take a photo to continue' : 'Continue'}
          </BigButton>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => run.markDifferent(car, item.id)}
              className="h-16 rounded-pill border border-line bg-white text-base font-bold text-ink hover:border-ink"
            >
              Different
            </button>
            <button
              type="button"
              onClick={() => {
                run.setAnswer(carId, item.id, { result: 'match' });
                onNext();
              }}
              className="inline-flex h-16 items-center justify-center gap-2 rounded-pill bg-ink text-base font-bold text-white hover:bg-body"
            >
              <Icon name="check" /> Matches
            </button>
          </div>
        )
      }
    >
      <SegmentedProgress total={CHECKS.length} done={index} />
      <p className="mt-6 text-sm font-medium text-muted">{area.label}</p>
      <h2 className="mt-1 text-h3 font-bold text-ink">{item.question}</h2>

      <div className="mt-5 rounded-panel border border-line bg-white p-5">
        <p className="text-sm text-muted">{stopOf(car).dealer} declared</p>
        <p className="mt-1 text-h4 font-bold text-ink">{declaredFor(item, car)}</p>
      </div>

      {answer?.result === 'match' && (
        <p className="mt-4 flex items-center gap-2 text-sm text-body">
          <Icon name="check" className="size-4 text-success" /> You marked this as matching. Tap Different to change it.
        </p>
      )}

      {different && (
        <div className="mt-6">
          <DifferenceEditor item={item} answer={answer} onChange={(p) => run.patchDifferent(carId, item.id, p)} />
          <button
            type="button"
            onClick={() => run.setAnswer(carId, item.id, undefined)}
            className="mt-4 h-12 w-full text-sm font-medium text-muted hover:text-ink"
          >
            It matches after all
          </button>
        </div>
      )}
    </Screen>
  );
}

function Summary({ run, carId, subtitle, onBack }: { run: Run; carId: string; subtitle: string; onBack: () => void }) {
  const car = carById(carId);
  const diffs = run.differences(carId);
  const dealer = stopOf(car).dealer;
  return (
    <Screen
      title={car.car}
      subtitle={subtitle}
      onBack={onBack}
      footer={
        diffs.length === 0 ? (
          <BigButton onClick={() => run.confirm(carId)}>Confirm at {money(car.offer)}</BigButton>
        ) : (
          <BigButton onClick={() => run.sendReprice(carId)}>Send re-price to Dave</BigButton>
        )
      }
    >
      {diffs.length === 0 ? (
        <div className="pt-6 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success text-white">
            <Icon name="check" className="size-8" />
          </span>
          <h2 className="mt-5 text-h4 font-bold text-ink">All {CHECKS.length} checks match</h2>
          <p className="mt-2 text-base text-body">
            {car.car} is what {dealer} declared. The offer stands at {money(car.offer)}.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-h4 font-bold text-ink">
            {diffs.length} {diffs.length === 1 ? 'difference' : 'differences'} from what {dealer} declared
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted">{CHECKS.length - diffs.length} other checks match.</p>
          <PriceChange from={car.offer} to={run.suggestedPrice(carId)} />
          <div className="mt-3">
            <DifferenceList diffs={diffs} />
          </div>
          <p className="mt-4 text-sm text-muted">Dave, Sales Director at {dealer}, gets this with your photos and accepts or declines.</p>
        </>
      )}
    </Screen>
  );
}

function RunDone({ run }: { run: Run }) {
  return (
    <Screen title={`${RUN.day} run`} subtitle={`${RUN.date} · ${RUN.truck}`}>
      <div className="pt-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-success text-white">
          <Icon name="truck" className="size-8" />
        </span>
        <h2 className="mt-5 text-h4 font-bold text-ink">Run finished</h2>
        <p className="mt-2 text-base text-body">Every car has an outcome. Dealers and ops see it already.</p>
      </div>
      <ul className="mt-8 overflow-hidden rounded-card border border-line bg-white">
        {CARS.map((c) => (
          <li key={c.id} className="flex min-h-14 items-center gap-3 border-b border-line-light px-4 py-2 last:border-b-0">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{c.car}</span>
              <span className="block truncate text-caption text-muted">{stopOf(c).dealer}</span>
            </span>
            <StatusChip status={run.statusOf(c.id)} />
          </li>
        ))}
      </ul>
    </Screen>
  );
}
