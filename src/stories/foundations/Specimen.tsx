import type { ReactNode } from 'react';

// Layout helpers for foundation stories.
export function Page({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas p-8">
      <div className="mx-auto max-w-[1080px]">
        <h1 className="text-h3 font-bold text-ink">{title}</h1>
        {intro && <p className="mt-2 max-w-[640px] text-base text-muted">{intro}</p>}
        <div className="mt-8 space-y-10">{children}</div>
      </div>
    </div>
  );
}

export function Group({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-title font-bold text-ink">{label}</h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
