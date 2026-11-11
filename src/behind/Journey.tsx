import { JOURNEY_FORK, JOURNEY_MAIN, type JourneyStep, type JourneyStepId } from '../domain/journey';
import { MODULES, persona, type PersonaId } from '../domain/personas';
import { CenteredPage, Connector, FlowNode, VArrow, type NodeShape } from './flow';
import { Icon, type IconName } from './icons';
import { MODULE_ICON } from './moduleIcons';

const ICONS: Record<JourneyStepId, IconName> = {
  offer: 'tag',
  accepted: 'thumbsUp',
  pickup: 'calendar',
  inspection: 'clipboard',
  paid: 'paid',
  reprice: 'pencil',
  director: 'person',
};

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

interface Props {
  shape?: NodeShape;
  /** Called with the step owner when a step is clicked (the shell switches to that person). */
  onPick?: (id: PersonaId) => void;
}

/** The car journey as one row of steps, with a single fork for the mismatch case. */
export function JourneyDiagram({ shape = 'circle', onPick }: Props) {
  const node = (s: JourneyStep, size: 'lg' | 'sm' = 'lg') => (
    <FlowNode
      icon={ICONS[s.id]}
      label={s.title}
      sub={s.detail}
      shape={shape}
      size={size}
      foot={<ModuleChip owner={s.owner} />}
      onClick={onPick ? () => onPick(s.owner) : undefined}
      title={`Happens in ${MODULES[persona(s.owner).module].label}${onPick ? ': open that screen' : ''}`}
    />
  );
  const [offer, accepted, pickup, inspection, paid] = JOURNEY_MAIN;
  const [reprice, director] = JOURNEY_FORK;

  return (
    <div className="pb-2">
      <div className="mx-auto grid w-full max-w-[920px] grid-cols-[104px_1fr_104px_1fr_104px_1fr_104px_1fr_104px] justify-items-center lg:grid-cols-[132px_1fr_132px_1fr_132px_1fr_132px_1fr_132px]">
        {node(offer)}
        <Connector />
        {node(accepted)}
        <Connector />
        {node(pickup)}
        <Connector />
        {node(inspection)}
        <Connector label="Matches" />
        {node(paid)}

        <div className="col-start-7 mt-3">
          <VArrow dir="down" label="Doesn’t match" />
        </div>
        <div className="col-start-9 mt-3">
          <VArrow dir="up" label="Accepts" />
        </div>

        <div className="col-start-7 mt-2">{node(reprice, 'sm')}</div>
        <div className="col-start-8 mt-2 w-full">
          <Connector size="sm" arrow />
        </div>
        <div className="col-start-9 mt-2">{node(director, 'sm')}</div>
      </div>
    </div>
  );
}

export function JourneyPage({ shape = 'circle', onPick }: Props) {
  return (
    <CenteredPage
      title="One car, start to finish"
      intro="From the dealer’s desk to payment. Each step happens on one screen; the inspection is the only place the path can fork."
    >
      <JourneyDiagram shape={shape} onPick={onPick} />
      <p className="mt-12 flex items-center justify-center gap-1.5 text-center text-base text-ink lg:mt-16">
        <span>
          <span className="font-bold">4 working screens, one per role.</span> Switch at the top right
        </span>
        <Icon name="arrowUpRight" className="size-4 shrink-0" />
      </p>
    </CenteredPage>
  );
}
