import { DOCS, type DocId } from '../behind/docs';
import { PERSONAS, type PersonaId } from '../domain/personas';
import type { BackOfficeTab, BehindTab, View } from './views';

/** Where the shell is: which view, and on Behind the build which tab and document. */
export interface Route {
  view: View;
  tab: BehindTab;
  doc: DocId;
  /** Back office's tab: Pickups (default) or Overview. */
  office: BackOfficeTab;
}

export const HOME: Route = { view: 'behind', tab: 'car-journey', doc: 'concept', office: 'pickups' };

/** One path per screen, so a refresh or a shared link opens the same screen:
 *  `/` car journey · `/thinking/<doc>` a document · `/<module>` a person's module (`/trade-in`, `/inspector`, …),
 *  `/back-office/overview` Back office's second tab (Pickups is the default). */
export function toPath(r: Route): string {
  if (r.view !== 'behind') {
    const module = PERSONAS.find((p) => p.id === r.view)!.module;
    return module === 'back-office' && r.office === 'overview' ? '/back-office/overview' : `/${module}`;
  }
  return r.tab === 'docs' ? `/thinking/${r.doc}` : '/';
}

/** Reads a path back; anything unknown opens the car journey. */
export function fromPath(path: string): Route {
  const [first, second] = path.split('/').filter(Boolean);
  if (!first) return HOME;
  if (first === 'thinking') {
    const doc = DOCS.find((d) => d.id === second)?.id ?? HOME.doc;
    return { ...HOME, tab: 'docs', doc };
  }
  const person = PERSONAS.find((p) => p.module === first);
  if (!person) return HOME;
  return { ...HOME, view: person.id as PersonaId, office: person.module === 'back-office' && second === 'overview' ? 'overview' : 'pickups' };
}
