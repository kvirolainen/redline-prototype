import { useState } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { DifferenceEditor } from './DifferenceEditor';
import { AREAS, CARS, CHECKS, RUN, STOPS, carById, carsAt, declaredFor, stopOf, type AreaId, type InspectionCar } from './fixtures';
import { BigButton, CarLine, Icon, NotReadySheet, OutcomeView, Screen } from './parts';
import { useRun, type Run } from './useRun';

// C · Exceptions only. Checks are grouped by area and collapsed; one tap says "All matches declared".
// Only an area with a difference opens up, and only the differing item asks for detail and a photo.
export function InspectorVariantC({ startCar }: { startCar?: string }) {
  const run = useRun();
  const [carId, setCarId] = useState<string | undefined>(startCar);
  const [stopId, setStopId] = useState(startCar ? carById(startCar).stopId : STOPS[0].id);

  if (!carId) return <Stops run={run} stopId={stopId} onStop={setStopId} onOpen={setCarId} />;
  const car = carById(carId);
  const nextCar = () => {
    const next = carsAt(car.stopId).find((c) => c.id !== carId && !run.outcomes[c.id]);
    setCarId(next?.id);
  };
  return <CarAreas key={carId} run={run} car={car} onBack={() => setCarId(undefined)} onNext={nextCar} />;
}

function Stops({ run, stopId, onStop, onOpen }: { run: Run; stopId: string; onStop: (id: string) => void; onOpen: (id: string) => void }) {
  const stop = STOPS.find((s) => s.id === stopId)!;
  const cars = carsAt(stopId);
  const left = cars.filter((c) => !run.outcomes[c.id]).length;
  return (
    <Screen title={`${RUN.day} run`} subtitle={`${RUN.date} · ${run.doneCount} of ${CARS.length} done · ${RUN.truck}`}>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {STOPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStop(s.id)}
            className={`h-11 shrink-0 rounded-pill border px-4 text-sm font-medium whitespace-nowrap ${
              s.id === stopId ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink'
            }`}
          >
            {i + 1}. {s.dealer}
          </button>
        ))}
      </div>

      <div className="rounded-panel border border-line bg-white p-5">
        <p className="text-h4 font-bold text-ink">{stop.dealer}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <Icon name="pin" className="size-4" /> {stop.address}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <Icon name="clock" className="size-4" /> {stop.window} · ask for {stop.contact}
        </p>
        <p className="mt-4 text-base text-body">
          {left === 0 ? 'All cars here are done.' : `${left} of ${cars.length} ${cars.length === 1 ? 'car' : 'cars'} left here.`}
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {cars.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => onOpen(c.id)} className="w-full rounded-card border border-line bg-white p-4 text-left hover:border-subtle">
              <div className="flex items-start justify-between gap-3">
                <CarLine car={c} />
                <Icon name="chevron" className="mt-1 size-5 shrink-0 text-subtle" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <StatusChip status={run.statusOf(c.id)} />
                <span className="text-sm text-muted">{c.spot}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function CarAreas({ run, car, onBack, onNext }: { run: Run; car: InspectionCar; onBack: () => void; onNext: () => void }) {
  const [open, setOpen] = useState<AreaId>();
  const [notReady, setNotReady] = useState(false);
  const outcome = run.outcomes[car.id];
  const answers = run.answersFor(car.id);
  const diffs = run.differences(car.id);
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
          nextLabel={carsAt(car.stopId).some((c) => c.id !== car.id && !run.outcomes[c.id]) ? 'Next car here' : `Done at ${stop.dealer}`}
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
              {missingPhoto ? 'Add a photo to every difference' : 'Send re-price to Dave'}
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
