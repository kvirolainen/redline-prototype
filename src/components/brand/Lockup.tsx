// Product lockups for Redline. The "clutch" wordmark is styled text (Figtree, bold, lowercase, ink),
// standing in for Clutch's real logo file.

export type LockupVariant = 'divider' | 'by' | 'descriptor' | 'tag';

function ClutchWord({ size, invert }: { size: number; invert?: boolean }) {
  return (
    <span className={`font-bold tracking-[-0.03em] lowercase ${invert ? 'text-white' : 'text-ink'}`} style={{ fontSize: size, lineHeight: 1 }}>
      clutch
    </span>
  );
}

/** `size` is the wordmark height in px; everything else scales from it. */
export function Lockup({ variant = 'divider', size = 26, invert }: { variant?: LockupVariant; size?: number; invert?: boolean }) {
  const soft = invert ? 'text-white/70' : 'text-muted';
  const strong = invert ? 'text-white' : 'text-ink';

  switch (variant) {
    case 'divider':
      return (
        <span className="inline-flex items-center" aria-label="Clutch Redline">
          <ClutchWord size={size} invert={invert} />
          <span className={`w-px ${invert ? 'bg-white/40' : 'bg-line'}`} style={{ height: size * 0.9, marginInline: size * 0.45 }} />
          <span className={`font-medium ${strong}`} style={{ fontSize: size * 0.72, lineHeight: 1 }}>
            Redline
          </span>
        </span>
      );
    case 'by':
      return (
        <span className="inline-flex flex-col" aria-label="Redline by Clutch">
          <span className={`font-bold tracking-[-0.02em] ${strong}`} style={{ fontSize: size, lineHeight: 1 }}>
            Redline
          </span>
          <span className={`font-medium ${soft}`} style={{ fontSize: Math.max(11, size * 0.42), lineHeight: 1.4 }}>
            by <span className={`font-bold lowercase ${strong}`}>clutch</span>
          </span>
        </span>
      );
    case 'descriptor':
      return (
        <span className="inline-flex items-baseline gap-[0.3em]" aria-label="Clutch for Dealers">
          <ClutchWord size={size} invert={invert} />
          <span className={`font-medium ${soft}`} style={{ fontSize: size * 0.62, lineHeight: 1 }}>
            for Dealers
          </span>
        </span>
      );
    case 'tag':
      return (
        <span className="inline-flex items-center gap-[0.35em]" aria-label="Clutch Redline">
          <ClutchWord size={size} invert={invert} />
          <span
            className="rounded-badge bg-brand font-bold tracking-wide text-white uppercase"
            style={{ fontSize: Math.max(10, size * 0.4), lineHeight: 1, padding: '0.35em 0.55em' }}
          >
            Redline
          </span>
        </span>
      );
  }
}
