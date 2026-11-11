import { useState } from 'react';
import type { DocId } from './docs';
import { DocPanel } from './DocsViewer';
import { CenteredPage, Connector, FlowNode, type NodeTone } from './flow';
import type { IconName } from './icons';

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
      <h1 className="text-h3 font-bold text-ink">{step.label}</h1>
      <p className="mt-4 text-base leading-[28px] text-body">{lead}</p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-[28px] text-body marker:text-subtle">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      {step.state === 'next' && <p className="mt-6 text-sm text-muted">Coming next.</p>}
    </div>
  );
}

/** How the assignment was done: six steps in a row; clicking one opens its document below. */
export function ProcessPage({ initial = 'concept' }: { initial?: Selection }) {
  const [sel, setSel] = useState<Selection>(initial);
  const step = STEPS.find((s) => s.id === sel);

  return (
    <CenteredPage title="How this was made" intro="Research, then a written concept, then designs explored as variants before anything is built for real. Click a step to read its document.">
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-[920px] items-start">
          {STEPS.map((s, i) => (
            <div key={s.id} className="contents">
              {i > 0 && <Connector />}
              <FlowNode
                icon={s.icon}
                label={s.label}
                sub={STATE_LABEL[s.state]}
                tone={sel === s.id ? 'selected' : STATE_TONE[s.state]}
                onClick={() => setSel(s.id)}
                width="w-[104px]"
                className="shrink-0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => setSel('decisions')}
          className={`rounded-pill border px-4 py-1.5 text-sm font-medium ${sel === 'decisions' ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'}`}
        >
          Decisions log
        </button>
      </div>

      <div className="mx-auto mt-10 max-w-[880px] rounded-panel border border-line bg-white px-12 py-10">
        {sel === 'decisions' ? <DocPanel id="decisions" /> : step?.doc ? <DocPanel id={step.doc} /> : step && <Note step={step} />}
      </div>
    </CenteredPage>
  );
}
