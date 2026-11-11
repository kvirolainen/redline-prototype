import { ClutchWordmark } from './ClutchWordmark';

// The Redline product lockup: "clutch | Redline". Every variant is the same idea; they differ only in the mark
// (the redrawn Clutch wordmark or plain Figtree text), the colour of "Redline", and the thin divider.
//
// Alignment: the row is a flex row with `items-baseline`, so "clutch" and "Redline" share one baseline (the
// wordmark SVG's bottom edge is its baseline). Optical size: "Redline" is sized so its ascenders (R, d, l) reach
// the top of the wordmark's l/t/h, which also lands its x-height on the wordmark's x-height (Figtree: x-height
// 0.50 em, ascender 0.704 em; wordmark: x-height 0.725 of its ascender).

const FIGTREE_ASCENDER = 0.704;

export interface LockupOptions {
  /** The redrawn Clutch wordmark (SVG) or Figtree text. */
  mark?: 'wordmark' | 'text';
  /** Colour of "clutch" (the wordmark is red by default, as in Clutch's own header). */
  clutch?: 'ink' | 'red';
  /** Colour of "Redline". */
  redline?: 'ink' | 'red';
  divider?: boolean;
}

interface Props extends LockupOptions {
  /** Ascender height in px (top of the "l" to the baseline); everything scales from it. */
  size?: number;
  invert?: boolean;
}


export function Lockup({ mark = 'wordmark', clutch = 'red', redline = 'ink', divider = true, size = 24, invert }: Props) {
  const fontSize = size / FIGTREE_ASCENDER;
  const ink = invert ? 'text-white' : 'text-ink';
  const red = 'text-brand';
  const markColor = clutch === 'red' ? red : ink;

  return (
    <span className="inline-flex items-baseline" aria-label="Clutch Redline" role="img">
      {mark === 'wordmark' ? (
        <span className={markColor}>
          <ClutchWordmark height={size} title="" />
        </span>
      ) : (
        <span className={`font-bold tracking-[-0.03em] ${markColor}`} style={{ fontSize, lineHeight: 1 }}>
          clutch
        </span>
      )}
      {divider ? (
        // Runs from the baseline to the ascender line, the same height as the letters it separates.
        <span className={`w-px self-baseline ${invert ? 'bg-white/40' : 'bg-line'}`} style={{ height: size, marginInline: size * 0.45 }} aria-hidden />
      ) : (
        <span style={{ width: size * 0.32 }} aria-hidden />
      )}
      <span className={`font-semibold tracking-[-0.01em] ${redline === 'red' ? red : ink}`} style={{ fontSize, lineHeight: 1 }}>
        Redline
      </span>
    </span>
  );
}
