import type { Meta, StoryObj } from '@storybook/react-vite';
import { JourneyPage } from '../../behind/Journey';

const meta = { title: 'Behind the build/Journey', component: JourneyPage, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof JourneyPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Circles: Story = { args: { shape: 'circle' } };
export const IconTiles: Story = { name: 'Icon tiles', args: { shape: 'tile' } };
