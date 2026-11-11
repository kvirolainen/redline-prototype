import { useEffect, useState, type ReactNode } from 'react';
import { StatusChip } from '../../components/ui/StatusChip';
import { money } from '../../domain/format';
import { C2DemoWorld, useC2Time } from './c2-demo';
import { isAccepted, isSettled, isWaiting, leaveLabel, leaveMin, shortCar, shortDealer } from './c2-model';
import { DeclaredItem, DeclaredRow, DemoDave, IdentityPhotos, NotReadyC2, OutcomeC2, WaitStrip } from './c2-parts';
import { useInspectorEnv } from './env';
import { AREAS, CHECKS, declaredFor, type AreaId, type InspectionCar, type Stop } from './fixtures';
import { BigButton, Icon, Progress, Screen } from './parts';
import { useRun, type Run } from './useRun';

// C2 · Exceptions only, plus the wait on Dave. C's collapsed areas with one "All match" each, the run as a vertical
// list of stops, VIN and odometer photos before identity can match, and a re-price that doesn't block the next car:
// Sam keeps working while the director decides, and the answer comes back to him on the run screen.
export function InspectorVariantC2() {
  const env = useInspectorEnv();
  if (env.live) return <Flow />;
  return (
    <C2DemoWorld>
      <Flow />
    </C2DemoWorld>
  );
}

type Photos = Record<string, { odometer: boolean; vin: boolean }>;

function Flow() {
  const run = useRun();
  const env = useInspectorEnv();
  const time = useC2Time();
  const [carId, setCarId] = useState<string>();
  const [photos, setPhotos] = useState<Photos>({});
  const [seen, setSeen] = useState<Record<string, boolean>>({});

  // Every new screen (another car, or the same car after a decision) starts at the top.
  const screen = carId ? `${carId}:${run.statusOf(carId)}` : 'run';
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const waited = (id: string) => (time.sentAt[id] !== undefined ? Math.max(0, time.now - time.sentAt[id]) : undefined);
  const pastLeave = (c: InspectionCar) => time.now >= leaveMin(env.stopOf(c));

  const open = (id: string) => {
    const o = run.outcomes[id];
    if (o?.kind === 'reprice' && o.declined) setSeen((s) => ({ ...s, [id]: true }));
    setCarId(id);
  };

  /** Cars whose re-price is out of Sam's hands, or whose answer he still has to act on. */
  const strips = env.cars.filter((c) => {
    const o = run.outcomes[c.id];
    return isWaiting(o) || isAccepted(o) || (o?.kind === 'reprice' && o.declined && !seen[c.id]);
  });

  const stripFor = (c: InspectionCar) => (
    <WaitStrip key={c.id} car={c} outcome={run.outcomes[c.id]} waited={waited(c.id)} pastLeave={pastLeave(c)} onOpen={() => open(c.id)} />
  );

  const car = carId ? env.carById(carId) : undefined;
  if (!car)
    return <RunScreen run={run} waited={waited} strips={strips.map(stripFor)} demoCar={strips.find((c) => isWaiting(run.outcomes[c.id]))} onOpen={open} />;

  const nextHere = env.carsAt(car.stopId).find((c) => c.id !== car.id && !run.outcomes[c.id]);
  const reopen = () => {
    run.reopen(car.id);
    setPhotos((p) => ({ ...p, [car.id]: { odometer: false, vin: false } }));
    setSeen((s) => ({ ...s, [car.id]: false }));
  };

  return (
    <CarScreen
      key={car.id}
      run={run}
      car={car}
      photos={photos[car.id] ?? { odometer: false, vin: false }}
      onPhoto={(which) => setPhotos((p) => ({ ...p, [car.id]: { ...(p[car.id] ?? { odometer: false, vin: false }), [which]: true } }))}
      waited={waited(car.id)}
      pastLeave={pastLeave(car)}
      others={strips.filter((c) => c.id !== car.id).map(stripFor)}
      nextLabel={nextHere ? `Next car: ${shortCar(nextHere)}` : 'Back to the run'}
      onNext={() => setCarId(nextHere?.id)}
      onBack={() => setCarId(undefined)}
      onUndo={reopen}
    />
  );
}

/** Today's stops top to bottom: done stops fold away, the current one is open with its cars, later ones wait below. */
function RunScreen({
  run,
  waited,
  strips,
  demoCar,
  onOpen,
}: {
  run: Run;
  waited: (id: string) => number | undefined;
  strips: ReactNode[];
  demoCar: InspectionCar | undefined;
  onOpen: (id: string) => void;
}) {
  const env = useInspectorEnv();
  const { run: info, stops, cars, carsAt } = env;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const stopDone = (s: Stop) => carsAt(s.id).every((c) => isSettled(run.outcomes[c.id]));
  const current = stops.find((s) => !stopDone(s));
  const settled = cars.filter((c) => isSettled(run.outcomes[c.id])).length;

  return (
    <Screen
      title={current ? `Leave ${shortDealer(current)} by ${leaveLabel(current)}` : `${info.day} run done`}
      subtitle={`${info.day} run · ${info.truck} · ${info.date.replace('Today, ', '')}`}
      footer={strips.length ? <div className="space-y-2">{strips}</div> : undefined}
    >
      {stops.length === 0 ? (
        <p className="rounded-panel border border-line bg-white p-5 text-base text-body">No pickup run for you today. Your next run shows here on the day.</p>
      ) : (
        <>
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-ink">
                {settled} of {cars.length} cars done
              </span>
              <span className="text-muted">About 15 min a car</span>
            </div>
            <Progress done={settled} total={Math.max(cars.length, 1)} />
          </div>

          <ol className="space-y-3">
            {stops.map((s, i) => {
              const here = carsAt(s.id);
              const done = stopDone(s);
              const isCurrent = s.id === current?.id;
              const show = isCurrent || expanded[s.id];
              const toggle = () => setExpanded((e) => ({ ...e, [s.id]: !e[s.id] }));

              return (
                <li key={s.id} className={`rounded-panel border bg-white ${isCurrent ? 'border-ink' : 'border-line'}`}>
                  <button
                    type="button"
                    onClick={isCurrent ? undefined : toggle}
                    aria-expanded={show}
                    disabled={isCurrent}
                    className="flex w-full items-start gap-3 p-4 text-left disabled:cursor-default"
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        done ? 'bg-success text-white' : isCurrent ? 'bg-ink text-white' : 'bg-line-light text-muted'
                      }`}
                    >
                      {done ? <Icon name="check" className="size-4" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-title font-bold text-ink">{s.dealer}</span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {done ? stopSummary(run, here) : `${s.window} · ${s.address}`}
                      </span>
                      {isCurrent && <span className="block text-sm text-muted">Ask for {s.contact}</span>}
                      {!isCurrent && !done && <span className="block text-sm text-muted">{here.map(shortCar).join(', ')}</span>}
                    </span>
                    {!isCurrent && <Icon name="chevron" className={`mt-1 size-5 shrink-0 text-subtle transition-transform ${show ? 'rotate-90' : ''}`} />}
                  </button>

                  {show && (
                    <ul className="border-t border-line-light">
                      {here.map((c) => (
                        <li key={c.id} className="border-b border-line-light last:border-b-0">
                          <button type="button" onClick={() => onOpen(c.id)} className="flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas">
                            <span className="min-w-0 flex-1">
                              <span className="block text-base font-medium text-ink">{c.car}</span>
                              <span className="mt-0.5 block text-sm text-muted">
                                {c.spot} · {money(c.offer)}
                              </span>
                              <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <StatusChip status={run.statusOf(c.id)} />
                                <CarNote run={run} car={c} waited={waited(c.id)} />
                              </span>
                            </span>
                            <Icon name="chevron" className="size-5 shrink-0 text-subtle" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>

          {demoCar && <DemoDave carId={demoCar.id} leaveAt={leaveMin(env.stopOf(demoCar))} />}
        </>
      )}
    </Screen>
  );
}

function stopSummary(run: Run, cars: InspectionCar[]) {
  const n = { loaded: 0, left: 0, rolled: 0 };
  for (const c of cars) {
    const o = run.outcomes[c.id];
    if (o?.kind === 'confirmed') n.loaded++;
    else if (o?.kind === 'reprice') n.left++;
    else if (o?.kind === 'not_ready') n.rolled++;
  }
  return [n.loaded && `${n.loaded} loaded`, n.left && `${n.left} stayed`, n.rolled && `${n.rolled} next week`].filter(Boolean).join(' · ');
}

/** A short line next to the status chip where the chip alone doesn't say what Sam does next. */
function CarNote({ run, car, waited }: { run: Run; car: InspectionCar; waited: number | undefined }) {
  const o = run.outcomes[car.id];
  let text: string | undefined;
  if (isWaiting(o)) text = waited !== undefined ? (waited < 1 ? 'Sent just now' : `Sent ${waited} min ago`) : undefined;
  else if (o?.kind === 'confirmed' && o.accepted && !o.loaded) text = `New price ${money(o.accepted.to)} · load it`;
  else if (o?.kind === 'confirmed' && !o.loaded) text = 'Load it';
  if (!text) return null;
  return <span className="text-caption font-medium text-ink">{text}</span>;
}

function CarScreen({
  run,
  car,
  photos,
  onPhoto,
  waited,
  pastLeave,
  others,
  nextLabel,
  onNext,
  onBack,
  onUndo,
}: {
  run: Run;
  car: InspectionCar;
  photos: { odometer: boolean; vin: boolean };
  onPhoto: (which: 'odometer' | 'vin') => void;
  waited: number | undefined;
  pastLeave: boolean;
  others: ReactNode[];
  nextLabel: string;
  onNext: () => void;
  onBack: () => void;
  onUndo: () => void;
}) {
  const [open, setOpen] = useState<AreaId>();
  const [notReady, setNotReady] = useState(false);
  const env = useInspectorEnv();
  const stop = env.stopOf(car);
  const outcome = run.outcomes[car.id];
  const answers = run.answersFor(car.id);
  const diffs = run.differences(car.id);
  const banner = others.length > 0 && <div className="mb-4 space-y-2">{others}</div>;

  if (outcome)
    return (
      <Screen title={car.car} subtitle={stop.dealer} onBack={onBack}>
        {banner}
        <OutcomeC2
          car={car}
          outcome={outcome}
          diffs={diffs}
          waited={waited}
          pastLeave={pastLeave}
          nextLabel={nextLabel}
          onLoad={() => run.loadOnTruck(car.id)}
          onNext={onNext}
          onLeave={() => run.notReady(car.id, `No answer from ${env.directorOf(car)} by ${leaveLabel(stop)}`)}
          onUndo={onUndo}
        />
      </Screen>
    );

  const photosDone = photos.odometer && photos.vin;
  const itemsIn = (a: AreaId) => CHECKS.filter((c) => c.area === a);
  const resolved = (a: AreaId) => itemsIn(a).every((i) => answers[i.id]) && (a !== 'identity' || photosDone);
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
      {banner}
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
          const identity = area.id === 'identity';

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
                      ? areaDiffs.map((d) => `${d.finding} ${d.adjustment ? `−${money(-d.adjustment)}` : ''}`.trim()).join(' · ')
                      : identity
                        ? 'Matches declared · 2 photos'
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
                {identity && (
                  <div className="mt-3">
                    <IdentityPhotos odometer={photos.odometer} vin={photos.vin} onTake={onPhoto} />
                  </div>
                )}
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
                    disabled={identity && !photosDone}
                    className="inline-flex h-12 items-center justify-center gap-1.5 rounded-pill bg-ink text-sm font-bold text-white hover:bg-body disabled:bg-line-light disabled:text-subtle"
                  >
                    <Icon name="check" className="size-4" /> All match
                  </button>
                </div>
                {identity && !photosDone && <p className="mt-2 text-caption text-muted">Take both photos first, then tap All match.</p>}
              </div>
            );

          return (
            <div key={area.id} className="overflow-hidden rounded-card border border-ink bg-white">
              <p className="border-b border-line px-4 py-3 text-base font-bold text-ink">{area.label}: what's different?</p>
              {identity && (
                <div className="border-b border-line-light px-4 py-4">
                  <IdentityPhotos odometer={photos.odometer} vin={photos.vin} onTake={onPhoto} />
                </div>
              )}
              {items.map((item) => {
                const isDiff = answers[item.id]?.result === 'different';
                return (
                  <div key={item.id} className={`border-b border-line-light px-4 last:border-b-0 ${isDiff ? 'bg-nudge py-4' : 'py-3'}`}>
                    {isDiff ? (
                      <DeclaredItem
                        car={car}
                        item={item}
                        answer={answers[item.id]}
                        onSame={() => run.setAnswer(car.id, item.id, { result: 'match' })}
                        onDifferent={() => run.markDifferent(car, item.id)}
                        onClear={() => run.setAnswer(car.id, item.id, undefined)}
                        onPatch={(p) => run.patchDifferent(car.id, item.id, p)}
                      />
                    ) : (
                      <DeclaredRow car={car} item={item} onDifferent={() => run.markDifferent(car, item.id)} />
                    )}
                  </div>
                );
              })}
              <div className="border-t border-line px-4 py-3">
                <BigButton variant="outline" disabled={identity && !photosDone} onClick={() => doneWith(area.id)}>
                  {identity && !photosDone ? 'Take both photos first' : 'Done, the rest matches'}
                </BigButton>
              </div>
            </div>
          );
        })}
      </div>

      {notReady && <NotReadyC2 car={car} onClose={() => setNotReady(false)} onPick={(r) => run.notReady(car.id, r)} />}
    </Screen>
  );
}
