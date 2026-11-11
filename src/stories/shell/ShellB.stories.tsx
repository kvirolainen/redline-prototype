import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellSidebar } from '../../shell/ShellSidebar';

const meta = {
  title: 'Shell/Variant B',
  component: ShellSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Left sidebar with two sections: Demo personas (with their modules) and Behind the build pages.' } },
  },
} satisfies Meta<typeof ShellSidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = { args: { initial: { kind: 'demo', persona: 'sam', module: 'inspector' } } };
export const BehindTheBuild: Story = { name: 'Behind the build', args: { initial: { kind: 'behind', page: 'architecture' } } };
