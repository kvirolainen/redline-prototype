import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Lockup, type LockupOptions } from '../../components/brand/Lockup';
import { Group, Page } from './Specimen';

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

function LogoLockups() {
  return (
    <Page
      title="Logo lockups"
      intro="One idea, “clutch | Redline”, in six versions. Both words sit on one baseline, and “Redline” is sized so its tall letters reach the top of the wordmark’s l, t and h (which also lines up the x-heights). The wordmark is redrawn as an SVG from Clutch’s brand file. Version 1 is used in the app shell."
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

const meta = { title: 'Foundations/Logo lockups', component: LogoLockups, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof LogoLockups>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
