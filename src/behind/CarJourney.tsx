import { JOURNEY_MAIN, JOURNEY_MISMATCH, type JourneyStep, type JourneyStepId } from '../domain/journey';
import { MODULES, persona, type PersonaId } from '../domain/personas';
import { CenteredPage, Connector, FlowNode, type NodeShape } from './flow';
import { Icon, type IconName } from './icons';
import { MODULE_ICON } from './moduleIcons';

const ICONS: Record<JourneyStepId, IconName> = {
  offer: 'tag',
  accepted: 'thumbsUp',
  pickup: 'calendar',
  inspection: 'clipboard',
  paid: 'paid',
};

// Node, connector, node… The arc row above uses the same columns so it lines up with the nodes.
const COLUMNS =
  'mx-auto grid w-full max-w-[920px] grid-cols-[104px_1fr_104px_1fr_104px_1fr_104px_1fr_104px] justify-items-center lg:grid-cols-[132px_1fr_132px_1fr_132px_1fr_132px_1fr_132px]';

/** The module (screen) where a step happens: small icon + module name. */
function ModuleChip({ owner }: { owner: PersonaId }) {
  const m = persona(owner).module;
  return (
    <span className="inline-flex items-center gap-1 rounded-pill border border-line bg-white px-2 py-0.5 text-caption font-medium whitespace-nowrap text-ink">
      <Icon name={MODULE_ICON[m]} className="size-3.5 text-muted" />
      {MODULES[m].label}
    </span>
  );
}

/** The detour for a car that doesn't match: a dashed arc leaves the top of Inspection, passes through the re-price
 *  step (a pill at the top of the arc) and lands on Paid when the director accepts. A decline leaves the pill upward
 *  and ends the journey. Spans node centre to node centre, so it stretches with the columns. */
function ForkArc({ up, step, down, exit }: { up: string; step: string; down: string; exit: string }) {
  return (
    <div className="flex w-full flex-col items-center px-[52px] lg:px-[66px]">
      <p className="flex items-center gap-1 text-caption whitespace-nowrap text-muted">
        <Icon name="close" className="size-3" />
        {exit}
      </p>
      <span className="h-3 border-l border-dashed border-subtle" aria-hidden />
      <span className="inline-flex items-center gap-1.5 rounded-pill border border-subtle bg-white px-3 py-1 text-caption font-medium whitespace-nowrap text-ink">
        <Icon name="pencil" className="size-3.5 text-muted" />
        {step}
      </span>
      <div className="relative h-9 w-full lg:h-10">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible text-subtle" aria-hidden>
          <path d="M0 40C0 12 25 0 50 0C75 0 100 12 100 37" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg viewBox="0 0 10 8" className="absolute right-0 bottom-0 h-2 w-2.5 translate-x-1/2 text-subtle" fill="currentColor" aria-hidden>
          <path d="M0 0h10L5 8z" />
        </svg>
        <span className="absolute top-1/2 right-full mr-2 -translate-y-1/2 text-caption whitespace-nowrap text-muted">{up}</span>
        <span className="absolute top-1/2 left-full ml-2 -translate-y-1/2 text-caption whitespace-nowrap text-muted">{down}</span>
      </div>
    </div>
  );
}

interface Props {
  shape?: NodeShape;
  /** Called with the step owner when a step is clicked (the shell switches to that person). */
  onPick?: (id: PersonaId) => void;
}

/** The car journey as one row of steps. The mismatch case is an arc over inspection → paid, not a second row. */
export function JourneyDiagram({ shape = 'circle', onPick }: Props) {
  const node = (s: JourneyStep) => (
    <FlowNode
      icon={ICONS[s.id]}
      label={s.title}
      sub={s.detail}
      shape={shape}
      foot={<ModuleChip owner={s.owner} />}
      onClick={onPick ? () => onPick(s.owner) : undefined}
      title={`Happens in ${MODULES[persona(s.owner).module].label}${onPick ? ': open that screen' : ''}`}
      className="h-full"
    />
  );
  const [offer, accepted, pickup, inspection, paid] = JOURNEY_MAIN;

  return (
    <div className="pb-2">
      <div className={COLUMNS}>
        <div className="col-span-3 col-start-7 w-full">
          <ForkArc {...JOURNEY_MISMATCH} />
        </div>
      </div>
      <div className={COLUMNS}>
        {node(offer)}
        <Connector />
        {node(accepted)}
        <Connector />
        {node(pickup)}
        <Connector />
        {node(inspection)}
        <Connector label="Matches" />
        {node(paid)}
      </div>
    </div>
  );
}

/** Car journey: the Behind-the-build landing page. */
export function CarJourney({ shape = 'circle', onPick }: Props) {
  return (
    <CenteredPage
      title="One car, start to finish"
      intro="From the dealer’s desk to payment. Each step happens on one of four screens; the inspection is the only place the path can fork."
    >
      <JourneyDiagram shape={shape} onPick={onPick} />
    </CenteredPage>
  );
}
