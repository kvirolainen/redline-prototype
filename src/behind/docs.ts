import concept from '../../docs/01-concept.md?raw';
import prototypes from '../../docs/02-prototypes.md?raw';
import buildPlan from '../../docs/03-build-plan.md?raw';
import testReport from '../../docs/04-test-report.md?raw';
import decisions from '../../docs/decisions.md?raw';

export type DocId = 'concept' | 'prototypes' | 'build-plan' | 'test-report' | 'decisions';

export const DOCS: { id: DocId; label: string; file: string; body: string }[] = [
  { id: 'concept', label: 'Concept', file: '01-concept.md', body: concept },
  { id: 'prototypes', label: 'Prototypes', file: '02-prototypes.md', body: prototypes },
  { id: 'build-plan', label: 'Build plan', file: '03-build-plan.md', body: buildPlan },
  { id: 'test-report', label: 'Test report', file: '04-test-report.md', body: testReport },
  { id: 'decisions', label: 'Decisions', file: 'decisions.md', body: decisions },
];

/** A doc is "empty" until it has more than its title and a placeholder line. */
export const isEmptyDoc = (md: string) => md.replace(/^#.*$/m, '').replace(/_To be written\._/g, '').trim().length === 0;
