import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellHub } from '../../shell/ShellHub';

const meta = {
  title: 'Shell/Variant C',
  component: ShellHub,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Landing-first hub: the car journey and four persona cards up front, Behind the build in a slim top bar.' } },
  },
} satisfies Meta<typeof ShellHub>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Hub: Story = { args: { initial: { kind: 'hub' } } };
export const Demo: Story = { args: { initial: { kind: 'demo', persona: 'dave', module: 'back-office' } } };
export const BehindTheBuild: Story = { name: 'Behind the build', args: { initial: { kind: 'behind', page: 'process' } } };
