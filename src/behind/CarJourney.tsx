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

export type ForkStyle = 'arc' | 'bypass';

const ARROW_DOWN = (
  <svg viewBox="0 0 10 8" className="absolute right-0 bottom-0 h-2 w-2.5 translate-x-1/2 text-subtle" fill="currentColor" aria-hidden>
    <path d="M0 0h10L5 8z" />
  </svg>
);

/** Small node on the detour: the re-price step. */
const ForkNode = ({ small, className = '' }: { small?: boolean; className?: string }) => (
  <span className={`grid place-items-center rounded-full border bg-white ${small ? 'size-6 border-line-light text-muted' : 'size-8 border-line text-ink'} ${className}`}>
    <Icon name="pencil" className={small ? 'size-3' : 'size-4'} />
  </span>
);

/** The detour for a car that doesn't match: leaves the top of Inspection, passes a small re-price node and lands on
 *  Paid when the director accepts. Spans node centre to node centre, so it stretches with the columns.
 *  'arc': smooth curve, the node at its top, what happens there written above it.
 *  'bypass': square track with rounded corners, the node on the track, what happens there inside the loop. */
function ForkArc({ up, step, down, exit, style }: { up: string; step: string; down: string; exit: string; style: ForkStyle }) {
  const dash = 'border-dashed border-subtle';
  const side = 'absolute text-caption whitespace-nowrap text-muted';
  if (style === 'arc') {
    return (
      <div className="flex w-full flex-col items-center px-[52px] lg:px-[66px]">
        <p className="text-center text-caption leading-[17px] whitespace-nowrap text-muted">
          {step}
          <br />
          <span className="text-subtle">{exit}</span>
        </p>
        <ForkNode small className="relative z-10 mt-1.5" />
        <div className="relative -mt-3 h-11 w-full lg:h-12">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible text-subtle" aria-hidden>
            <path d="M0 40C0 12 22 0 50 0C78 0 100 12 100 37" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          </svg>
          {ARROW_DOWN}
          <span className={`${side} top-1/2 right-full mr-2 text-subtle!`}>{up}</span>
          <span className={`${side} top-1/2 left-full ml-2 text-subtle!`}>{down}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full px-[52px] lg:px-[66px]">
      <div className="relative h-[84px] w-full">
        <span className={`absolute top-5 bottom-0 left-0 w-5 rounded-tl-xl border-t border-l ${dash}`} aria-hidden />
        <span className={`absolute top-5 right-0 bottom-0 w-5 rounded-tr-xl border-t border-r ${dash}`} aria-hidden />
        {ARROW_DOWN}
        <span className={`absolute top-5 right-[calc(50%+16px)] left-5 border-t ${dash}`} aria-hidden />
        <span className={`absolute top-5 right-5 left-[calc(50%+16px)] border-t ${dash}`} aria-hidden />
        <span className={`${side} top-1/2 right-full mr-2`}>{up}</span>
        <span className={`${side} top-1/2 left-full ml-2`}>{down}</span>
        <ForkNode className="absolute top-5 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <span className="absolute top-[42px] left-1/2 -translate-x-1/2 text-center text-caption leading-[17px] whitespace-nowrap">
          <span className="block font-medium text-ink">{step}</span>
          <span className="block text-muted">{exit}</span>
        </span>
      </div>
    </div>
  );
}

interface Props {
  shape?: NodeShape;
  /** How the mismatch detour is drawn (two options while choosing). */
  fork?: ForkStyle;
  /** Called with the step owner when a step is clicked (the shell switches to that person). */
  onPick?: (id: PersonaId) => void;
}

/** The car journey as one row of steps. The mismatch case is an arc over inspection → paid, not a second row. */
export function JourneyDiagram({ shape = 'circle', fork = 'arc', onPick }: Props) {
  const node = (s: JourneyStep) => (
    <FlowNode
      icon={ICONS[s.id]}
      label={s.title}
      sub={<span className="whitespace-nowrap">{s.detail}</span>}
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
          <ForkArc {...JOURNEY_MISMATCH} style={fork} />
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
export function CarJourney({ shape = 'circle', fork, onPick }: Props) {
  return (
    <CenteredPage
      title="One car, start to finish"
      intro="From the dealer’s desk to payment. Each step happens on one of four screens; the inspection is the only place the path can fork."
    >
      {/* Extra air between the intro and the diagram (the fork arc sits close under the intro otherwise). */}
      <div className="mt-10 lg:mt-20">
        <JourneyDiagram shape={shape} fork={fork} onPick={onPick} />
      </div>
    </CenteredPage>
  );
}
