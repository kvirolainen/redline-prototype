import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellTopBar } from '../../shell/ShellTopBar';

const meta = {
  title: 'Shell/Variant A',
  component: ShellTopBar,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Top bar with a Demo / Behind-the-build switch and a persona dropdown; second row holds modules or pages.' } },
  },
} satisfies Meta<typeof ShellTopBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = { args: { initialMode: 'demo', initialPersona: 'maria' } };
export const BehindTheBuild: Story = { name: 'Behind the build', args: { initialMode: 'behind', initialPage: 'journey' } };
