import { useState } from 'react';
import { Lockup } from '../components/brand/Lockup';
import { ArchitecturePage } from '../behind/Architecture';
import { Avatar } from '../behind/Avatar';
import { Icon } from '../behind/icons';
import { JourneyPage } from '../behind/Journey';
import { ProcessPage } from '../behind/Process';
import { MODULES, PERSONAS, persona, type PersonaId } from '../domain/personas';
import { BEHIND_TABS, type BehindTab, type View } from './views';
import { DemoModule } from './parts';

function BehindMark({ active }: { active?: boolean }) {
  return (
    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${active ? 'bg-ink text-white' : 'border border-line bg-white text-ink'}`} aria-hidden>
      <Icon name="layers" className="size-4" />
    </span>
  );
}

function ViewLine({ view, active }: { view: View; active?: boolean }) {
  if (view === 'behind') {
    return (
      <span className="flex min-w-0 items-center gap-3 text-left">
        <BehindMark active={active} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-ink">Behind the build</span>
          <span className="block truncate text-caption text-muted">Journey, process, architecture</span>
        </span>
      </span>
    );
  }
  const p = persona(view);
  return (
    <span className="flex min-w-0 items-center gap-3 text-left">
      <Avatar id={view} active={active} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-ink">
          {p.name} · {MODULES[p.module].label}
        </span>
        <span className="block truncate text-caption text-muted">
          {p.role} · {p.org}
        </span>
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
      <ViewLine view={v} active={v === view} />
    </button>
  );

  return (
    <div className="relative flex items-center gap-3">
      <span className="text-caption text-muted">Viewing as</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-[260px] items-center justify-between gap-2 rounded-pill border border-line py-1 pr-4 pl-1 hover:border-ink"
      >
        <ViewLine view={view} />
        <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute top-full right-0 z-20 mt-2 w-[300px] rounded-panel border border-line bg-white p-2 shadow-overlay">
            {item('behind')}
            <div className="mx-2 my-2 border-t border-line-light" />
            <p className="px-3 pt-1 pb-1 text-caption font-medium text-muted">People</p>
            {PERSONAS.map((p) => item(p.id))}
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  initialView?: View;
  initialTab?: BehindTab;
}

/** The app shell: the logo, one "Viewing as" switcher at the top right, and either the
 *  Behind-the-build pages (with a light sub-nav) or the selected person's module. */
export function AppShell({ initialView = 'behind', initialTab = 'journey' }: Props) {
  const [view, setView] = useState<View>(initialView);
  const [tab, setTab] = useState<BehindTab>(initialTab);
  const showPerson = (id: PersonaId) => setView(id);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="relative z-20 flex h-[68px] items-center justify-between gap-6 border-b border-line bg-white px-6 shadow-header">
        <button type="button" onClick={() => setView('behind')} aria-label="Home">
          <Lockup variant="divider" size={24} />
        </button>
        <ViewSwitcher view={view} onChange={setView} />
      </header>

      {view === 'behind' && (
        <nav className="flex h-12 items-center justify-center gap-8 border-b border-line bg-white px-6 text-sm" aria-label="Behind the build">
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

      <main className="flex-1">
        {view !== 'behind' ? (
          <DemoModule key={view} personaId={view} />
        ) : tab === 'journey' ? (
          <JourneyPage onPick={showPerson} />
        ) : tab === 'process' ? (
          <ProcessPage />
        ) : (
          <ArchitecturePage />
        )}
      </main>
    </div>
  );
}
