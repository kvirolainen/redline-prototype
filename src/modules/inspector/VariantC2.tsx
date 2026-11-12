import { useEffect, useRef, useState, type ReactNode } from "react";
import { StatusChip } from "../../components/ui/StatusChip";
import { money } from "../../domain/format";
import { C2DemoWorld, useC2Time } from "./c2-demo";
import {
  isAccepted,
  isSettled,
  isWaiting,
  leaveLabel,
  leaveMin,
  shortCar,
  shortDealer,
} from "./c2-model";
import {
  CompactItem,
  DemoDave,
  IdentityPhotos,
  NotReadyC2,
  OutcomeC2,
  WaitStrip,
} from "./c2-parts";
import { useInspectorEnv } from "./env";
import {
  AREAS,
  CHECKS,
  type AreaId,
  type InspectionCar,
  type Stop,
} from "./fixtures";
import { BigButton, Icon, Progress, Screen } from "./parts";
import { useRun, type Run } from "./useRun";

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
  // In the app the phone frame scrolls, not the window, so every scrolling parent goes back to the top.
  const screen = carId
    ? `${carId}:${run.statusOf(carId)}:${JSON.stringify(run.outcomes[carId] ?? null)}`
    : "run";
  const top = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let el: HTMLElement | null = top.current?.parentElement ?? null;
    while (el) {
      if (el.scrollTop > 0) el.scrollTop = 0;
      el = el.parentElement;
    }
    window.scrollTo(0, 0);
  }, [screen]);
  const anchor = <span ref={top} hidden />;

  const waited = (id: string) =>
    time.sentAt[id] !== undefined
      ? Math.max(0, time.now - time.sentAt[id])
      : undefined;
  const pastLeave = (c: InspectionCar) => time.now >= leaveMin(env.stopOf(c));

  const open = (id: string) => {
    const o = run.outcomes[id];
    if (o?.kind === "reprice" && o.declined)
      setSeen((s) => ({ ...s, [id]: true }));
    setCarId(id);
  };

  /** Cars whose re-price is out of Sam's hands, or whose answer he still has to act on. */
  const strips = env.cars.filter((c) => {
    const o = run.outcomes[c.id];
    return (
      isWaiting(o) ||
      isAccepted(o) ||
      (o?.kind === "reprice" && o.declined && !seen[c.id])
    );
  });

  const stripFor = (c: InspectionCar) => (
    <WaitStrip
      key={c.id}
      car={c}
      outcome={run.outcomes[c.id]}
      waited={waited(c.id)}
      pastLeave={pastLeave(c)}
      onOpen={() => open(c.id)}
    />
  );

  const car = carId ? env.carById(carId) : undefined;
  if (!car)
    return (
      <>
        {anchor}
        <RunScreen
          run={run}
          waited={waited}
          strips={strips.map(stripFor)}
          demoCar={strips.find((c) => isWaiting(run.outcomes[c.id]))}
          onOpen={open}
        />
      </>
    );

  const nextHere = env
    .carsAt(car.stopId)
    .find((c) => c.id !== car.id && !run.outcomes[c.id]);
  const reopen = () => {
    run.reopen(car.id);
    setPhotos((p) => ({ ...p, [car.id]: { odometer: false, vin: false } }));
    setSeen((s) => ({ ...s, [car.id]: false }));
  };

  return (
    <>
      {anchor}
      <CarScreen
        key={car.id}
        run={run}
        car={car}
        photos={photos[car.id] ?? { odometer: false, vin: false }}
        onPhoto={(which) =>
          setPhotos((p) => ({
            ...p,
            [car.id]: {
              ...(p[car.id] ?? { odometer: false, vin: false }),
              [which]: true,
            },
          }))
        }
        waited={waited(car.id)}
        pastLeave={pastLeave(car)}
        others={strips.filter((c) => c.id !== car.id).map(stripFor)}
        nextLabel={
          nextHere ? `Next car: ${shortCar(nextHere)}` : "Back to the run"
        }
        onNext={() => setCarId(nextHere?.id)}
        onBack={() => setCarId(undefined)}
        onUndo={reopen}
      />
    </>
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
  const stopDone = (s: Stop) =>
    carsAt(s.id).every((c) => isSettled(run.outcomes[c.id]));
  const current = stops.find((s) => !stopDone(s));
  const settled = cars.filter((c) => isSettled(run.outcomes[c.id])).length;

  return (
    <Screen
      title={
        current
          ? `Leave ${shortDealer(current)} by ${leaveLabel(current)}`
          : `${info.day} run done`
      }
      subtitle={`${info.day} run · ${info.truck} · ${info.date.replace("Today, ", "")}`}
      footer={
        strips.length ? <div className="space-y-2">{strips}</div> : undefined
      }
    >
      {stops.length === 0 ? (
        <p className="rounded-panel border border-line bg-white p-5 text-base text-body">
          No pickup run for you today. Your next run shows here on the day.
        </p>
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
              const toggle = () =>
                setExpanded((e) => ({ ...e, [s.id]: !e[s.id] }));

              return (
                <li
                  key={s.id}
                  className={`rounded-panel border bg-white ${isCurrent ? "border-ink" : "border-line"}`}
                >
                  <button
                    type="button"
                    onClick={isCurrent ? undefined : toggle}
                    aria-expanded={show}
                    disabled={isCurrent}
                    className="flex w-full items-start gap-3 p-4 text-left disabled:cursor-default"
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        done
                          ? "bg-success text-white"
                          : isCurrent
                            ? "bg-ink text-white"
                            : "bg-line-light text-muted"
                      }`}
                    >
                      {done ? <Icon name="check" className="size-4" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-title font-bold text-ink">
                        {s.dealer}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {done
                          ? stopSummary(run, here)
                          : `${s.window} · ${s.address}`}
                      </span>
                      {isCurrent && (
                        <span className="block text-sm text-muted">
                          Ask for {s.contact}
                        </span>
                      )}
                      {!isCurrent && !done && (
                        <span className="block text-sm text-muted">
                          {here.map(shortCar).join(", ")}
                        </span>
                      )}
                    </span>
                    {!isCurrent && (
                      <Icon
                        name="chevron"
                        className={`mt-1 size-5 shrink-0 text-subtle transition-transform ${show ? "rotate-90" : ""}`}
                      />
                    )}
                  </button>

                  {show && (
                    <ul className="border-t border-line-light">
                      {here.map((c) => (
                        <li
                          key={c.id}
                          className="border-b border-line-light last:border-b-0"
                        >
                          <button
                            type="button"
                            onClick={() => onOpen(c.id)}
                            className="flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-base font-medium text-ink">
                                {c.car}
                              </span>
                              <span className="mt-0.5 block text-sm text-muted">
                                {c.spot} · {money(c.offer)}
                              </span>
                              <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <StatusChip status={run.statusOf(c.id)} />
                                <CarNote
                                  run={run}
                                  car={c}
                                  waited={waited(c.id)}
                                />
                              </span>
                            </span>
                            <Icon
                              name="chevron"
                              className="size-5 shrink-0 text-subtle"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>

          {demoCar && (
            <DemoDave
              carId={demoCar.id}
              leaveAt={leaveMin(env.stopOf(demoCar))}
            />
          )}
        </>
      )}
    </Screen>
  );
}

function stopSummary(run: Run, cars: InspectionCar[]) {
  const n = { loaded: 0, left: 0, rolled: 0 };
  for (const c of cars) {
    const o = run.outcomes[c.id];
    if (o?.kind === "confirmed") n.loaded++;
    else if (o?.kind === "reprice") n.left++;
    else if (o?.kind === "not_ready") n.rolled++;
  }
  return [
    n.loaded && `${n.loaded} loaded`,
    n.left && `${n.left} stayed`,
    n.rolled && `${n.rolled} next week`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** A short line next to the status chip where the chip alone doesn't say what Sam does next. */
function CarNote({
  run,
  car,
  waited,
}: {
  run: Run;
  car: InspectionCar;
  waited: number | undefined;
}) {
  const o = run.outcomes[car.id];
  let text: string | undefined;
  if (isWaiting(o))
    text =
      waited !== undefined
        ? waited < 1
          ? "Sent just now"
          : `Sent ${waited} min ago`
        : undefined;
  else if (o?.kind === "confirmed" && o.accepted && !o.loaded)
    text = `New price ${money(o.accepted.to)} · load it`;
  else if (o?.kind === "confirmed" && !o.loaded) text = "Load it";
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
  onPhoto: (which: "odometer" | "vin") => void;
  waited: number | undefined;
  pastLeave: boolean;
  others: ReactNode[];
  nextLabel: string;
  onNext: () => void;
  onBack: () => void;
  onUndo: () => void;
}) {
  const [notReady, setNotReady] = useState(false);
  const env = useInspectorEnv();
  const stop = env.stopOf(car);
  const outcome = run.outcomes[car.id];
  const answers = run.answersFor(car.id);
  const diffs = run.differences(car.id);
  // Which area is on screen (AREAS.length = the summary), and whether its items are open.
  // Starts on the first area still to check, so coming back to a car resumes where Sam left off.
  const [step, setStep] = useState(() => {
    const i = AREAS.findIndex(
      (a) =>
        !CHECKS.filter((c) => c.area === a.id).every((c) => answers[c.id]) ||
        (a.id === "identity" && !(photos.odometer && photos.vin)),
    );
    return i < 0 ? AREAS.length : i;
  });
  // Each area starts at the top: the phone frame scrolls, not the window.
  const top = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let el: HTMLElement | null = top.current?.parentElement ?? null;
    while (el) {
      if (el.scrollTop > 0) el.scrollTop = 0;
      el = el.parentElement;
    }
  }, [step]);
  const banner = others.length > 0 && (
    <div className="mb-4 space-y-2">{others}</div>
  );

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
          onLeave={() =>
            run.notReady(
              car.id,
              `No answer from ${env.directorOf(car)} by ${leaveLabel(stop)}`,
            )
          }
          onUndo={onUndo}
        />
      </Screen>
    );

  const photosDone = photos.odometer && photos.vin;
  const itemsIn = (a: AreaId) => CHECKS.filter((c) => c.area === a);
  const resolved = (a: AreaId) =>
    itemsIn(a).every((i) => answers[i.id]) && (a !== "identity" || photosDone);
  const price = run.suggestedPrice(car.id);
  const missingPhoto = diffs.some((d) => d.photos === 0);
  const REVIEW = AREAS.length;
  const firstOpen = () => {
    const i = AREAS.findIndex((a) => !resolved(a.id));
    return i < 0 ? REVIEW : i;
  };
  const goTo = (i: number) => setStep(i);
  const advance = () => {
    // Next area still to check, after this one; the summary when there is none.
    const after = AREAS.findIndex((a, i) => i > step && !resolved(a.id));
    goTo(after >= 0 ? after : firstOpen());
  };
  const area = step < REVIEW ? AREAS[step] : undefined;
  const identity = area?.id === "identity";

  // The walk-around, one area per screen: what the dealer declared, then two answers at thumb height.
  const strip = (
    <ol className="-mt-1 mb-3 grid grid-cols-5 gap-1.5" aria-label="Areas">
      {AREAS.map((a, i) => {
        const hasDiff = diffs.some((d) => d.item.area === a.id);
        const done = resolved(a.id);
        const tone = i === step ? "bg-ink" : hasDiff ? "bg-warning" : done ? "bg-success" : "bg-line";
        return (
          <li key={a.id}>
            <button type="button" onClick={() => goTo(i)} aria-label={a.label} aria-current={i === step ? "step" : undefined} className="block w-full py-2">
              <span className={`block h-1.5 rounded-pill ${tone}`} />
            </button>
          </li>
        );
      })}
    </ol>
  );

  const areaLeft = area ? itemsIn(area.id).filter((i) => !answers[i.id]).length : 0;
  const nextLabel2 = step + 1 < REVIEW ? `Next: ${AREAS[step + 1].label}` : "Review";
  const footer = area ? (
    <BigButton disabled={areaLeft > 0 || (identity && !photosDone)} onClick={advance}>
      {identity && !photosDone
        ? "Take both photos first"
        : areaLeft > 0
          ? `${areaLeft} left on this screen`
          : nextLabel2}
    </BigButton>
  ) : (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted">{diffs.length ? "Suggested price" : "Offer"}</span>
        <span className="flex items-baseline gap-2">
          {diffs.length > 0 && <span className="text-sm text-muted line-through">{money(car.offer)}</span>}
          <span className="text-h4 font-bold text-ink">{money(price)}</span>
        </span>
      </div>
      {firstOpen() < REVIEW ? (
        <BigButton onClick={() => goTo(firstOpen())}>Check {AREAS[firstOpen()].label}</BigButton>
      ) : diffs.length === 0 ? (
        <BigButton onClick={() => run.confirm(car.id)}>Confirm at {money(car.offer)}</BigButton>
      ) : (
        <BigButton disabled={missingPhoto} onClick={() => run.sendReprice(car.id)}>
          {missingPhoto ? "Add a photo to every difference" : "Send re-price"}
        </BigButton>
      )}
    </div>
  );

  return (
    <Screen
      title={car.car}
      subtitle={`${stop.dealer} · ${car.spot}`}
      onBack={onBack}
      right={
        <button
          type="button"
          onClick={() => setNotReady(true)}
          className="h-10 rounded-pill border border-line px-3 text-sm font-medium text-ink"
        >
          Not ready
        </button>
      }
      footer={footer}
    >
      <span ref={top} hidden />
      {banner}
      {strip}

      {area ? (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-title font-bold text-ink">{area.label}</h3>
            <span className="shrink-0 text-caption text-muted">
              {step + 1} of {AREAS.length}
            </span>
          </div>

          {identity && (
            <div className="mt-2.5">
              <IdentityPhotos odometer={photos.odometer} vin={photos.vin} onTake={onPhoto} />
            </div>
          )}

          <div className="mt-2.5 divide-y divide-line-light overflow-hidden rounded-card border border-line bg-white">
              {itemsIn(area.id).map((item) => (
                <CompactItem
                  key={item.id}
                  car={car}
                  item={item}
                  answer={answers[item.id]}
                  onDifferent={() => run.markDifferent(car, item.id)}
                  onSame={() => run.setAnswer(car.id, item.id, { result: "match" })}
                  onClear={() => run.setAnswer(car.id, item.id, undefined)}
                  onPatch={(p) => run.patchDifferent(car.id, item.id, p)}
                />
              ))}
            </div>
        </>
      ) : (
        <>
          <h3 className="text-h4 font-bold text-ink">Walk-around done</h3>
          <p className="mt-0.5 text-sm text-muted">Tap an area to change it.</p>
          <div className="mt-3 space-y-1.5">
            {AREAS.map((a, i) => {
              const areaDiffs = diffs.filter((d) => d.item.area === a.id);
              const done = resolved(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`flex w-full items-center gap-3 rounded-card border px-4 py-2 text-left ${
                    areaDiffs.length ? "border-warning bg-nudge" : "border-line bg-white"
                  }`}
                >
                  {areaDiffs.length ? (
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-warning text-sm font-bold text-ink">!</span>
                  ) : done ? (
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-white">
                      <Icon name="check" className="size-4" />
                    </span>
                  ) : (
                    <span className="size-7 shrink-0 rounded-full border border-dashed border-subtle" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium text-ink">{a.label}</span>
                    <span className="block text-sm text-muted">
                      {areaDiffs.length
                        ? areaDiffs
                            .map((d) => `${d.finding} ${d.adjustment ? `−${money(-d.adjustment)}` : ""}`.trim())
                            .join(" · ")
                        : !done
                          ? "Not checked yet"
                          : a.id === "identity"
                            ? "Matches declared · 2 photos"
                            : "All matches declared"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {notReady && (
        <NotReadyC2
          car={car}
          onClose={() => setNotReady(false)}
          onPick={(r) => run.notReady(car.id, r)}
        />
      )}
    </Screen>
  );
}
