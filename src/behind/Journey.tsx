import { JOURNEY_FORK, JOURNEY_MAIN, type JourneyStep, type JourneyStepId } from '../domain/journey';
import { PERSONAS, persona, type PersonaId } from '../domain/personas';
import { Avatar } from './Avatar';
import { CenteredPage, Connector, FlowNode, VArrow, type NodeShape } from './flow';
import type { IconName } from './icons';

const ICONS: Record<JourneyStepId, IconName> = {
  offer: 'tag',
  accepted: 'thumbsUp',
  pickup: 'calendar',
  inspection: 'clipboard',
  paid: 'paid',
  reprice: 'pencil',
  director: 'person',
};

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
      badge={
        <span className="block rounded-full ring-2 ring-white">
          <Avatar id={s.owner} size="sm" />
        </span>
      }
      onClick={onPick ? () => onPick(s.owner) : undefined}
      title={`${persona(s.owner).name} owns this step${onPick ? ': see their screen' : ''}`}
    />
  );
  const [offer, accepted, pickup, inspection, paid] = JOURNEY_MAIN;
  const [reprice, director] = JOURNEY_FORK;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="mx-auto grid w-[920px] grid-cols-[132px_1fr_132px_1fr_132px_1fr_132px_1fr_132px] justify-items-center">
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

function People({ onPick }: { onPick?: (id: PersonaId) => void }) {
  return (
    <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3">
      {PERSONAS.map((p) => {
        const inner = (
          <>
            <Avatar id={p.id} size="sm" />
            <span className="font-medium text-ink">{p.name}</span>
            <span className="text-muted">{p.role}</span>
          </>
        );
        return onPick ? (
          <button key={p.id} type="button" onClick={() => onPick(p.id)} className="flex items-center gap-2 text-sm hover:underline">
            {inner}
          </button>
        ) : (
          <span key={p.id} className="flex items-center gap-2 text-sm">
            {inner}
          </span>
        );
      })}
    </div>
  );
}

export function JourneyPage({ shape = 'circle', onPick }: Props) {
  return (
    <CenteredPage
      title="One car, start to finish"
      intro="From the dealer’s desk to payment. Each step has one owner; the inspection is the only place the path can fork."
      hint={onPick ? 'Pick a person at the top right to see their screen, or click a step.' : undefined}
    >
      <JourneyDiagram shape={shape} onPick={onPick} />
      <People onPick={onPick} />
    </CenteredPage>
  );
}
