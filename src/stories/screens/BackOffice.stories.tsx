import type { Meta, StoryObj } from '@storybook/react-vite';
import { VariantA } from '../../modules/back-office/VariantA';
import { VariantB } from '../../modules/back-office/VariantB';
import { VariantC } from '../../modules/back-office/VariantC';

const meta = {
  title: 'Screens/Back office',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        desktop1280: { name: 'Desktop 1280', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
      },
    },
    docs: {
      description: {
        component:
          "Dave's view at Yorkdale Honda on pickup day: every car sold to Clutch, where it is, and what needs the dealer. The Civic's re-price waits for his call (accept → confirmed, decline → the car stays), and the Rogue's offer expires tomorrow (one-click refresh). Each car opens a timeline of its events.",
      },
    },
  },
  globals: { viewport: { value: 'desktop1280', isRotated: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const A: Story = {
  name: 'A · Table first',
  render: () => <VariantA />,
  parameters: {
    docs: {
      description: {
        story:
          'Value strip, then a notice per thing that needs Dave, then the cars table defaulting to Awaiting pickup; a row opens the timeline. Familiar and dense, but the decision sits one click away in a side panel.',
      },
    },
  },
};

export const B: Story = {
  name: 'B · Needs you inbox',
  render: () => <VariantB />,
  parameters: {
    docs: {
      description: {
        story:
          'A "Needs you" column where the re-price and the expiring offer are decided in place, next to the full car list grouped by pickup day. Fastest to act on, at the cost of a narrower list.',
      },
    },
  },
};

export const C: Story = {
  name: 'C · Pipeline board',
  render: () => <VariantC />,
  parameters: {
    docs: {
      description: {
        story:
          'Columns by stage, from offer made to paid, with a card per car; the re-price column lights up when it holds a car. Shows the flow of cars at a glance, but columns get tight on an iPad and long lists scroll.',
      },
    },
  },
};
