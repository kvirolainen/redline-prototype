import { useState } from 'react';
import { BEHIND_PAGES, BehindPage, type BehindPageId } from '../behind/pages';
import { JourneyTrack } from '../behind/Journey';
import { Avatar } from '../behind/Avatar';
import { MODULES, PERSONAS, persona, type ModuleId, type PersonaId } from '../domain/personas';
import { DemoModule, Wordmark } from './parts';

type View = { kind: 'hub' } | { kind: 'demo'; persona: PersonaId; module: ModuleId } | { kind: 'behind'; page: BehindPageId };

/** Variant C: landing-first hub. The journey and four persona cards up front; Behind the build in a slim bar. */
export function ShellHub({ initial = { kind: 'hub' } }: { initial?: View }) {
  const [view, setView] = useState<View>(initial);
  const open = (id: PersonaId) => setView({ kind: 'demo', persona: id, module: persona(id).modules[0] });

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="flex h-11 items-center justify-center gap-1 bg-body px-6 text-sm text-white">
        <span className="mr-3 text-white/70">Behind the build</span>
        {BEHIND_PAGES.map((b) => {
          const active = view.kind === 'behind' && view.page === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setView({ kind: 'behind', page: b.id })}
              className={`rounded-pill px-3 py-1 ${active ? 'bg-white font-medium text-ink' : 'underline-offset-4 hover:underline'}`}
            >
              {b.label}
            </button>
          );
        })}
      </div>
      <header className="flex h-[68px] items-center gap-6 border-b border-line bg-white px-6 shadow-header">
        <button onClick={() => setView({ kind: 'hub' })} aria-label="Home">
          <Wordmark />
        </button>
        {view.kind !== 'hub' && (
          <button onClick={() => setView({ kind: 'hub' })} className="text-sm text-muted hover:text-ink">
            ← All people
          </button>
        )}
        {view.kind === 'demo' && (
          <div className="ml-auto flex items-center gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => open(p.id)}
                title={`${p.name} · ${p.role}`}
                className={`flex items-center gap-2 rounded-pill border py-1 pr-3 pl-1 text-sm ${
                  view.persona === p.id ? 'border-ink font-medium text-ink' : 'border-line text-muted hover:border-ink'
                }`}
              >
                <Avatar id={p.id} size="sm" active={view.persona === p.id} />
                {p.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        {view.kind === 'hub' && (
          <div className="mx-auto max-w-[1328px] px-8 py-12">
            <h1 className="text-h2 font-bold text-ink">Follow one trade-in from desk to payment.</h1>
            <p className="mt-2 max-w-[760px] text-lead text-muted">Pick a person to see their screen. Every step below has one owner.</p>
            <div className="mt-10 overflow-x-auto rounded-panel border border-line bg-white p-6">
              <JourneyTrack compact />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => open(p.id)}
                  className="group flex flex-col rounded-card border border-line bg-white p-6 text-left hover:border-ink"
                >
                  <div className="flex items-center gap-3">
                    <Avatar id={p.id} size="lg" />
                    <div>
                      <div className="text-title font-bold text-ink">{p.name}</div>
                      <div className="text-sm text-muted">
                        {p.role} · {p.org}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm text-body">{p.need}</p>
                  <div className="mt-6 flex w-full items-center justify-between gap-3">
                    <span className="text-caption text-muted">{p.modules.map((m) => MODULES[m].label).join(' · ')}</span>
                    <span className="grid size-8 place-items-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {view.kind === 'demo' && (
          <>
            {persona(view.persona).modules.length > 1 && (
              <nav className="flex h-12 items-center gap-6 border-b border-line bg-white px-6 text-sm">
                {persona(view.persona).modules.map((m) => (
                  <button
                    key={m}
                    onClick={() => setView({ ...view, module: m })}
                    className={`-mb-px h-full border-b-2 ${view.module === m ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                  >
                    {MODULES[m].label}
                  </button>
                ))}
              </nav>
            )}
            <DemoModule personaId={view.persona} moduleId={view.module} />
          </>
        )}
        {view.kind === 'behind' && <BehindPage key={view.page} id={view.page} />}
      </main>
    </div>
  );
}
