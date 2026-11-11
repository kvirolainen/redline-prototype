import type { ReactNode } from 'react';

export type TagTone = 'attention' | 'neutral' | 'dark';

const tone: Record<TagTone, string> = {
  attention: 'border-warning bg-nudge text-ink',
  neutral: 'border-line bg-line-light text-body',
  dark: 'border-ink bg-ink text-white',
};

/** A short label pill: "Expires tomorrow", "Offer ending", "12 min". Attention is the one yellow style everywhere. */
export function Tag({ children, tone: t = 'attention', className = '' }: { children: ReactNode; tone?: TagTone; className?: string }) {
  return <span className={`inline-flex h-6 items-center gap-1.5 rounded-pill border px-2.5 text-caption font-medium whitespace-nowrap ${tone[t]} ${className}`}>{children}</span>;
}

/** Marks a card or row that needs someone: a yellow stripe down its left edge, borders stay grey. */
export const ATTENTION_EDGE = 'shadow-[inset_3px_0_0_0_var(--color-warning)]';
