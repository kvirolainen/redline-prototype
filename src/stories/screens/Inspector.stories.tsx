import type { Meta, StoryObj } from '@storybook/react-vite';
import { InspectorVariantA } from '../../modules/inspector/VariantA';
import { InspectorVariantB } from '../../modules/inspector/VariantB';
import { InspectorVariantC } from '../../modules/inspector/VariantC';

// Sam, Clutch inspector, on a phone in a dealer's lot. Thursday run, three dealers, six cars.
// The 2019 Honda Civic EX is the mismatch (cracked windshield + repainted rear bumper → $16,950);
// any car can be marked "Not ready" and rolls to next Thursday.
const meta = {
  title: 'Screens/Clutch inspector',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        phone390: { name: 'Phone 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
      },
    },
    docs: {
      description: {
        component:
          "Today's run → at each dealer, check each car against what the dealer declared → Confirm, Re-price (with reason and photo) or Not ready. Try the Civic for a re-price, the RAV4 for a clean confirm, and Not ready on the CR-V.",
      },
    },
  },
  globals: { viewport: { value: 'phone390', isRotated: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const A: Story = {
  name: 'A · Run, car, checklist',
  render: () => <InspectorVariantA />,
  parameters: {
    docs: {
      description: {
        story:
          'A run list by dealer, then one checklist per car with the declared answer next to a Match / Different toggle, and an outcome sheet at the end. Familiar and easy to scan, but every one of the 10 checks takes a tap.',
      },
    },
  },
};

export const B: Story = {
  name: 'B · One car at a time',
  render: () => <InspectorVariantB />,
  parameters: {
    docs: {
      description: {
        story:
          'A focused flow: one question per screen with the declared answer shown big, a running price at the top that drops as differences add up. Hardest to get wrong one-handed; slower for a clean car and the run overview is one level away.',
      },
    },
  },
};

export const C: Story = {
  name: 'C · Exceptions only',
  render: () => <InspectorVariantC />,
  parameters: {
    docs: {
      description: {
        story:
          'Checks grouped into five areas, each collapsed with one "All match" tap; only an area with a difference opens for detail and a photo. Fastest for the common clean car (5 taps); relies on the inspector really walking each area.',
      },
    },
  },
};
