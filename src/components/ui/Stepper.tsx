// Header breadcrumb stepper + thin progress line, as in Clutch's sell flow.
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="border-b border-line bg-white">
      <ol className="flex items-center justify-center gap-3 py-4 text-sm">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className={i === current ? 'font-medium text-ink' : i < current ? 'text-ink' : 'text-muted'}>{s}</span>
            {i < steps.length - 1 && (
              <svg viewBox="0 0 8 8" className="size-2 text-subtle" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M2.5 1l3 3-3 3" />
              </svg>
            )}
          </li>
        ))}
      </ol>
      <div className="h-[3px] bg-line-light">
        <div className="h-full bg-ink transition-all" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  );
}

// Segmented progress bar used inside dialogs.
export function SegmentedProgress({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 flex-1 rounded-xs ${i < done ? 'bg-ink' : 'bg-line-light'}`} />
      ))}
    </div>
  );
}
