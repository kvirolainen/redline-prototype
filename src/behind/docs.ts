import concept from '../../docs/01-concept.md?raw';
import deskOrOnline from '../../docs/02-desk-or-online.md?raw';
import theModules from '../../docs/03-the-modules.md?raw';
import architecture from '../../docs/04-architecture.md?raw';
import demo from '../../docs/demo.md?raw';
import process from '../../docs/process.md?raw';
import dealerResearch from '../../docs/dealer-research.md?raw';

export type DocId = 'concept' | 'desk-or-online' | 'modules' | 'architecture' | 'demo' | 'process' | 'dealer-research';

export interface Doc {
  id: DocId;
  label: string;
  file: string;
  body: string;
  /** Position in the main reading order. Docs without one sit below the line, under "More". */
  n?: number;
}

/** The documents in reading order: the four main ones, then the extras below the line. */
export const DOCS: Doc[] = [
  { id: 'concept', n: 1, label: 'Concept', file: '01-concept.md', body: concept },
  { id: 'desk-or-online', n: 2, label: 'Desk or online?', file: '02-desk-or-online.md', body: deskOrOnline },
  { id: 'modules', n: 3, label: 'The modules', file: '03-the-modules.md', body: theModules },
  { id: 'architecture', n: 4, label: 'Architecture', file: '04-architecture.md', body: architecture },
  { id: 'demo', label: 'Demo', file: 'demo.md', body: demo },
  { id: 'process', label: 'Process', file: 'process.md', body: process },
  { id: 'dealer-research', label: 'Dealer research', file: 'dealer-research.md', body: dealerResearch },
];

/** A doc is "empty" until it has more than its title and a placeholder line. */
export const isEmptyDoc = (md: string) => md.replace(/^#.*$/m, '').replace(/_To be written\._/g, '').trim().length === 0;
