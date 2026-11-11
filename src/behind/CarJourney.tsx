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

/** Dashed arc from the top of one node over to the top of the next-but-one, arrow head on the second.
 *  Spans node centre to node centre, so it stretches with the columns. */
function ForkArc({ path, exit }: { path: string; exit: string }) {
  return (
    <div className="flex w-full flex-col items-center px-[52px] lg:px-[66px]" aria-label={`${path}. ${exit}.`}>
      <p className="text-center text-caption leading-[17px] whitespace-nowrap text-ink">{path}</p>
      <p className="text-center text-caption leading-[17px] whitespace-nowrap text-muted">{exit}</p>
      <div className="relative mt-1.5 h-9 w-full lg:h-10" aria-hidden>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible text-subtle">
          <path d="M0 40C0 6 100 6 100 37" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg viewBox="0 0 10 8" className="absolute right-0 bottom-0 h-2 w-2.5 translate-x-1/2 text-subtle" fill="currentColor">
          <path d="M0 0h10L5 8z" />
        </svg>
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
