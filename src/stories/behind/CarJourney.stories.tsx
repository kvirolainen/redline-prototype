import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CarJourney } from '../../behind/CarJourney';

const meta = {
  title: 'Behind the build/Car journey',
  component: CarJourney,
  parameters: { layout: 'fullscreen' },
  args: { onPick: fn() },
} satisfies Meta<typeof CarJourney>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Circles: Story = { args: { shape: 'circle' } };
export const IconTiles: Story = { name: 'Icon tiles', args: { shape: 'tile' } };
