import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Group, Page } from './Specimen';

function Inputs() {
  return (
    <Page title="Inputs" intro="56px fields. Light #EEEEEE outline at rest, dark on hover. Errors in red under the field; soft nudges in a pale-yellow panel.">
      <div className="grid gap-10 md:grid-cols-2">
        <Group label="Flow fields">
          <div className="space-y-6">
            <Field label="What's the approximate mileage on the car?" suffix="km" placeholder="68,400" />
            <Field label="VIN" defaultValue="2HGFC2F69KH512345" />
            <Field label="Mileage" suffix="km" error="Required" />
            <Field
              label="Mileage"
              suffix="km"
              defaultValue="600,000"
              nudge="Hmmm, that looks high for the car's age. Make sure it's right so the offer holds at pickup."
            />
          </div>
        </Group>
        <Group label="Pill row (landing forms)">
          <div className="flex flex-wrap items-center gap-3 rounded-[32px] border border-line bg-white p-4">
            <Field shape="pill" placeholder="VIN or licence plate" className="min-w-[240px] flex-1" />
            <Button variant="marketing" className="!h-14 !px-8 !text-base">
              Get offer
            </Button>
          </div>
        </Group>
      </div>
    </Page>
  );
}

const meta = { title: 'Foundations/Inputs', component: Inputs, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Inputs>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
