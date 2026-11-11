import { useState } from 'react';
import { BEHIND_PAGES, BehindPage, type BehindPageId } from '../behind/pages';
import { MODULES, PERSONAS, persona, type ModuleId, type PersonaId } from '../domain/personas';
import { DemoModule, PersonaLine, Wordmark } from './parts';

type View = { kind: 'demo'; persona: PersonaId; module: ModuleId } | { kind: 'behind'; page: BehindPageId };

/** Variant B: one left sidebar with two sections — Behind the build pages above, Demo personas below. */
export function ShellSidebar({ initial }: { initial: View }) {
  const [view, setView] = useState<View>(initial);

  return (
    <div className="grid min-h-screen grid-cols-[272px_1fr] bg-canvas">
      <aside className="flex flex-col border-r border-line bg-white">
        <div className="flex h-[68px] items-center border-b border-line px-6">
          <Wordmark />
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto px-3 py-6">
          <section>
            <p className="px-3 text-caption font-bold tracking-wide text-muted uppercase">Demo</p>
            <p className="px-3 pt-1 text-caption text-subtle">Follow one car as each person</p>
            <ul className="mt-3 space-y-1">
              {PERSONAS.map((p) => {
                const active = view.kind === 'demo' && view.persona === p.id;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setView({ kind: 'demo', persona: p.id, module: p.modules[0] })}
                      className={`flex w-full rounded-card px-3 py-2 ${active ? 'bg-canvas ring-1 ring-ink' : 'hover:bg-canvas'}`}
                    >
                      <PersonaLine id={p.id} active={active} />
                    </button>
                    {active && p.modules.length > 1 && (
                      <ul className="mt-1 mb-2 ml-[52px] space-y-0.5 border-l border-line pl-3">
                        {p.modules.map((m) => (
                          <li key={m}>
                            <button
                              onClick={() => setView({ kind: 'demo', persona: p.id, module: m })}
                              className={`py-1 text-sm ${view.module === m ? 'font-medium text-ink' : 'text-muted hover:text-ink'}`}
                            >
                              {MODULES[m].label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          <section>
            <p className="px-3 text-caption font-bold tracking-wide text-muted uppercase">Behind the build</p>
            <p className="px-3 pt-1 text-caption text-subtle">For Clutch reviewers</p>
            <ul className="mt-3 space-y-1">
              {BEHIND_PAGES.map((b) => {
                const active = view.kind === 'behind' && view.page === b.id;
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => setView({ kind: 'behind', page: b.id })}
                      className={`w-full rounded-pill px-3 py-2 text-left text-sm ${active ? 'bg-ink font-medium text-white' : 'text-ink hover:bg-canvas'}`}
                    >
                      {b.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
        <p className="border-t border-line px-6 py-4 text-caption text-muted">Prototype · pricing is a placeholder</p>
      </aside>
      <main className="min-w-0">
        {view.kind === 'demo' ? (
          <>
            <div className="flex h-[68px] items-center justify-between border-b border-line bg-white px-8">
              <p className="text-sm text-muted">
                Viewing as <span className="font-bold text-ink">{persona(view.persona).name}</span>
              </p>
              <p className="text-caption text-muted">{persona(view.persona).need}</p>
            </div>
            <DemoModule personaId={view.persona} moduleId={view.module} />
          </>
        ) : (
          <BehindPage key={view.page} id={view.page} />
        )}
      </main>
    </div>
  );
}
