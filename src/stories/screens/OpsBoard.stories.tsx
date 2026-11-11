import type { Meta, StoryObj } from '@storybook/react-vite';
import { VariantA } from '../../modules/ops-board/VariantA';
import { VariantB } from '../../modules/ops-board/VariantB';
import { VariantC } from '../../modules/ops-board/VariantC';

// Ops board · Jordan, Clutch ops, on a desktop. Shown on a pickup day (Thu Nov 12, 11:40) while the runs are out.

const meta = {
  title: 'Screens/Ops board',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        desktop1280: { name: 'Desktop 1280', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
        ipadLandscape: { name: 'iPad landscape 1024', styles: { width: '1024px', height: '768px' }, type: 'tablet' },
        ipadPortrait: { name: 'iPad portrait 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
      },
    },
    docs: {
      description: {
        component:
          "Jordan plans and watches pickup runs across dealers: which dealer, which day, how many cars, which inspector and truck, and what's stuck. Each variant can move a car or a whole run to another day, and assign an inspector to the run that has none.",
      },
    },
  },
  globals: { viewport: { value: 'desktop1280', isRotated: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const WeekGrid: Story = {
  name: 'A · Week grid',
  render: () => <VariantA />,
  parameters: {
    docs: {
      description: {
        story:
          'Dealers as rows, run days as columns; each cell is one run with a dot per car, and a click opens the run to reassign the inspector or move cars. Best for planning the next two weeks; today\'s live progress is only a count.',
      },
    },
  },
};

export const TodaysRuns: Story = {
  name: "B · Today's runs",
  render: () => <VariantB />,
  parameters: {
    docs: {
      description: {
        story:
          'One card per truck with its stops in driving order, ETAs and live inspection progress, plus a rail of what needs ops. Best for watching the day; planning next week needs another screen.',
      },
    },
  },
};

export const ExceptionsFirst: Story = {
  name: 'C · Exceptions first',
  render: () => <VariantC />,
  parameters: {
    docs: {
      description: {
        story:
          'The page is the queue of what needs ops now, each item with one action; a small two-week calendar beside it shows where each item lands. Fastest to act on; the runs themselves are only a summary.',
      },
    },
  },
};
