import { useId } from 'react';

// The Clutch wordmark, redrawn as an SVG from the brand file: heavy geometric lowercase "clutch" with the
// car-key notch cut into the bottom of the first "c". Stand-in until the real logo file is dropped in.
//
// Geometry: about 2000 × 481 units. Baseline at y = 480, ascender (l, t, h) at y = 0, x-height ≈ 132 (0.725 of the
// ascender). The bottom edge of the SVG is the baseline, so in a flex row with `items-baseline` it sits on
// the same baseline as the text next to it.

// The first "c" bulges 6 units left of x = 0, so the viewBox starts at -6.
const WORDMARK = { x: -6, width: 2006, height: 481, xHeight: 348 / 480 } as const;

// A "c" is one thick arc (centre 180,296; mid radius 138.5; 93 wide) open ±32° on the right, with radial cuts.
const C_ARC = 'M297.5 222.6 A138.5 138.5 0 1 0 297.5 369.4';

const PATHS = [
  // l
  'M410 0H498V480H410Z',
  // u
  'M594 132H683V335C683 380 708 405 750 405C800 405 829 375 829 320V132H918V480H829V437C805 470 770 481 730 481C640 481 594 430 594 350Z',
  // t
  'M1049 0H1139V129H1217V215H1139V360C1139 385 1150 397 1180 397H1217V477C1200 479 1185 480 1165 480C1085 480 1049 440 1049 370V215H988V129H1049Z',
  // h
  'M1675 0H1764V170C1795 140 1830 123 1870 123C1950 123 2000 180 2000 280V480H1911V285C1911 235 1885 207 1840 207C1795 207 1764 240 1764 290V480H1675Z',
];

export function ClutchWordmark({ height, color = 'currentColor', title = 'clutch' }: { height: number; color?: string; title?: string }) {
  const maskId = `clutch-notch-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const w = (height * WORDMARK.width) / WORDMARK.height;
  return (
    <svg viewBox={`${WORDMARK.x} 0 ${WORDMARK.width} ${WORDMARK.height}`} width={w} height={height} {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })} className="block shrink-0" style={{ color }}>
      <defs>
        {/* The two slots of the key notch, cut out of the first "c" so the mark works on any background. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-10" y="0" width="400" height="481">
          <rect x="-10" width="410" height="481" fill="white" />
          <path d="M146 340H184L122 500H85Z M181 340H219L280 500H243Z" fill="black" />
        </mask>
      </defs>
      <g fill="currentColor">
        <path d={C_ARC} fill="none" stroke="currentColor" strokeWidth="93" mask={`url(#${maskId})`} />
        <path d={C_ARC} fill="none" stroke="currentColor" strokeWidth="93" transform="translate(1270 0)" />
        {PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
