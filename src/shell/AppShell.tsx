import { useEffect, useState } from 'react';
import { fromPath, toPath, type Route } from './route';
import { Lockup } from '../components/brand/Lockup';
import { CarJourney } from '../behind/CarJourney';
import type { DocId } from '../behind/docs';
import { DocsViewer } from '../behind/DocsViewer';
import { Icon } from '../behind/icons';
import { MODULE_ICON } from '../behind/moduleIcons';
import { MODULES, PERSONAS, persona, personaLine, type PersonaId } from '../domain/personas';
import { BEHIND_TABS, DOCS_TAB_LABEL, type BackOfficeTab, type BehindTab, type View } from './views';
import { DemoBar, DemoModule, EmptyWorld, WorldProvider } from './parts';
import { useHasBackend } from '../live/world';

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  );
}

/** `quiet`: Behind the build in the menu, a plain grey icon with no circle, so the modules lead. */
function ViewIcon({ view, active, quiet }: { view: View; active?: boolean; quiet?: boolean }) {
  const icon = view === 'behind' ? 'layers' : MODULE_ICON[persona(view).module];
  const look = active ? 'bg-ink text-white' : quiet ? 'text-muted' : 'border border-line bg-white text-ink';
  return (
    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${look}`} aria-hidden>
      <Icon name={icon} className="size-4" />
    </span>
  );
}

/** Back office is one module with two people: Dave's Overview tab and Maria's Pickups tab. */
const isShared = (view: View) => view !== 'behind' && persona(view).module === 'back-office';

/** Button label: leads with the module ("Trade-in · Maria"), or "Behind the build". */
const buttonLabel = (view: View) =>
  view === 'behind' ? 'Behind the build' : `${MODULES[persona(view).module].label} · ${isShared(view) ? 'Dave & Maria' : persona(view).name}`;

/** Menu item: module name in bold, the person (or both people) on the second line. */
function MenuLine({ view, active }: { view: View; active?: boolean }) {
  const sub = view === 'behind' ? `Car journey, ${DOCS_TAB_LABEL.toLowerCase()}` : isShared(view) ? 'Dave, director · Maria, manager' : personaLine(persona(view));
  const title = view === 'behind' ? 'Behind the build' : MODULES[persona(view).module].label;
  return (
    <span className="flex min-w-0 items-center gap-3 text-left">
      <ViewIcon view={view} active={active} quiet={view === 'behind'} />
      <span className="min-w-0">
        <span className={`block truncate text-sm ${view === 'behind' && !active ? 'font-medium text-muted' : 'font-bold text-ink'}`}>{title}</span>
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
            {PERSONAS.map((p) => item(p.id))}
            <div className="mx-2 my-2 border-t border-line-light" />
            {item('behind')}
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
        <div className="mt-6 flex w-[196px] flex-col">
          <p className="text-sm text-ink">
            <span className="font-bold">4 modules</span>, one per role
          </p>
          {/* Heading and pills share one left edge. Module first, then the person. */}
          <div className="mt-3 grid gap-1.5">
            {PERSONAS.map((p) => {
              const id = p.id;
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
        <svg viewBox="0 0 40 44" className="mr-8 -ml-8 h-11 w-10 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 36C16 36 26 26 28 4" />
          <path d="M22 9l6-6 5 7" />
        </svg>
      </div>
    </div>
  );
}

interface Props {
  initialView?: View;
  initialTab?: BehindTab;
  initialDoc?: DocId;
  /** The app keeps the screen in the address bar, so a refresh or a shared link reopens it. Storybook leaves it off. */
  routed?: boolean;
}

/** The app shell: the logo, one switcher at the top right, and either the Behind-the-build pages (with a light
 *  sub-nav) or the selected person's module. The pages are the same components as in Storybook, rendered as-is. */
export function AppShell({ initialView = 'behind', initialTab = 'car-journey', initialDoc = 'concept', routed = false }: Props) {
  const [route, setRoute] = useState<Route>(() =>
    routed ? fromPath(window.location.pathname) : { view: initialView, tab: initialTab, doc: initialDoc, office: 'overview' },
  );
  const { view, tab, doc, office } = route;
  const navigate = (patch: Partial<Route>) => {
    const next = { ...route, ...patch };
    setRoute(next);
    if (routed && toPath(next) !== window.location.pathname) window.history.pushState(null, '', toPath(next));
  };
  // Back and forward in the browser move between screens.
  useEffect(() => {
    if (!routed) return;
    // An unknown or partial path opened a fallback screen: show that screen's own path.
    const own = toPath(fromPath(window.location.pathname));
    if (own !== window.location.pathname) window.history.replaceState(null, '', own);
    const onPop = () => setRoute(fromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [routed]);
  const setTab = (t: BehindTab) => navigate({ view: 'behind', tab: t });
  const setDoc = (d: DocId) => navigate({ view: 'behind', tab: 'docs', doc: d });
  const go = (v: View) => navigate({ view: v });
  // A module opens on its person's home: Back office on Dave's Overview unless Maria's Pickups is asked for.
  const showPerson = (id: PersonaId, home: BackOfficeTab = 'overview') => navigate({ view: id, office: home });
  const officeProps = { tab: office, onChange: (t: BackOfficeTab) => navigate({ office: t }) };
  // The pointer belongs to the landing page; on the other tabs it would sit over the content.
  const pointerOn = view === 'behind' && tab === 'car-journey';
  const hasBackend = useHasBackend();

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
        <div className="flex items-center gap-6">
          {hasBackend && view !== 'behind' && <DemoBar />}
          <ViewSwitcher view={view} onChange={(v) => navigate({ view: v, office: 'overview' })} />
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        {pointerOn && <ScreensPointer onPick={showPerson} />}
        {view !== 'behind' ? (
          hasBackend ? (
            // In the app the module reads the shared backend; the demo bar sits on top of it.
            <WorldProvider empty={<EmptyWorld />}>
              <DemoModule key={view} personaId={view} onSwitch={showPerson} office={officeProps} />
            </WorldProvider>
          ) : (
            <DemoModule key={view} personaId={view} onSwitch={showPerson} office={officeProps} />
          )
        ) : tab === 'car-journey' ? (
          <CarJourney onPick={showPerson} />
        ) : (
          <DocsViewer selected={doc} onSelect={setDoc} />
        )}
      </main>
    </div>
  );
}
