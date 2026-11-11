import type { PersonaId } from '../domain/personas';

/** What the shell shows: the Behind-the-build area, or one person's module. */
export type View = 'behind' | PersonaId;
export type BehindTab = 'car-journey' | 'docs';
/** Back office's two tabs: Pickups (default, where every car is) and Overview (re-prices + results). */
export type BackOfficeTab = 'overview' | 'pickups';

/** Label of the documents tab (rendered by DocsViewer). Storybook titles can't import it, so
 *  `src/stories/behind/Docs.stories.tsx` and `.storybook/preview.tsx` repeat it as a literal. */
export const DOCS_TAB_LABEL = 'The thinking';

/** Tab label = Storybook title = page component (CarJourney, DocsViewer). */
export const BEHIND_TABS: { id: BehindTab; label: string }[] = [
  { id: 'car-journey', label: 'Car journey' },
  { id: 'docs', label: DOCS_TAB_LABEL },
];
