import concept from '../../docs/01-concept.md?raw';
import deskOrOnline from '../../docs/02-desk-or-online.md?raw';
import theApp from '../../docs/03-the-app.md?raw';
import clutchsLook from '../../docs/04-clutchs-look.md?raw';
import prototypes from '../../docs/05-prototypes.md?raw';
import architecture from '../../docs/06-architecture.md?raw';
import buildPlan from '../../docs/07-build-plan.md?raw';
import testReport from '../../docs/08-test-report.md?raw';
import dealerResearch from '../../docs/09-dealer-research.md?raw';
import decisions from '../../docs/decisions.md?raw';

export type DocId =
  | 'concept'
  | 'desk-or-online'
  | 'the-app'
  | 'clutchs-look'
  | 'prototypes'
  | 'architecture'
  | 'build-plan'
  | 'test-report'
  | 'dealer-research'
  | 'decisions';

export interface Doc {
  id: DocId;
  label: string;
  file: string;
  body: string;
  /** Position in the process; the decisions log has none and sits at the end as an appendix. */
  n?: number;
}

/** The documents in reading order. The list is the process: each one is written at its step. */
export const DOCS: Doc[] = [
  { id: 'concept', n: 1, label: 'Concept', file: '01-concept.md', body: concept },
  { id: 'desk-or-online', n: 2, label: 'Desk or online?', file: '02-desk-or-online.md', body: deskOrOnline },
  { id: 'the-app', n: 3, label: 'The app', file: '03-the-app.md', body: theApp },
  { id: 'clutchs-look', n: 4, label: 'Clutch’s look', file: '04-clutchs-look.md', body: clutchsLook },
  { id: 'prototypes', n: 5, label: 'Prototypes', file: '05-prototypes.md', body: prototypes },
  { id: 'architecture', n: 6, label: 'Architecture', file: '06-architecture.md', body: architecture },
  { id: 'build-plan', n: 7, label: 'Build plan', file: '07-build-plan.md', body: buildPlan },
  { id: 'test-report', n: 8, label: 'Test report', file: '08-test-report.md', body: testReport },
  { id: 'dealer-research', n: 9, label: 'Dealer research', file: '09-dealer-research.md', body: dealerResearch },
  { id: 'decisions', label: 'Decisions log', file: 'decisions.md', body: decisions },
];

/** A doc is "empty" until it has more than its title and a placeholder line. */
export const isEmptyDoc = (md: string) => md.replace(/^#.*$/m, '').replace(/_To be written\._/g, '').trim().length === 0;
