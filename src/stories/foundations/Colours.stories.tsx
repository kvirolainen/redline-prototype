import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Page } from './Specimen';

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

function Colours() {
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

const meta = { title: 'Foundations/Colours', component: Colours, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Colours>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
