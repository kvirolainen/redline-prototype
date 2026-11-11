import { useState } from 'react';
import { DOCS, isEmptyDoc, type DocId } from './docs';
import { CenteredPage, Connector, FlowNode, type NodeTone } from './flow';
import { Icon, type IconName } from './icons';

type State = 'done' | 'now' | 'next';
export type ProcessStepId = 'research' | 'concept' | 'prototypes' | 'build-plan' | 'build' | 'test';
/** Steps without a document; their note shows below the row. */
export type NoteStepId = 'research' | 'build';

interface Step {
  id: ProcessStepId;
  label: string;
  icon: IconName;
  state: State;
  doc?: DocId;
  /** Shown instead of a document for steps that don't produce one. */
  note?: { lead: string; points: string[] };
}

const STEPS: Step[] = [
  {
    id: 'research',
    label: 'Research',
    icon: 'search',
    state: 'done',
    note: {
      lead: 'Before writing anything: who is involved, what they need, and how Clutch already looks and talks.',
      points: [
        'A whiteboard session on the business case and the four people who touch one car.',
        'A pass through Clutch’s public site and its sell flow on a tablet, captured as style notes and screenshots.',
        'Open questions carried into the concept doc.',
      ],
    },
  },
  { id: 'concept', label: 'Concept', icon: 'doc', state: 'done', doc: 'concept' },
  { id: 'prototypes', label: 'Prototypes', icon: 'layers', state: 'now', doc: 'prototypes' },
  { id: 'build-plan', label: 'Build plan', icon: 'map', state: 'next', doc: 'build-plan' },
  {
    id: 'build',
    label: 'Build',
    icon: 'code',
    state: 'next',
    note: {
      lead: 'One working slice at a time on the live backend, in demo order.',
      points: ['Offer and pickup day', 'Inspection and re-price', 'Director approval', 'Ops board'],
    },
  },
  { id: 'test', label: 'Test', icon: 'check', state: 'next', doc: 'test-report' },
];

const STATE_LABEL: Record<State, string> = { done: 'Done', now: 'Now', next: 'Next' };
const STATE_TONE: Record<State, NodeTone> = { done: 'default', now: 'current', next: 'upcoming' };

function Note({ step }: { step: Step }) {
  const { lead, points } = step.note!;
  return (
    <div className="max-w-[720px]">
      <p className="text-base leading-[28px] text-body">{lead}</p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-[28px] text-body marker:text-subtle">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      {step.state === 'next' && <p className="mt-6 text-sm text-muted">Coming next.</p>}
    </div>
  );
}

const docOf = (id: DocId) => DOCS.find((d) => d.id === id)!;

/** Under each step that has a document: a doc icon and "Read" (or "Soon" while the doc is still empty). */
function DocAffordance({ doc }: { doc: DocId }) {
  const ready = !isEmptyDoc(docOf(doc).body);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-caption font-medium ${
        ready ? 'border-line bg-white text-ink group-hover:border-ink' : 'border-dashed border-subtle bg-white text-muted'
      }`}
    >
      <Icon name="doc" className="size-3.5" />
      {ready ? 'Read' : 'Soon'}
    </span>
  );
}

/** Process: how the assignment was done, six steps in a row. A step with a document has a "Read" chip that
 *  opens it in the Docs tab (`onOpenDoc`); a step without one shows its short note below the row. */
export function Process({ initial = 'research', onOpenDoc }: { initial?: NoteStepId; onOpenDoc?: (id: DocId) => void }) {
  const [sel, setSel] = useState<NoteStepId>(initial);
  const step = STEPS.find((s) => s.id === sel)!;

  return (
    <CenteredPage
      title="How this was made"
      intro="Research, then a written concept, then designs explored as variants before anything is built for real. Steps with a document say Read and open it in Docs."
    >
      <div className="mx-auto flex w-full max-w-[880px] items-start">
        {STEPS.map((s, i) => (
          <div key={s.id} className="contents">
            {i > 0 && <Connector />}
            <FlowNode
              icon={s.icon}
              label={s.label}
              sub={STATE_LABEL[s.state]}
              tone={!s.doc && sel === s.id ? 'selected' : STATE_TONE[s.state]}
              foot={s.doc ? <DocAffordance doc={s.doc} /> : undefined}
              onClick={() => (s.doc ? onOpenDoc?.(s.doc) : setSel(s.id as NoteStepId))}
              title={s.doc ? `Read the ${s.label.toLowerCase()} doc in Docs` : `${s.label} notes`}
              width="w-[84px] lg:w-[100px]"
              className="shrink-0"
            />
          </div>
        ))}
      </div>

      <section className="mx-auto mt-10 max-w-[880px] rounded-panel border border-line bg-white" aria-label={`${step.label} notes`}>
        <header className="border-b border-line px-6 py-4 lg:px-12">
          <h2 className="text-title font-bold text-ink">{step.label} notes</h2>
        </header>
        <div className="px-6 py-8 lg:px-12 lg:py-10">
          <Note step={step} />
        </div>
      </section>
    </CenteredPage>
  );
}
