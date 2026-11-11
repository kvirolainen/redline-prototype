import type { ReactNode } from 'react';
import { MODULES, persona, type ModuleId, type PersonaId } from '../domain/personas';
import { Avatar } from '../behind/Avatar';

export function Wordmark({ invert }: { invert?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className={`text-[26px] leading-none font-bold tracking-tight ${invert ? 'text-white' : 'text-brand'}`}>clutch</span>
      <span className={`text-sm font-medium ${invert ? 'text-white/70' : 'text-muted'}`}>Redline</span>
    </span>
  );
}

export function PersonaLine({ id, active }: { id: PersonaId; active?: boolean }) {
  const p = persona(id);
  return (
    <span className="flex min-w-0 items-center gap-3 text-left">
      <Avatar id={id} active={active} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-ink">{p.name}</span>
        <span className="block truncate text-caption text-muted">
          {p.role} · {p.org}
        </span>
      </span>
    </span>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[360px] rounded-[40px] border border-line bg-white p-3">
      <div className="mx-auto mb-3 h-1.5 w-20 rounded-pill bg-line-light" />
      <div className="h-[640px] overflow-hidden rounded-[28px] border border-line-light bg-canvas">{children}</div>
    </div>
  );
}

// Placeholder for a persona module. Modules are designed in the next step; this keeps the shell honest about that.
export function DemoModule({ personaId, moduleId }: { personaId: PersonaId; moduleId: ModuleId }) {
  const p = persona(personaId);
  const m = MODULES[moduleId];
  const body = (
    <div className={`flex h-full flex-col ${m.device === 'phone' ? 'p-5' : 'p-8'}`}>
      <p className="text-caption font-medium text-muted">
        {p.name} · {p.role} · {p.org}
      </p>
      <h2 className="mt-1 text-h4 font-bold text-ink">{m.label}</h2>
      <p className="mt-1 text-sm text-muted">{m.summary}</p>
      <div className="mt-6 grid flex-1 place-items-center rounded-panel border border-dashed border-subtle bg-white p-6 text-center">
        <div>
          <span className="rounded-pill bg-line-light px-3 py-1 text-caption font-medium text-muted">Placeholder</span>
          <p className="mt-3 text-title font-bold text-ink">{m.label} screen</p>
          <p className="mx-auto mt-1 max-w-[320px] text-sm text-muted">Designed in the prototypes step, then built on the live backend.</p>
        </div>
      </div>
    </div>
  );
  return m.device === 'phone' ? (
    <div className="py-8">
      <PhoneFrame>{body}</PhoneFrame>
    </div>
  ) : (
    <div className="h-full min-h-[560px]">{body}</div>
  );
}
