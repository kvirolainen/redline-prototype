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
          'One shell. A “Viewing as” switcher at the top right picks Behind the build (the landing) or one person, each with exactly one module. Clickable throughout.',
      },
    },
  },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Journey: Story = { name: 'Behind the build – Journey', args: { initialView: 'behind', initialTab: 'journey' } };
export const Process: Story = { name: 'Behind the build – Process', args: { initialView: 'behind', initialTab: 'process' } };
export const Architecture: Story = { name: 'Behind the build – Architecture', args: { initialView: 'behind', initialTab: 'architecture' } };
export const Maria: Story = { name: 'Maria – Trade-in', args: { initialView: 'maria' } };
export const Dave: Story = { name: 'Dave – Back office', args: { initialView: 'dave' } };
export const Sam: Story = { name: 'Sam – Inspector', args: { initialView: 'sam' } };
export const Jordan: Story = { name: 'Jordan – Ops board', args: { initialView: 'jordan' } };
