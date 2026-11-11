import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OptionCard } from '../../components/ui/OptionCard';
import { Group, Page } from './Specimen';

const DAMAGE: { id: string; title: string; helper?: string }[] = [
  { id: 'minor', title: 'Minor cosmetic damage', helper: 'Smaller than a golf ball' },
  { id: 'moderate', title: 'Moderate damage', helper: 'Larger than a golf ball' },
  { id: 'glass', title: 'Chipped or cracked glass' },
  { id: 'none', title: 'No exterior damage' },
];

function OptionCards() {
  const [damage, setDamage] = useState('minor');
  const [features, setFeatures] = useState<string[]>(['rims']);
  const toggle = (f: string) => setFeatures((xs) => (xs.includes(f) ? xs.filter((x) => x !== f) : [...xs, f]));
  return (
    <Page title="Option cards" intro="Every answer is a full-width bordered card. Selected is a black border with a black control — not red.">
      <div className="grid gap-10 md:grid-cols-2">
        <Group label="Single choice" note="Does the vehicle have any exterior damage?">
          <div className="space-y-3">
            {DAMAGE.map((d) => (
              <OptionCard key={d.id} title={d.title} helper={d.helper} selected={damage === d.id} onClick={() => setDamage(d.id)} />
            ))}
          </div>
        </Group>
        <Group label="Multiple choice" note="Select any additional features the car has">
          <div className="space-y-3">
            {[
              ['rims', 'Aftermarket rims'],
              ['wrap', 'Coloured wrap'],
              ['exhaust', 'Exhaust'],
              ['stereo', 'Stereo'],
            ].map(([id, t]) => (
              <OptionCard key={id} multi title={t} selected={features.includes(id)} onClick={() => toggle(id)} />
            ))}
          </div>
        </Group>
      </div>
    </Page>
  );
}

const meta = { title: 'Foundations/Option cards', component: OptionCards, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof OptionCards>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
