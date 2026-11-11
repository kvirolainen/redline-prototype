import { useState } from 'react';
import { DOCS, isEmptyDoc, type DocId } from './docs';
import { DocPanel } from './DocsViewer';
import { CenteredPage, Connector, FlowNode, type NodeTone } from './flow';
import { Icon, type IconName } from './icons';

type State = 'done' | 'now' | 'next';
export type ProcessStepId = 'research' | 'concept' | 'prototypes' | 'build-plan' | 'build' | 'test';
type Selection = ProcessStepId | 'decisions';

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
      <p className="text-base text-base leading-[28px] text-body">{lead}</p>
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
function DocAffordance({ doc, selected }: { doc: DocId; selected: boolean }) {
  const ready = !isEmptyDoc(docOf(doc).body);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-caption font-medium ${
        selected ? 'border-ink bg-ink text-white' : ready ? 'border-line bg-white text-ink group-hover:border-ink' : 'border-dashed border-subtle bg-white text-muted'
      }`}
    >
      <Icon name="doc" className="size-3.5" />
      {ready ? 'Read' : 'Soon'}
    </span>
  );
}

/** How the assignment was done: six steps in a row and the decisions log at the end. The selected step's
 *  document is open below. */
export function ProcessPage({ initial = 'concept' }: { initial?: Selection }) {
  const [sel, setSel] = useState<Selection>(initial);
  const step = STEPS.find((s) => s.id === sel);
  const heading = sel === 'decisions' ? 'Decisions log' : step!.doc ? `${step!.label} doc` : `${step!.label} notes`;
  const docId: DocId | undefined = sel === 'decisions' ? 'decisions' : step?.doc;

  return (
    <CenteredPage
      title="How this was made"
      intro="Research, then a written concept, then designs explored as variants before anything is built for real. Steps with a document say Read; the decisions log is at the end of the row."
    >
      <div className="mx-auto flex w-full max-w-[1000px] items-start">
        {STEPS.map((s, i) => (
          <div key={s.id} className="contents">
            {i > 0 && <Connector />}
            <FlowNode
              icon={s.icon}
              label={s.label}
              sub={STATE_LABEL[s.state]}
              tone={sel === s.id ? 'selected' : STATE_TONE[s.state]}
              foot={s.doc ? <DocAffordance doc={s.doc} selected={sel === s.id} /> : undefined}
              onClick={() => setSel(s.id)}
              title={s.doc ? `Read the ${s.label.toLowerCase()} doc` : `${s.label} notes`}
              width="w-[84px] lg:w-[100px]"
              className="shrink-0"
            />
          </div>
        ))}
        {/* The decisions log: kept in the row, set apart by a gap and a vertical rule, and drawn as a tile. */}
        <div className="mx-3 h-14 w-px shrink-0 bg-line lg:mx-6 lg:h-20" aria-hidden />
        <FlowNode
          shape="tile"
          icon="list"
          label="Decisions"
          sub="Running log"
          tone={sel === 'decisions' ? 'selected' : 'default'}
          foot={<DocAffordance doc="decisions" selected={sel === 'decisions'} />}
          onClick={() => setSel('decisions')}
          title="Read the decisions log"
          width="w-[84px] lg:w-[100px]"
          className="shrink-0"
        />
      </div>

      <section className="mx-auto mt-10 max-w-[880px] rounded-panel border border-line bg-white" aria-label={heading}>
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-6 py-4 lg:px-12">
          <h2 className="text-title font-bold text-ink">{heading}</h2>
          {docId && <span className="font-mono text-caption text-subtle">docs/{docOf(docId).file}</span>}
        </header>
        <div className="px-6 py-8 lg:px-12 lg:py-10">{docId ? <DocPanel id={docId} showPath={false} /> : step && <Note step={step} />}</div>
      </section>
    </CenteredPage>
  );
}
