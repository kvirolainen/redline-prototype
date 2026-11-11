import type { Meta, StoryObj } from '@storybook/react-vite';
import { JourneyPage } from '../../behind/Journey';

const meta = { title: 'Behind the build/Journey', component: JourneyPage, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof JourneyPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HorizontalTrack: Story = { args: { variant: 'track' } };
export const Swimlane: Story = { args: { variant: 'swimlane' } };
