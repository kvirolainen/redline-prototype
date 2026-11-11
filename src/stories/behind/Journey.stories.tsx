import type { Meta, StoryObj } from '@storybook/react-vite';
import { JourneyPage } from '../../behind/Journey';

const meta = { title: 'Behind the build/Journey', component: JourneyPage, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof JourneyPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Circles: Story = { args: { shape: 'circle' } };
export const IconTiles: Story = { name: 'Icon tiles', args: { shape: 'tile' } };

// The same page on an iPad, to check it fits without scrolling sideways.
export const IpadLandscape: Story = { name: 'iPad landscape (1024)', args: { shape: 'circle' }, globals: { viewport: { value: 'ipadLandscape', isRotated: false } } };
export const IpadPortrait: Story = { name: 'iPad portrait (768)', args: { shape: 'circle' }, globals: { viewport: { value: 'ipadPortrait', isRotated: false } } };
export const IpadPortraitTiles: Story = { name: 'iPad portrait (768) – icon tiles', args: { shape: 'tile' }, globals: { viewport: { value: 'ipadPortrait', isRotated: false } } };
