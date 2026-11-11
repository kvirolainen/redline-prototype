import type { PersonaId } from '../domain/personas';

/** What the shell shows: the Behind-the-build area, or one person's module. */
export type View = 'behind' | PersonaId;
export type BehindTab = 'car-journey' | 'process' | 'architecture' | 'docs';

/** Tab label = Storybook title = page component (CarJourney, Process, Architecture, DocsViewer). */
export const BEHIND_TABS: { id: BehindTab; label: string }[] = [
  { id: 'car-journey', label: 'Car journey' },
  { id: 'process', label: 'Process' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'docs', label: 'Docs' },
];
