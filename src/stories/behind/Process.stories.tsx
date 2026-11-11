import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Process } from '../../behind/Process';

const meta = {
  title: 'Behind the build/Process',
  component: Process,
  parameters: { layout: 'fullscreen' },
  args: { onOpenDoc: fn() },
} satisfies Meta<typeof Process>;
export default meta;

// Named like the component so the sidebar shows a single "Process" entry. In the app, "Read" opens the Docs tab.
export const Process_: StoryObj<typeof meta> = { name: 'Process', args: { initial: 'research' } };
