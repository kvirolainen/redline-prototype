import { ArchitecturePage } from './Architecture';
import { DocsViewer } from './DocsViewer';
import { JourneyPage } from './Journey';
import { ProcessPage } from './Process';

export type BehindPageId = 'journey' | 'process' | 'architecture' | 'docs';

export const BEHIND_PAGES: { id: BehindPageId; label: string; hint: string }[] = [
  { id: 'journey', label: 'Car journey', hint: 'One car, who owns each step' },
  { id: 'process', label: 'Process', hint: 'How this was made' },
  { id: 'architecture', label: 'Architecture', hint: 'React + Convex, simplified' },
  { id: 'docs', label: 'Docs', hint: 'Concept, plan, decisions' },
];

export function BehindPage({ id }: { id: BehindPageId }) {
  switch (id) {
    case 'journey':
      return <JourneyPage />;
    case 'process':
      return <ProcessPage />;
    case 'architecture':
      return <ArchitecturePage />;
    case 'docs':
      return <DocsViewer />;
  }
}
