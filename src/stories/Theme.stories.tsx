import type { Meta, StoryObj } from '@storybook/react-vite';

const colors = [
  'brand', 'brand-start', 'brand-dark', 'ink', 'body', 'muted', 'subtle',
  'line', 'line-light', 'canvas', 'burgundy', 'success', 'warning', 'error', 'teal',
];

function Theme() {
  return (
    <div className="space-y-8 p-6">
      <section>
        <h2 className="mb-3 text-xl font-bold text-ink">Colours</h2>
        <div className="grid grid-cols-5 gap-3">
          {colors.map((c) => (
            <div key={c} className="rounded-card border border-line bg-white p-2">
              <div className="h-12 rounded-badge" style={{ background: `var(--color-${c})` }} />
              <div className="mt-2 text-sm text-muted">{c}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-bold text-ink">Type</h2>
        <p className="text-3xl font-bold text-ink">Here's your firm offer</p>
        <p className="text-body">Body text for questions and descriptions.</p>
        <p className="text-sm text-muted">Muted helper text.</p>
      </section>
      <section className="flex gap-3">
        <button className="rounded-pill bg-ink px-6 py-3 font-semibold text-white">Continue</button>
        <button className="rounded-pill bg-cta px-6 py-3 font-semibold text-white">Get my offer</button>
        <button className="rounded-pill border border-line bg-white px-6 py-3 font-semibold text-ink">Back</button>
      </section>
    </div>
  );
}

const meta = { title: 'Foundations/Theme', component: Theme } satisfies Meta<typeof Theme>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
