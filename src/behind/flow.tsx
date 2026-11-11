import type { ReactNode } from 'react';
import { Icon, type IconName } from './icons';

// Building blocks for the simple left-to-right diagrams: a node (circle or icon tile) with a short label
// under it, and a thin connector between nodes. Kept deliberately plain.

export type NodeShape = 'circle' | 'tile';
export type NodeTone = 'default' | 'selected' | 'current' | 'upcoming' | 'stub';

// Nodes shrink below 1024px so every diagram fits an iPad in portrait (768px) without sideways scrolling.
const SIZE = {
  lg: { dim: 'size-14 lg:size-20', icon: 'size-6 lg:size-8' },
  sm: { dim: 'size-12 lg:size-14', icon: 'size-5 lg:size-6' },
};

const TONE: Record<NodeTone, string> = {
  default: 'border border-line bg-white text-ink',
  selected: 'border border-ink bg-ink text-white',
  current: 'border-2 border-ink bg-white text-ink',
  upcoming: 'border border-dashed border-subtle bg-white text-subtle',
  stub: 'border border-dashed border-subtle bg-white text-muted',
};

interface NodeProps {
  icon: IconName;
  label: string;
  sub?: ReactNode;
  shape?: NodeShape;
  size?: 'lg' | 'sm';
  tone?: NodeTone;
  badge?: ReactNode;
  /** Extra line under the label and sub-line (e.g. the module chip, or a "Read" affordance). */
  foot?: ReactNode;
  onClick?: () => void;
  title?: string;
  /** Width of the node's column (label wraps inside it). */
  width?: string;
  className?: string;
}

export function FlowNode({ icon, label, sub, shape = 'circle', size = 'lg', tone = 'default', badge, foot, onClick, title, width = 'w-[104px] lg:w-[132px]', className = '' }: NodeProps) {
  const s = SIZE[size];
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-panel';
  const interactive = onClick ? 'cursor-pointer hover:border-ink' : '';
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { onClick, type: 'button' as const } : {})}
      title={title}
      className={`group flex flex-col items-center text-center ${width} ${className}`}
    >
      <span className={`relative grid place-items-center ${s.dim} ${radius} ${TONE[tone]} ${interactive} transition-colors`}>
        <Icon name={icon} className={s.icon} />
        {badge && <span className="absolute -right-1 -bottom-1">{badge}</span>}
      </span>
      <span className={`mt-2 font-bold lg:mt-3 ${size === 'lg' ? 'text-sm lg:text-base' : 'text-sm'} ${tone === 'upcoming' ? 'text-muted' : 'text-ink'}`}>{label}</span>
      {sub && <span className="mt-0.5 text-caption leading-[17px] text-muted">{sub}</span>}
      {foot && <span className="mt-2">{foot}</span>}
    </Tag>
  );
}

/** Horizontal connector, vertically centred on the node next to it. */
export function Connector({ size = 'lg', arrow, label, dashed }: { size?: 'lg' | 'sm'; arrow?: boolean; label?: string; dashed?: boolean }) {
  return (
    <div className={`relative flex min-w-3 flex-1 items-center justify-self-stretch lg:min-w-10 ${size === 'lg' ? 'h-14 lg:h-20' : 'h-12 lg:h-14'}`} aria-hidden>
      <span className={`h-0 flex-1 border-t ${dashed ? 'border-dashed border-subtle' : 'border-line'}`} />
      {arrow && (
        <svg viewBox="0 0 8 10" className="-ml-px h-2.5 w-2 text-subtle" fill="currentColor">
          <path d="M0 0l8 5-8 5z" />
        </svg>
      )}
      {label && <span className="absolute inset-x-0 top-[calc(50%+6px)] text-center text-caption whitespace-nowrap text-muted">{label}</span>}
    </div>
  );
}

/** Vertical arrow for the one or two edge cases that leave the main row. */
export function VArrow({ dir, label }: { dir: 'down' | 'up'; label?: string }) {
  return (
    <div className="relative flex h-14 justify-center" aria-hidden>
      <svg viewBox="0 0 10 56" className="h-14 w-2.5 text-subtle" fill="none" stroke="currentColor" strokeWidth="1">
        {dir === 'down' ? (
          <>
            <path d="M5 0v50" strokeDasharray="3 3" />
            <path d="M1.5 47l3.5 5 3.5-5" />
          </>
        ) : (
          <>
            <path d="M5 56V6" strokeDasharray="3 3" />
            <path d="M1.5 9l3.5-5 3.5 5" />
          </>
        )}
      </svg>
      {label && <span className="absolute top-1/2 left-[calc(50%+10px)] -translate-y-1/2 text-caption whitespace-nowrap text-muted">{label}</span>}
    </div>
  );
}

/** Centred page used by every Behind-the-build page: short heading, one line, lots of air. */
export function CenteredPage({ title, intro, hint, children }: { title: string; intro?: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center px-6 py-10 lg:px-8 lg:py-16">
      <h1 className="text-center text-h3 font-bold text-ink">{title}</h1>
      {intro && <p className="mt-2 max-w-[620px] text-center text-base text-muted">{intro}</p>}
      {hint && <p className="mt-4 text-center text-sm text-ink">{hint}</p>}
      <div className="mt-10 w-full lg:mt-14">{children}</div>
    </div>
  );
}
