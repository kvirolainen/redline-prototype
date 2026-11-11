import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components/ui/Button';
import { SegmentedProgress, Stepper } from '../../components/ui/Stepper';
import { Group, Page } from './Specimen';

const STEPS = ['Basic Info', 'Features', 'Condition', 'Offer'];

function StepperDemo() {
  const [i, setI] = useState(1);
  return (
    <Page title="Stepper" intro="Header breadcrumb with a thin black progress line, as in the sell flow. The dialog variant is a segmented bar.">
      <Group label="Flow header">
        <div className="overflow-hidden rounded-card border border-line">
          <Stepper steps={STEPS} current={i} />
          <div className="flex items-center justify-between bg-canvas px-6 py-6">
            <Button variant="ghost" onClick={() => setI(Math.max(0, i - 1))}>
              ← Back
            </Button>
            <Button onClick={() => setI(Math.min(STEPS.length - 1, i + 1))}>Continue</Button>
          </div>
        </div>
      </Group>
      <Group label="Segmented progress (dialogs)">
        <div className="max-w-[440px] rounded-panel border border-line bg-white p-6">
          <SegmentedProgress total={4} done={i + 1} />
          <p className="mt-4 text-title font-bold text-ink">{STEPS[i]}</p>
        </div>
      </Group>
    </Page>
  );
}

const meta = { title: 'Foundations/Stepper', component: StepperDemo, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof StepperDemo>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
