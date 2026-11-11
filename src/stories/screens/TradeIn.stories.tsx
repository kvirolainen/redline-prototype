import type { Meta, StoryObj } from '@storybook/react-vite';
import { TradeInVariantA } from '../../modules/trade-in/VariantA';
import { TradeInVariantB } from '../../modules/trade-in/VariantB';
import { TradeInVariantB2 } from '../../modules/trade-in/VariantB2';
import { TradeInVariantC } from '../../modules/trade-in/VariantC';

const meta = {
  title: 'Screens/Trade-in',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Maria, Sales Manager at Yorkdale Honda, on the laptop at the sales desk, with the customer looking at the same screen. Goal: a firm offer in under two minutes. B2 is the picked version; A, B and C are the three explored first, kept for the record. Try the 2019 Civic for a firm offer and the 2013 F-150 (over 200,000 km) for a car Clutch prices by hand.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const OneScreen: Story = {
  name: 'B2 · One screen',
  render: () => <TradeInVariantB2 />,
  parameters: {
    docs: {
      description: {
        story:
          'B, refined. Clutch’s full sell-flow question list (15 that apply to a dealer), each always in the same place, in two columns that fit 1440 × 900 and 1280 × 800 with no scroll. Answer in any order, even before the VIN. The price appears once, when everything is in, so nobody watches it move. Nothing on screen is meant only for the dealer. A car Clutch can’t price instantly says why and when the offer comes. The confirmation follows Clutch’s firm-offer card and links on to Back office.',
      },
    },
  },
};

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
