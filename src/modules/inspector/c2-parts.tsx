import { useState, type ReactNode } from 'react';
import { OptionCard } from '../../components/ui/OptionCard';
import { money } from '../../domain/format';
import { useC2Demo } from './c2-demo';
import { DifferenceEditor } from './DifferenceEditor';
import { photoFor } from '../../domain/photos';
import { useInspectorEnv } from './env';
import { declaredFor, type CheckItem, type InspectionCar } from './fixtures';
import { BigButton, DifferenceList, Icon, PriceChange, Sheet } from './parts';
import type { Answer, Difference, Outcome } from './useRun';
import { isAccepted, leaveLabel, leaveMin, minutesLabel, shortCar, shortDealer } from './c2-model';

/** The slim line about a car that's out of Sam's hands: waiting on Dave, or Dave just answered. */
export function WaitStrip({
  car,
  outcome,
  waited,
  pastLeave,
  onOpen,
}: {
  car: InspectionCar;
  outcome: Outcome;
  waited: number | undefined;
  pastLeave: boolean;
  onOpen: () => void;
}) {
  const env = useInspectorEnv();
  const stop = env.stopOf(car);
  const director = env.directorOf(car);
  const name = shortCar(car);
  let tone: 'dark' | 'attention' | 'plain' = 'plain';
  let text: ReactNode;
  let icon: 'clock' | 'truck' | 'alert' = 'clock';

  if (isAccepted(outcome) && outcome.kind === 'confirmed' && outcome.accepted) {
    tone = 'dark';
    icon = 'truck';
    text = (
      <>
        {director} accepted {money(outcome.accepted.to)} · <span className="font-bold">load the {name}</span>
      </>
    );
  } else if (outcome.kind === 'reprice' && outcome.declined) {
    tone = 'attention';
    icon = 'alert';
    text = (
      <>
        {director} declined · <span className="font-bold">leave the {name} at {shortDealer(stop)}</span>
      </>
    );
  } else if (pastLeave) {
    tone = 'attention';
    icon = 'alert';
    text = (
      <>
        {name} · no answer from {director} · <span className="font-bold">leave without it</span>
      </>
    );
  } else {
    text = (
      <>
        <span className="font-bold">{name}</span> · waiting on {director}
        {waited !== undefined && <> · {minutesLabel(waited)}</>} · truck leaves {leaveLabel(stop)}
      </>
    );
  }

  const styles = {
    dark: 'border-ink bg-ink text-white',
    attention: 'border-warning bg-nudge text-ink',
    plain: 'border-line bg-white text-ink',
  }[tone];

  return (
    <button type="button" onClick={onOpen} className={`flex min-h-12 w-full items-center gap-3 rounded-card border px-3 py-2 text-left text-sm ${styles}`}>
      <Icon name={icon} className="size-5 shrink-0" />
      <span className="min-w-0 flex-1">{text}</span>
      <Icon name="chevron" className="size-4 shrink-0 opacity-60" />
    </button>
  );
}

/** Quiet links that stand in for Dave and the clock in Storybook. Hidden in the app. */
export function DemoDave({ carId, leaveAt }: { carId: string; leaveAt: number }) {
  const demo = useC2Demo();
  if (!demo) return null;
  const link = 'text-caption font-medium text-muted underline underline-offset-2 hover:text-ink';
  return (
    <div className="mt-8 border-t border-dashed border-line pt-3 text-center">
      <p className="text-caption text-subtle">Demo only: play what happens next</p>
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <button type="button" className={link} onClick={() => demo.answer(carId, true)}>
          Dave accepts
        </button>
        <button type="button" className={link} onClick={() => demo.answer(carId, false)}>
          Dave declines
        </button>
        <button type="button" className={link} onClick={() => demo.pass(5)}>
          5 min pass
        </button>
        <button type="button" className={link} onClick={() => demo.skipTo(leaveAt)}>
          No answer by leave time
        </button>
      </div>
    </div>
  );
}

/** One tap = one photo, as the camera would. VIN and odometer both need one before the area can match. */
export function IdentityPhotos({ odometer, vin, onTake }: { odometer: boolean; vin: boolean; onTake: (which: 'odometer' | 'vin') => void }) {
  const tile = (which: 'odometer' | 'vin', label: string, taken: boolean) => (
    <button
      type="button"
      onClick={() => !taken && onTake(which)}
      aria-pressed={taken}
      className={`flex h-16 items-center gap-2 rounded-card border px-3 text-left ${
        taken ? 'border-line bg-photo-bg text-warm-grey' : 'border-dashed border-subtle bg-white text-ink hover:border-ink'
      }`}
    >
      {taken ? (
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success text-white">
          <Icon name="check" className="size-4" />
        </span>
      ) : (
        <Icon name="camera" className="size-6 shrink-0" />
      )}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-caption text-muted">{taken ? 'Photo taken' : 'Tap to take'}</span>
      </span>
    </button>
  );
  return (
    <div className="grid grid-cols-2 gap-2">
      {tile('odometer', 'Odometer', odometer)}
      {tile('vin', 'VIN plate', vin)}
    </div>
  );
}

/** Inside an opened area, an item that isn't different: one line with what was declared and a way to mark it. */
export function DeclaredRow({ car, item, onDifferent }: { car: InspectionCar; item: CheckItem; onDifferent: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-muted">{item.question}</span>
        <span className="block text-base font-medium text-ink">{declaredFor(item, car)}</span>
      </span>
      <button type="button" onClick={onDifferent} className="h-10 shrink-0 rounded-pill border border-line px-4 text-sm font-bold text-ink hover:border-ink">
        Different
      </button>
    </div>
  );
}

/** Inside an opened area: what the dealer declared, big, then same / different, and the detail when it's different. */
export function DeclaredItem({
  car,
  item,
  answer,
  onSame,
  onDifferent,
  onClear,
  onPatch,
}: {
  car: InspectionCar;
  item: CheckItem;
  answer: Answer | undefined;
  onSame: () => void;
  onDifferent: () => void;
  onClear: () => void;
  onPatch: (p: Partial<{ finding: number; note: string; photos: number }>) => void;
}) {
  const env = useInspectorEnv();
  const different = answer?.result === 'different';
  const same = answer?.result === 'match';
  const pill = (on: boolean) =>
    `h-12 rounded-pill border text-sm font-bold ${on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'}`;
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted">{item.question}</p>
      <div className="rounded-card border border-line bg-canvas px-4 py-4">
        <p className="text-sm text-muted">{env.stopOf(car).dealer} declared</p>
        <p className="mt-1 text-h4 font-bold text-ink">{declaredFor(item, car)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={same} className={pill(same)} onClick={() => (same ? onClear() : onSame())}>
          Same
        </button>
        <button type="button" aria-pressed={different} className={pill(different)} onClick={() => (different ? onClear() : onDifferent())}>
          Different
        </button>
      </div>
      {answer?.result === 'different' && <DifferenceEditor item={item} answer={answer} onChange={onPatch} />}
    </div>
  );
}

const REASONS = ['Second key missing', 'Car not on the lot', 'Out on a test drive', 'Customer still has it'];

/** "Not ready" from the car header: one reason, then the car moves to the dealer's next pickup day. */
export function NotReadyC2({ car, onPick, onClose }: { car: InspectionCar; onPick: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState<string>();
  const env = useInspectorEnv();
  const next = env.nextRunOf(car);
  return (
    <Sheet title={`${shortCar(car)} not ready?`} onClose={onClose}>
      <p className="-mt-2 mb-4 text-sm text-muted">
        It moves to {env.stopOf(car).dealer}'s next pickup, {next}. {env.stopOf(car).contact.split(',')[0]} is told right away.
      </p>
      <div className="space-y-2">
        {REASONS.map((r) => (
          <OptionCard key={r} title={r} selected={reason === r} onClick={() => setReason(r)} />
        ))}
      </div>
      <BigButton className="mt-5" disabled={!reason} onClick={() => reason && onPick(reason)}>
        Moves to {next}
      </BigButton>
    </Sheet>
  );
}

/** What the car screen shows once Sam has decided, including the wait on Dave and his answer. */
export function OutcomeC2({
  car,
  outcome,
  diffs,
  waited,
  pastLeave,
  nextLabel,
  onLoad,
  onNext,
  onLeave,
  onUndo,
}: {
  car: InspectionCar;
  outcome: Outcome;
  diffs: Difference[];
  waited: number | undefined;
  pastLeave: boolean;
  nextLabel: string;
  onLoad: () => void;
  onNext: () => void;
  onLeave: () => void;
  onUndo: () => void;
}) {
  const env = useInspectorEnv();
  const stop = env.stopOf(car);
  const dealer = stop.dealer;
  const director = env.directorOf(car);
  const truck = env.run.truck;
  const name = shortCar(car);
  let mark: ReactNode;
  let title: string;
  let lead: ReactNode = null;
  let body: ReactNode = null;
  let action: ReactNode = <BigButton onClick={onNext}>{nextLabel}</BigButton>;
  let demo: ReactNode = null;

  if (outcome.kind === 'confirmed' && outcome.accepted && !outcome.loaded) {
    mark = <Mark tone="done" icon="check" />;
    title = `${director} accepted ${money(outcome.accepted.to)}`;
    lead = `Load the ${name} on ${truck}`;
    body = (
      <p>
        Down from {money(outcome.accepted.from)}. {dealer} is paid the new price.
      </p>
    );
    action = (
      <BigButton onClick={onLoad}>
        <Icon name="truck" /> Loaded on the truck
      </BigButton>
    );
  } else if (outcome.kind === 'confirmed' && !outcome.loaded) {
    mark = <Mark tone="done" icon="check" />;
    title = `Confirmed at ${money(car.offer)}`;
    body = <p>Matches what {dealer} declared. Load it on {truck}.</p>;
    action = (
      <BigButton onClick={onLoad}>
        <Icon name="truck" /> Loaded on the truck
      </BigButton>
    );
  } else if (outcome.kind === 'confirmed') {
    mark = <Mark tone="done" icon="truck" />;
    title = `${name} is on ${truck}`;
    body = (
      <p>
        Picked up. {dealer} is paid {money(car.offer)} within 2 business days.
      </p>
    );
  } else if (outcome.kind === 'reprice') {
    const rows = diffs.length
      ? diffs
      : (outcome.sent ?? []).map((s) => ({ item: { id: s.label }, declared: s.declared, finding: s.found, note: '', adjustment: s.amount, photos: s.photos }));
    const summary = (
      <div className="mt-5 text-left">
        <PriceChange from={outcome.from} to={outcome.to} />
        {rows.length > 0 && (
          <div className="mt-3">
            <DifferenceList diffs={rows} />
          </div>
        )}
      </div>
    );
    if (outcome.declined) {
      mark = <Mark tone="attention" icon="alert" />;
      title = `${director} declined`;
      lead = `Leave the ${name} at ${shortDealer(stop)}`;
      body = <p>The car stays with {dealer}. Nothing to load.</p>;
    } else if (pastLeave) {
      mark = <Mark tone="attention" icon="alert" />;
      title = `No answer from ${director}`;
      lead = 'Leave without it';
      body = (
        <>
          <p>
            It's {leaveLabel(stop)}, time to go. The {name} joins next week's run, {env.nextRunOf(car)}, and the re-price is withdrawn.
          </p>
          {summary}
        </>
      );
      action = <BigButton onClick={onLeave}>Leave without it</BigButton>;
    } else {
      mark = <Mark tone="attention" icon="clock" />;
      title = `Waiting on ${director}`;
      lead = waited !== undefined ? `Sent ${waited < 1 ? 'just now' : `${waited} min ago`}` : 'Re-price sent';
      body = (
        <>
          <p>
            {director} accepts or declines on their screen. Leave the {name} parked and do the next car. The truck leaves at {leaveLabel(stop)}.
          </p>
          {summary}
        </>
      );
      demo = <DemoDave carId={car.id} leaveAt={leaveMin(stop)} />;
    }
  } else {
    mark = <Mark tone="attention" icon="key" />;
    title = `Moves to ${outcome.next}`;
    body = (
      <p>
        {outcome.reason}. {dealer} is told, and the {name} joins their next pickup day.
      </p>
    );
  }

  return (
    <div className="flex min-h-[calc(var(--phone-h,100vh)-106px)] flex-col">
      <div className="flex-1 pt-6 text-center">
        {mark}
        <p className="mt-5 text-h4 font-bold text-ink">{title}</p>
        {lead && <p className="mt-1 text-title font-bold text-ink">{lead}</p>}
        <p className="mt-1 text-sm text-muted">{car.car}</p>
        <div className="mt-4 text-base text-body">{body}</div>
      </div>
      <div className="mt-8 space-y-2">
        {action}
        <button type="button" onClick={onUndo} className="h-12 w-full text-sm font-medium text-muted hover:text-ink">
          Undo and inspect again
        </button>
      </div>
      {demo}
    </div>
  );
}

function Mark({ tone, icon }: { tone: 'done' | 'attention'; icon: 'check' | 'truck' | 'alert' | 'clock' | 'key' }) {
  return (
    <span className={`mx-auto grid size-16 place-items-center rounded-full ${tone === 'done' ? 'bg-success text-white' : 'bg-nudge text-ink'}`}>
      <Icon name={icon} className="size-8" />
    </span>
  );
}

/** One line of an area's checklist, compact enough that a whole area fits the phone screen: what the dealer declared
 *  and Same / Different; once different, the findings as chips, a one-line note and small photo tiles. */
export function CompactItem({
  car,
  item,
  answer,
  onDifferent,
  onSame,
  onClear,
  onPatch,
}: {
  car: InspectionCar;
  item: CheckItem;
  answer: Answer | undefined;
  onDifferent: () => void;
  onSame: () => void;
  onClear: () => void;
  onPatch: (p: Partial<{ finding: number; note: string; photos: number }>) => void;
}) {
  const diff = answer?.result === 'different' ? answer : undefined;
  const same = answer?.result === 'match';
  const src = photoFor(item.question);
  return (
    <div className={`px-3.5 py-2.5 ${diff ? 'bg-nudge' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="block text-caption text-muted">{item.question}</span>
          <span className="block text-sm leading-snug font-medium text-ink">{declaredFor(item, car)}</span>
        </span>
        {/* A checklist: every item gets its own answer, same weight both ways, so nothing is ticked by default. */}
        <span className="flex shrink-0 gap-1.5">
          <button
            type="button"
            aria-pressed={same}
            onClick={same ? onClear : onSame}
            className={`inline-flex h-8 items-center gap-1 rounded-pill border px-2.5 text-caption font-bold ${same ? 'border-success bg-success text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
          >
            <Icon name="check" className="size-3.5" /> Same
          </button>
          <button
            type="button"
            aria-pressed={!!diff}
            onClick={diff ? onClear : onDifferent}
            className={`h-8 rounded-pill border px-2.5 text-caption font-bold ${diff ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
          >
            Different
          </button>
        </span>
      </div>
      {diff && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {item.findings.map((f, i) => {
              const on = diff.finding === i;
              return (
                <button
                  key={f.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPatch({ finding: i })}
                  className={`h-8 rounded-pill border px-2.5 text-caption ${on ? 'border-ink bg-ink font-medium text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
                >
                  {f.label}
                  <span className={on ? 'text-white/70' : 'text-muted'}> {f.adjustment === 0 ? '· call ops' : `−${money(-f.adjustment)}`}</span>
                </button>
              );
            })}
          </div>
          <input
            value={diff.note}
            onChange={(e) => onPatch({ note: e.target.value })}
            placeholder="Note for the dealer: where and how big"
            className="h-9 w-full rounded-card border border-line-light bg-white px-3 text-sm text-ink outline-none placeholder:text-subtle hover:border-body focus:border-ink"
          />
          <div className="flex items-center gap-1.5">
            {Array.from({ length: diff.photos }, (_, i) =>
              src ? (
                <img key={i} src={src} alt={`${item.question} ${i + 1}`} className="h-10 w-14 rounded-card border border-line object-cover" />
              ) : (
                <span key={i} className="grid h-10 w-14 place-items-center rounded-card border border-line bg-photo-bg text-warm-grey">
                  <Icon name="camera" className="size-4" />
                </span>
              ),
            )}
            <button
              type="button"
              onClick={() => onPatch({ photos: diff.photos + 1 })}
              className="inline-flex h-10 items-center gap-1.5 rounded-card border border-dashed border-subtle bg-white px-3 text-caption font-medium text-ink hover:border-ink"
            >
              <Icon name="camera" className="size-4" /> {diff.photos ? 'Add' : 'Take photo'}
            </button>
            {diff.photos === 0 && <span className="text-caption font-medium text-error">Needed</span>}
          </div>
        </div>
      )}
    </div>
  );
}
