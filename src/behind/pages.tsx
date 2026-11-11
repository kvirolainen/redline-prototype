import { ArchitecturePage } from './Architecture';
import { DocsViewer } from './DocsViewer';
import { JourneyPage } from './Journey';
import { ProcessPage } from './Process';

import type { BehindPageId } from './pageList';

export { BEHIND_PAGES, type BehindPageId } from './pageList';

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
