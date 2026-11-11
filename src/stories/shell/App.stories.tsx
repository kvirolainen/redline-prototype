import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShell } from '../../shell/AppShell';

const meta = {
  title: 'Shell/App',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One shell. The switcher at the top right picks Behind the build (the landing, with a pointer at the switcher) or one of four working screens, one per role. Clickable throughout.',
      },
    },
  },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

const ipad = (value: 'ipadLandscape' | 'ipadPortrait') => ({ viewport: { value, isRotated: false } });

export const Journey: Story = { name: 'Behind the build – Journey', args: { initialView: 'behind', initialTab: 'journey' } };
export const JourneyIpadLandscape: Story = { name: 'Journey – iPad landscape (1024)', args: { initialView: 'behind', initialTab: 'journey' }, globals: ipad('ipadLandscape') };
export const JourneyIpadPortrait: Story = { name: 'Journey – iPad portrait (768)', args: { initialView: 'behind', initialTab: 'journey' }, globals: ipad('ipadPortrait') };
export const Process: Story = { name: 'Behind the build – Process', args: { initialView: 'behind', initialTab: 'process', coach: false } };
export const ProcessIpadPortrait: Story = { name: 'Process – iPad portrait (768)', args: { initialView: 'behind', initialTab: 'process', coach: false }, globals: ipad('ipadPortrait') };
export const Architecture: Story = { name: 'Behind the build – Architecture', args: { initialView: 'behind', initialTab: 'architecture', coach: false } };
export const ArchitectureIpadPortrait: Story = { name: 'Architecture – iPad portrait (768)', args: { initialView: 'behind', initialTab: 'architecture', coach: false }, globals: ipad('ipadPortrait') };
export const Maria: Story = { name: 'Trade-in · Maria', args: { initialView: 'maria' } };
export const Dave: Story = { name: 'Back office · Dave', args: { initialView: 'dave' } };
export const Sam: Story = { name: 'Inspector · Sam', args: { initialView: 'sam' } };
export const Jordan: Story = { name: 'Ops board · Jordan', args: { initialView: 'jordan' } };
