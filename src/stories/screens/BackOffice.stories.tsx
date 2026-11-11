import type { Meta, StoryObj } from '@storybook/react-vite';
import { VariantA } from '../../modules/back-office/VariantA';
import { VariantB } from '../../modules/back-office/VariantB';
import { VariantB2 } from '../../modules/back-office/VariantB2';
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

export const B2: Story = {
  name: 'B2 · Pickups (default tab)',
  render: () => <VariantB2 />,
  parameters: {
    docs: {
      description: {
        story:
          "B reworked into one page with two tabs, in Trade-in's look (white panels, 16px text, outline pills). Pickups opens first: every car by pickup, the readiness check (three ticks, ready only when all are ticked), open offers. Anything urgent (a re-price waiting, an offer about to lapse, a car not ready close to its deadline) gets the yellow edge, and each tab counts its urgent items.",
      },
    },
  },
};

export const B2Overview: Story = {
  name: 'B2 · Overview',
  render: () => <VariantB2 initialTab="overview" />,
  parameters: {
    docs: {
      description: {
        story: "Dave's tab: re-prices waiting on him across the top, then the results as plain facts, this week's pickups at a glance and the latest re-prices.",
      },
    },
  },
};
