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

function ViewSwitcher({ view, onChange, highlight, onOpen }: { view: View; onChange: (v: View) => void; highlight?: boolean; onOpen?: () => void }) {
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
        onClick={() => {
          setOpen(!open);
          onOpen?.();
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex h-10 items-center gap-2 rounded-pill border py-1 pr-4 pl-1 transition-shadow hover:border-ink ${
          highlight ? 'border-brand ring-4 ring-brand/15' : 'border-line'
        }`}
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
            <p className="px-3 pt-1 pb-1 text-caption font-bold text-muted">Try a screen</p>
            {PERSONAS.map((p) => item(p.id))}
          </div>
        </>
      )}
    </div>
  );
}

/** First-visit pointer at the switcher: says the four screens exist and where to find them. */
function CoachMark({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div role="note" className="absolute top-full right-0 z-10 mt-3 w-[300px] rounded-panel border border-ink bg-white p-4 shadow-overlay">
      {/* Small pointer up at the switcher. */}
      <span className="absolute -top-[7px] right-10 size-3 rotate-45 border-t border-l border-ink bg-white" aria-hidden />
      <div className="flex items-start gap-3">
        <p className="text-sm text-body">
          <span className="font-bold text-ink">Try the 4 working screens here.</span> Trade-in, Inspector, Back office and Ops board, one per role.
        </p>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink">
          <Icon name="close" className="size-4" />
        </button>
      </div>
    </div>
  );
}

// The pointer at the switcher is shown until someone dismisses it or uses the switcher, then stays away.
const POINTER_KEY = 'redline.switcherPointerDismissed';
const pointerDismissed = () => {
  try {
    return localStorage.getItem(POINTER_KEY) === '1';
  } catch {
    return false;
  }
};
const rememberPointerDismissed = () => {
  try {
    localStorage.setItem(POINTER_KEY, '1');
  } catch {
    // Storage blocked: the pointer just comes back next time.
  }
};

interface Props {
  initialView?: View;
  initialTab?: BehindTab;
  initialDoc?: DocId;
  /** Show the pointer at the switcher. By default it shows on Behind the build until it has been dismissed once. */
  coach?: boolean;
}

/** The app shell: the logo, one switcher at the top right, and either the Behind-the-build pages (with a light
 *  sub-nav) or the selected person's module. The pages are the same components as in Storybook, rendered as-is. */
export function AppShell({ initialView = 'behind', initialTab = 'car-journey', initialDoc = 'concept', coach }: Props) {
  const [view, setView] = useState<View>(initialView);
  const [showCoach, setShowCoach] = useState(() => coach ?? (initialView === 'behind' && !pointerDismissed()));
  const [tab, setTab] = useState<BehindTab>(initialTab);
  const [doc, setDoc] = useState<DocId>(initialDoc);
  const hideCoach = () => {
    if (showCoach) rememberPointerDismissed();
    setShowCoach(false);
  };
  const go = (v: View) => {
    setView(v);
    hideCoach();
  };
  const showPerson = (id: PersonaId) => go(id);
  // The pointer belongs to the landing page; on the other tabs it would sit over the content.
  const pointerOn = showCoach && view === 'behind' && tab === 'car-journey';

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="relative z-20 flex h-[68px] items-center justify-between gap-6 border-b border-line bg-white px-6 shadow-header">
        <button type="button" onClick={() => go('behind')} aria-label="Home">
          <Lockup size={20} />
        </button>
        <div className="relative">
          <ViewSwitcher view={view} onChange={go} highlight={pointerOn} onOpen={hideCoach} />
          {pointerOn && <CoachMark onDismiss={hideCoach} />}
        </div>
      </header>

      {view === 'behind' && (
        <nav className="flex h-12 items-center justify-start gap-8 lg:justify-center border-b border-line bg-white px-6 text-sm" aria-label="Behind the build">
          {BEHIND_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`-mb-px h-full border-b-2 ${tab === t.id ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}

      <main className="flex flex-1 flex-col">
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
