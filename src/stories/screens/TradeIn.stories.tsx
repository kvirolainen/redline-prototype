import type { Meta, StoryObj } from '@storybook/react-vite';
import { TradeInVariantA } from '../../modules/trade-in/VariantA';
import { TradeInVariantB } from '../../modules/trade-in/VariantB';
import { TradeInVariantC } from '../../modules/trade-in/VariantC';

const meta = {
  title: 'Screens/Trade-in',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Maria, Sales Manager at Yorkdale Honda, on an iPad at the sales desk with the customer sitting there. Goal: a firm offer in under two minutes, sent to next Thursday’s pickup. Try the 2019 Civic for the firm offer, and the 2013 F-150 (over 200,000 km) for the guaranteed floor.',
      },
    },
  },
  globals: { viewport: { value: 'ipadLandscape', isRotated: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const StepByStep: Story = {
  name: 'A · Step by step',
  render: () => <TradeInVariantA />,
  parameters: {
    docs: {
      description: {
        story:
          'Clutch’s own sell flow (Basic info › Features › Condition › Offer) with a sticky “Your vehicle” card and honesty nudges. Familiar and thorough, but it’s four screens before the customer hears a number.',
      },
    },
  },
};

export const OnePageLiveOffer: Story = {
  name: 'B · One page, live offer',
  render: () => <TradeInVariantB />,
  parameters: {
    docs: {
      description: {
        story:
          'VIN and km on top, every question on one scroll, and an offer panel that narrows from a range to a firm number as she answers. Fastest for a practised user; denser for a first-timer.',
      },
    },
  },
};

export const QuickQuoteFirst: Story = {
  name: 'C · Quick quote first',
  render: () => <TradeInVariantC />,
  parameters: {
    docs: {
      description: {
        story:
          'VIN and km give a range in seconds to start the conversation; “Firm it up” then asks only the five questions that move the price and assumes the rest. Quickest to a number; the assumptions carry more re-price risk on pickup day.',
      },
    },
  },
};
