import type { Meta, StoryObj } from '@storybook/react-vite';
import { Lockup, type LockupVariant } from '../../components/brand/Lockup';
import { Group, Page } from './Specimen';

const OPTIONS: { variant: LockupVariant; name: string; pattern: string; reads: string; pick?: boolean }[] = [
  {
    variant: 'divider',
    name: 'A · clutch | Redline',
    pattern: 'Parent wordmark, thin divider, product name. The sub-product lockup used for products inside a larger brand (Stripe | Atlas style).',
    reads: 'A Clutch product called Redline. Clutch leads, which matters when the dealer is trusting Clutch’s money.',
    pick: true,
  },
  {
    variant: 'by',
    name: 'B · Redline by Clutch',
    pattern: 'Endorsed brand: the product name leads and the parent signs off small underneath (“by …”, “from …”).',
    reads: 'Redline as its own brand, vouched for by Clutch. Suits a product that may stand apart later.',
  },
  {
    variant: 'descriptor',
    name: 'C · clutch for Dealers',
    pattern: 'Parent wordmark plus an audience descriptor, as in “Uber for Business” or “Slack for Enterprise”.',
    reads: 'Clearest about who it’s for, but drops the Redline name entirely.',
  },
  {
    variant: 'tag',
    name: 'D · clutch + REDLINE tag',
    pattern: 'Parent wordmark with a small badge, the way plan or edition tags sit next to a logo in an app header.',
    reads: 'Compact and bold, but a badge reads like a tier or a beta flag rather than a product.',
  },
];

function LogoLockups() {
  return (
    <Page
      title="Logo lockups"
      intro="How to sign a Clutch sub-product. The “clutch” wordmark is styled text (Figtree, bold, lowercase, ink), standing in for the real logo. Option A is used in the app shell."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {OPTIONS.map((o) => (
          <section key={o.variant} className={`rounded-panel border bg-white p-6 ${o.pick ? 'border-ink' : 'border-line'}`}>
            <div className="flex items-center gap-3">
              <h2 className="text-title font-bold text-ink">{o.name}</h2>
              {o.pick && <span className="ml-auto rounded-pill bg-ink px-3 py-1 text-caption font-medium text-white">Recommended</span>}
            </div>
            <div className="mt-5 grid h-[120px] place-items-center rounded-card border border-line-light bg-canvas">
              <Lockup variant={o.variant} size={34} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex h-[56px] items-center rounded-card border border-line-light bg-white px-4">
                <Lockup variant={o.variant} size={22} />
              </div>
              <div className="flex h-[56px] items-center rounded-card bg-ink px-4">
                <Lockup variant={o.variant} size={22} invert />
              </div>
            </div>
            <p className="mt-4 text-sm text-body">
              <span className="font-bold text-ink">Pattern. </span>
              {o.pattern}
            </p>
            <p className="mt-2 text-sm text-muted">{o.reads}</p>
          </section>
        ))}
      </div>
      <Group label="In the header" note="Option A at header size, next to the “Viewing as” switcher.">
        <div className="flex h-[68px] items-center justify-between rounded-card border border-line bg-white px-6">
          <Lockup variant="divider" size={24} />
          <span className="rounded-pill border border-line px-4 py-1.5 text-sm text-muted">Viewing as …</span>
        </div>
      </Group>
    </Page>
  );
}

const meta = { title: 'Foundations/Logo lockups', component: LogoLockups, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof LogoLockups>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
