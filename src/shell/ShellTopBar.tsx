import { useState } from 'react';
import { BEHIND_PAGES, BehindPage, type BehindPageId } from '../behind/pages';
import { MODULES, PERSONAS, persona, type ModuleId, type PersonaId } from '../domain/personas';
import { DemoModule, PersonaLine, Wordmark } from './parts';

export type Mode = 'demo' | 'behind';

interface Props {
  initialMode?: Mode;
  initialPersona?: PersonaId;
  initialPage?: BehindPageId;
}

/** Variant A: top bar with a Demo / Behind-the-build segmented switch and a persona dropdown. */
export function ShellTopBar({ initialMode = 'demo', initialPersona = 'maria', initialPage = 'journey' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pid, setPid] = useState<PersonaId>(initialPersona);
  const [mod, setMod] = useState<ModuleId>(persona(initialPersona).modules[0]);
  const [page, setPage] = useState<BehindPageId>(initialPage);
  const [open, setOpen] = useState(false);
  const p = persona(pid);

  const pick = (id: PersonaId) => {
    setPid(id);
    setMod(persona(id).modules[0]);
    setOpen(false);
  };

  const tabs =
    mode === 'demo'
      ? p.modules.map((m) => ({ id: m as string, label: MODULES[m].label }))
      : BEHIND_PAGES.map((b) => ({ id: b.id as string, label: b.label }));
  const activeTab = mode === 'demo' ? mod : page;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="relative z-20 flex h-[68px] items-center gap-6 border-b border-line bg-white px-6 shadow-header">
        <Wordmark />
        <div className="mx-auto inline-flex rounded-pill bg-line-light p-1 text-sm font-medium">
          {(['demo', 'behind'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-pill px-4 py-1.5 ${mode === m ? 'bg-white text-ink' : 'text-muted hover:text-ink'}`}
            >
              {m === 'demo' ? 'Demo' : 'Behind the build'}
            </button>
          ))}
        </div>
        <div className="relative w-[240px]">
          {mode === 'demo' ? (
            <>
              <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 rounded-pill border border-line py-1 pr-4 pl-1 hover:border-ink"
              >
                <PersonaLine id={pid} />
                <svg viewBox="0 0 12 12" className="size-3 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 4.5l3 3 3-3" />
                </svg>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-[280px] rounded-panel border border-line bg-white p-2 shadow-overlay">
                  <p className="px-3 pt-2 pb-1 text-caption font-medium text-muted">View as</p>
                  {PERSONAS.map((x) => (
                    <button
                      key={x.id}
                      onClick={() => pick(x.id)}
                      className={`flex w-full items-center rounded-card px-2 py-2 hover:bg-canvas ${x.id === pid ? 'bg-canvas' : ''}`}
                    >
                      <PersonaLine id={x.id} active={x.id === pid} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-right text-sm text-muted">For Clutch reviewers</p>
          )}
        </div>
      </header>
      <nav className="flex h-12 items-center gap-6 border-b border-line bg-white px-6 text-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => (mode === 'demo' ? setMod(t.id as ModuleId) : setPage(t.id as BehindPageId))}
            className={`-mb-px h-full border-b-2 ${activeTab === t.id ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
        {mode === 'demo' && <span className="ml-auto text-caption text-muted">{p.need}</span>}
      </nav>
      <main className="flex-1">{mode === 'demo' ? <DemoModule personaId={pid} moduleId={mod} /> : <BehindPage key={page} id={page} />}</main>
    </div>
  );
}
