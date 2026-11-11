import type { PersonaId } from '../domain/personas';

/** What the shell shows: the Behind-the-build area, or one person's module. */
export type View = 'behind' | PersonaId;
export type BehindTab = 'journey' | 'process' | 'architecture';

export const BEHIND_TABS: { id: BehindTab; label: string }[] = [
  { id: 'journey', label: 'Journey' },
  { id: 'process', label: 'Process' },
  { id: 'architecture', label: 'Architecture' },
];
