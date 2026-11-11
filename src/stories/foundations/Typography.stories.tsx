import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group, Page } from './Specimen';

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

function Typography() {
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

const meta = { title: 'Foundations/Typography', component: Typography, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Typography>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
