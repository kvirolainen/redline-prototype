import { useState } from 'react';
import { Lockup } from '../components/brand/Lockup';
import { CarJourney } from '../behind/CarJourney';
import type { DocId } from '../behind/docs';
import { DocsViewer } from '../behind/DocsViewer';
import { Icon } from '../behind/icons';
import { MODULE_ICON } from '../behind/moduleIcons';
import { MODULES, PERSONAS, persona, personaLine, type PersonaId } from '../domain/personas';
import { BEHIND_TABS, DOCS_TAB_LABEL, type BehindTab, type View } from './views';
import { DemoModule } from './parts';

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  );
}

function ViewIcon({ view, active }: { view: View; active?: boolean }) {
  const icon = view === 'behind' ? 'layers' : MODULE_ICON[persona(view).module];
  return (
    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${active ? 'bg-ink text-white' : 'border border-line bg-white text-ink'}`} aria-hidden>
      <Icon name={icon} className="size-4" />
    </span>
  );
}

/** Button label: leads with the module ("Trade-in · Maria"), or "Behind the build". */
const buttonLabel = (view: View) => (view === 'behind' ? 'Behind the build' : `${MODULES[persona(view).module].label} · ${persona(view).name}`);

/** Menu item: module name in bold, the person on the second line. */
function MenuLine({ view, active }: { view: View; active?: boolean }) {
  const [title, sub] = view === 'behind' ? ['Behind the build', `Car journey, ${DOCS_TAB_LABEL.toLowerCase()}`] : [MODULES[persona(view).module].label, personaLine(persona(view))];
  return (
    <span className="flex min-w-0 items-center gap-3 text-left">
      <ViewIcon view={view} active={active} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-ink">{title}</span>
        <span className="block truncate text-caption text-muted">{sub}</span>
      </span>
    </span>
  );
}

function ViewSwitcher({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const [open, setOpen] = useState(false);
  const pick = (v: View) => {
    onChange(v);
    setOpen(false);
  };
  const item = (v: View) => (
    <button
      key={v}
      type="button"
      role="menuitemradio"
      aria-checked={v === view}
      onClick={() => pick(v)}
      className={`flex w-full items-center rounded-card px-2 py-2 hover:bg-canvas ${v === view ? 'bg-canvas' : ''}`}
    >
      <MenuLine view={v} active={v === view} />
    </button>
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 items-center gap-2 rounded-pill border border-line py-1 pr-4 pl-1 hover:border-ink"
      >
        <ViewIcon view={view} />
        <span className="text-sm font-bold whitespace-nowrap text-ink">{buttonLabel(view)}</span>
        <Chevron />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute top-full right-0 z-20 mt-2 w-[300px] rounded-panel border border-line bg-white p-2 shadow-overlay">
            {item('behind')}
            <div className="mx-2 my-2 border-t border-line-light" />
            <p className="px-3 pt-1 pb-1 text-caption font-bold text-muted">Try a module</p>
            {PERSONAS.map((p) => item(p.id))}
          </div>
        </>
      )}
    </div>
  );
}

/** Always-on pointer drawn on the canvas under the switcher: says there are four modules and offers them
 *  directly, in the car's order. Lives on the Car journey tab only. */
function ScreensPointer({ onPick }: { onPick: (id: PersonaId) => void }) {
  return (
    <div className="pointer-events-none flex justify-end px-6 pt-2 xl:absolute xl:top-0 xl:right-0">
      <div className="pointer-events-auto flex items-start gap-1">
        <div className="mt-6 flex flex-col items-end">
          <p className="text-sm text-ink">
            <span className="font-bold">4 modules</span>, one per role
          </p>
          {/* Equal-width pills, stacked: module first, then the person. */}
          <div className="mt-3 grid w-[196px] gap-1.5">
            {SCREEN_ORDER.map((id) => {
              const p = persona(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onPick(id)}
                  className="flex items-center gap-2 rounded-pill border border-line bg-white px-3 py-1.5 text-left text-caption whitespace-nowrap hover:border-ink"
                >
                  <Icon name={MODULE_ICON[p.module]} className="size-3.5 shrink-0 text-muted" />
                  <span className="font-medium text-ink">{MODULES[p.module].label}</span>
                  <span className="ml-auto text-muted">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Hand-drawn style arrow curving up to the switcher. */}
        <svg viewBox="0 0 40 44" className="mr-8 h-11 w-10 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 36C16 36 26 26 28 4" />
          <path d="M22 9l6-6 5 7" />
        </svg>
      </div>
    </div>
  );
}

// The four modules in the order the car meets them.
const SCREEN_ORDER: PersonaId[] = ['maria', 'jordan', 'sam', 'dave'];

interface Props {
  initialView?: View;
  initialTab?: BehindTab;
  initialDoc?: DocId;
}

/** The app shell: the logo, one switcher at the top right, and either the Behind-the-build pages (with a light
 *  sub-nav) or the selected person's module. The pages are the same components as in Storybook, rendered as-is. */
export function AppShell({ initialView = 'behind', initialTab = 'car-journey', initialDoc = 'concept' }: Props) {
  const [view, setView] = useState<View>(initialView);
  const [tab, setTab] = useState<BehindTab>(initialTab);
  const [doc, setDoc] = useState<DocId>(initialDoc);
  const go = (v: View) => setView(v);
  const showPerson = (id: PersonaId) => go(id);
  // The pointer belongs to the landing page; on the other tabs it would sit over the content.
  const pointerOn = view === 'behind' && tab === 'car-journey';

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="relative z-20 flex h-[68px] items-stretch justify-between gap-6 border-b border-line bg-white px-6 shadow-header">
        <div className="flex items-stretch gap-8 lg:gap-10">
          <button type="button" onClick={() => go('behind')} aria-label="Home" className="flex items-center">
            <Lockup size={20} />
          </button>
          {/* Behind-the-build tabs live in the header, next to the logo: one bar instead of two. */}
          {view === 'behind' && (
            <nav className="flex items-stretch gap-6 text-sm" aria-label="Behind the build">
              {BEHIND_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  className={`-mb-px border-b-2 whitespace-nowrap ${tab === t.id ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center">
          <ViewSwitcher view={view} onChange={go} />
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        {pointerOn && <ScreensPointer onPick={showPerson} />}
        {view !== 'behind' ? (
          <DemoModule key={view} personaId={view} />
        ) : tab === 'car-journey' ? (
          <CarJourney onPick={showPerson} />
        ) : (
          <DocsViewer selected={doc} onSelect={setDoc} />
        )}
      </main>
    </div>
  );
}
