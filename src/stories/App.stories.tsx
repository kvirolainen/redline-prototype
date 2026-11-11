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
          'One shell. The switcher at the top right picks Behind the build (the landing) or one of four working screens, one per role. Behind the build renders the same Car journey and The thinking (docs) components as the Behind the build stories. Clickable throughout.',
      },
    },
  },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Landing: Story = { name: 'Landing', args: { initialView: 'behind', initialTab: 'car-journey' } };
export const Docs: Story = { name: 'Landing · The thinking', args: { initialView: 'behind', initialTab: 'docs', coach: false } };
export const Maria: Story = { name: 'Trade-in · Maria', args: { initialView: 'maria' } };
export const Jordan: Story = { name: 'Ops board · Jordan', args: { initialView: 'jordan' } };
export const Sam: Story = { name: 'Inspector · Sam', args: { initialView: 'sam' } };
export const Dave: Story = { name: 'Back office · Dave', args: { initialView: 'dave' } };
