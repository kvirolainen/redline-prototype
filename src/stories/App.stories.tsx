import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShell } from '../shell/AppShell';

const meta = {
  title: 'App',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One shell. The switcher at the top right picks Behind the build (the landing) or one of four modules, one per role. Behind the build renders the same Car journey and The thinking (docs) components as the Behind the build stories. Clickable throughout.',
      },
    },
  },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Landing: Story = { name: 'Landing', args: { initialView: 'behind', initialTab: 'car-journey' } };
export const Docs: Story = { name: 'Landing · The thinking', args: { initialView: 'behind', initialTab: 'docs' } };
export const Maria: Story = { name: 'Trade-in · Maria', args: { initialView: 'maria' } };
export const Dave: Story = { name: 'Back office · Dave', args: { initialView: 'dave' } };
export const Sam: Story = { name: 'Clutch inspector · Sam', args: { initialView: 'sam' } };
export const Jordan: Story = { name: 'Clutch ops · Jordan', args: { initialView: 'jordan' } };
