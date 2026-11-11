import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components/ui/Button';
import { Group, Page } from './Specimen';

function Buttons() {
  return (
    <Page
      title="Buttons"
      intro="All buttons are 32px pills. Inside the product the primary action is black; the red gradient is kept for marketing CTAs, as on clutch.ca."
    >
      <Group label="In product" note="Black primary, outline secondary, a text “Back” link.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Continue</Button>
          <Button>Get offer</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="ghost">← Back</Button>
          <Button disabled>Continue</Button>
        </div>
      </Group>
      <Group label="Small dark pill" note="Card headers and table actions.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="dark-small">Approve</Button>
          <Button variant="dark-small">Open car</Button>
        </div>
      </Group>
      <Group label="Marketing CTA" note="Red gradient. Landing pages only — never inside a flow.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="marketing">Get instant offer</Button>
          <Button variant="marketing" disabled>
            Get instant offer
          </Button>
        </div>
      </Group>
      <Group label="Segmented control">
        <div className="inline-flex rounded-pill bg-line-light p-1 text-sm font-medium">
          <span className="rounded-pill bg-white px-4 py-2 text-ink">VIN</span>
          <span className="px-4 py-2 text-muted">Licence plate</span>
        </div>
      </Group>
    </Page>
  );
}

const meta = { title: 'Foundations/Buttons', component: Buttons, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Buttons>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
