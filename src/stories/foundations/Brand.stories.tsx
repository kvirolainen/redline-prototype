import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Lockup, type LockupOptions } from '../../components/brand/Lockup';
import { Group, Page } from './Specimen';

// Foundations / Brand: the logo, colours and type, one story each.

const OPTIONS: { id: string; name: string; note: string; o: LockupOptions; pick?: boolean }[] = [
  {
    id: '1',
    name: '1 · Wordmark · ink Redline · divider',
    note: 'Clutch’s red wordmark, a thin divider, “Redline” in ink. Red appears once, on the parent brand.',
    o: { mark: 'wordmark', redline: 'ink', divider: true },
    pick: true,
  },
  {
    id: '2',
    name: '2 · Wordmark · red Redline · divider',
    note: 'All red. Reads as one brand block; louder in a product header.',
    o: { mark: 'wordmark', redline: 'red', divider: true },
  },
  {
    id: '3',
    name: '3 · Wordmark · ink Redline · no divider',
    note: 'The colour change alone separates the two names. Lighter, slightly less clear at small sizes.',
    o: { mark: 'wordmark', redline: 'ink', divider: false },
  },
  {
    id: '4',
    name: '4 · Wordmark · red Redline · no divider',
    note: 'Without a divider or a colour change the two words start to read as one name.',
    o: { mark: 'wordmark', redline: 'red', divider: false },
  },
  {
    id: '5',
    name: '5 · Text · red clutch · ink Redline · divider',
    note: 'Both words in Figtree. Easy to set anywhere, but loses the key notch that makes Clutch’s mark recognisable.',
    o: { mark: 'text', clutch: 'red', redline: 'ink', divider: true },
  },
  {
    id: '6',
    name: '6 · Text · ink clutch · ink Redline · divider',
    note: 'The earlier text version, now on one baseline. Quiet, but no longer looks like Clutch.',
    o: { mark: 'text', clutch: 'ink', redline: 'ink', divider: true },
  },
];

/** Two faint guides at the baseline and the ascender line, to show both words sit on the same lines. */
function Guides({ children, size }: { children: ReactNode; size: number }) {
  return (
    <span className="relative inline-block">
      <span className="pointer-events-none absolute inset-x-[-12px] border-t border-dashed border-brand/40" style={{ bottom: 0 }} aria-hidden />
      <span className="pointer-events-none absolute inset-x-[-12px] border-t border-dashed border-brand/40" style={{ bottom: size }} aria-hidden />
      <span className="block leading-none">{children}</span>
    </span>
  );
}

function LogoSpecimen() {
  return (
    <Page
      title="Logo"
      intro="One idea, “clutch | Redline”, in six versions; version 1 is the one in use. Both words sit on one baseline, and “Redline” is sized so its tall letters reach the top of the wordmark’s l, t and h (which also lines up the x-heights). The wordmark is redrawn as an SVG from Clutch’s brand file."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {OPTIONS.map((x) => (
          <section key={x.id} className={`rounded-panel border bg-white p-6 ${x.pick ? 'border-ink' : 'border-line'}`}>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-ink">{x.name}</h2>
              {x.pick && <span className="ml-auto shrink-0 rounded-pill bg-ink px-3 py-1 text-caption font-medium text-white">In the shell</span>}
            </div>
            <div className="mt-5 grid h-[120px] place-items-center rounded-card border border-line-light bg-canvas">
              <Guides size={40}>
                <Lockup {...x.o} size={40} />
              </Guides>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex h-[56px] items-center rounded-card border border-line-light bg-white px-4">
                <Lockup {...x.o} size={20} />
              </div>
              <div className="flex h-[56px] items-center rounded-card bg-ink px-4">
                <Lockup {...x.o} size={20} invert />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">{x.note}</p>
          </section>
        ))}
      </div>
      <Group label="In the header" note="Version 1 at header size, next to the switcher.">
        <div className="flex h-[68px] items-center justify-between rounded-card border border-line bg-white px-6">
          <Lockup size={20} />
          <span className="rounded-pill border border-line px-4 py-1.5 text-sm text-ink">Behind the build ▾</span>
        </div>
      </Group>
    </Page>
  );
}

const groups: { label: string; note: string; tokens: [string, string, string][] }[] = [
  {
    label: 'Brand',
    note: 'One hot coral-red. Logo, marketing CTAs, the odd highlighted word. Never a selected state.',
    tokens: [
      ['brand', '#FF464C', 'Brand red'],
      ['brand-start', '#FF6258', 'CTA gradient start'],
      ['brand-hover', '#FF686D', 'Hover (light)'],
      ['brand-dark', '#B23135', 'Hover (dark)'],
      ['brand-tint', '#FFF1F1', 'Tint'],
    ],
  },
  {
    label: 'Ink and greys',
    note: 'Near-black for headings and in-flow primary buttons; greys for secondary text and lines.',
    tokens: [
      ['ink', '#191919', 'Headings, primary pill, selected'],
      ['body', '#272727', 'Body text'],
      ['muted', '#606060', 'Secondary text'],
      ['subtle', '#ABABAB', 'Placeholder, disabled'],
      ['line', '#DDDDDD', 'Card border'],
      ['line-light', '#EEEEEE', 'Input outline, fills'],
      ['canvas', '#FAFAFA', 'Page background'],
    ],
  },
  {
    label: 'Signals',
    note: 'Green only on checks and "paid"; yellow for nudges and things waiting on a person.',
    tokens: [
      ['success', '#60BE02', 'Checks, paid'],
      ['warning', '#FBBB00', 'Needs attention'],
      ['nudge', '#FFF8E1', 'Nudge panel'],
      ['error', '#CE2929', 'Input error'],
      ['error-tint', '#FDECEC', 'Error panel'],
      ['teal', '#00817B', 'Inline link (rare)'],
    ],
  },
  {
    label: 'Accents',
    note: 'Burgundy is reserved for deals and Certified promos; warm grey for photo placeholders.',
    tokens: [
      ['burgundy', '#550E30', 'Deal badge'],
      ['burgundy-deep', '#460B28', 'Promo tile'],
      ['warm-grey', '#8A847E', 'Listing meta'],
      ['photo-bg', '#F4F2EF', 'Photo placeholder'],
      ['lavender', '#F1EDF8', 'Help band'],
    ],
  },
];

function ColoursSpecimen() {
  return (
    <Page title="Colours" intro="Neutral greys plus one coral-red, on a #FAFAFA canvas with white bordered cards.">
      {groups.map((g) => (
        <Group key={g.label} label={g.label} note={g.note}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {g.tokens.map(([name, hex, use]) => (
              <div key={name} className="overflow-hidden rounded-card border border-line bg-white">
                <div className="h-16 border-b border-line" style={{ background: `var(--color-${name})` }} />
                <div className="p-3">
                  <div className="text-sm font-medium text-ink">{name}</div>
                  <div className="text-caption text-muted">{hex}</div>
                  <div className="mt-1 text-caption text-muted">{use}</div>
                </div>
              </div>
            ))}
          </div>
        </Group>
      ))}
      <Group label="Gradients" note="Marketing CTA only, and its disabled state.">
        <div className="flex gap-3">
          <div className="bg-cta h-14 w-64 rounded-pill" />
          <div className="bg-cta-disabled h-14 w-64 rounded-pill" />
        </div>
      </Group>
    </Page>
  );
}

const scale: [string, string, string, string][] = [
  ['text-display-l font-bold', 'Display L', '56 / 70 · 700', 'We buy your trade-ins.'],
  ['text-h2 font-bold', 'H2', '40 / 50 · 700', 'How Redline works'],
  ['text-h3 font-bold', 'H3', '32 / 40 · 700', "Here's your firm offer"],
  ['text-price font-bold', 'Price', '32 / 40 · 700', '$17,850'],
  ['text-h4 font-bold', 'H4 / card title', '24 / 30 · 700', 'Awaiting pickup'],
  ['text-lead text-muted', 'Lead', '24 / 36 · 400', 'Firm pricing. Paid after pickup.'],
  ['text-title font-medium', 'Title S', '18 / 22 · 500', 'Vehicle condition'],
  ['text-base', 'Body / label', '16 / 24 · 400', "What's the approximate mileage on the car?"],
  ['text-sm', 'Body S', '14 / 21 · 400', 'The vehicle is registered to the dealership.'],
  ['text-caption font-medium', 'Caption', '12 / 15 · 500', 'PICKUP · THU NOV 12'],
];

function TypographySpecimen() {
  return (
    <Page
      title="Typography"
      intro="Clutch sets everything in Circular (400 / 500 / 700, no letter-spacing). Figtree stands in here. Headings are bold; labels medium."
    >
      <Group label="Scale">
        <div className="divide-y divide-line rounded-panel border border-line bg-white">
          {scale.map(([cls, role, spec, sample]) => (
            <div key={role} className="grid grid-cols-[160px_1fr] items-baseline gap-6 px-6 py-5">
              <div>
                <div className="text-sm font-medium text-ink">{role}</div>
                <div className="text-caption text-muted">{spec}</div>
              </div>
              <div className={`text-ink ${cls}`}>{sample}</div>
            </div>
          ))}
        </div>
      </Group>
      <Group label="Tone" note="Short, confident, plain. Speaks to the dealer as “you”. Canadian spelling: colour, licence, km.">
        <div className="grid gap-3 sm:grid-cols-3">
          {['A firm number at the desk. That’s Redline.', 'Beats auction by $1,850.', 'Rear bumper damage not declared, −$600.'].map((t) => (
            <div key={t} className="rounded-card border border-line bg-white p-6 text-base font-medium text-ink">
              {t}
            </div>
          ))}
        </div>
      </Group>
    </Page>
  );
}

const meta = { title: 'Foundations/Brand', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Logo: Story = { render: () => <LogoSpecimen /> };
export const Colours: Story = { render: () => <ColoursSpecimen /> };
export const Typography: Story = { render: () => <TypographySpecimen /> };
