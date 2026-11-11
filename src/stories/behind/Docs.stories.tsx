import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsViewer } from '../../behind/DocsViewer';

const meta = {
  title: 'Behind the build/Docs',
  component: DocsViewer,
  parameters: { layout: 'fullscreen' },
  // The shell gives the page the full height under its header; this does the same here.
  decorators: [(Story) => <div className="flex min-h-screen flex-col"><Story /></div>],
} satisfies Meta<typeof DocsViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

// One story per document in docs/. Empty ones show "Coming next".
export const Concept: Story = { args: { initial: 'concept' } };
export const Prototypes: Story = { args: { initial: 'prototypes' } };
export const BuildPlan: Story = { name: 'Build plan', args: { initial: 'build-plan' } };
export const TestReport: Story = { name: 'Test report', args: { initial: 'test-report' } };
export const DecisionsLog: Story = { name: 'Decisions log', args: { initial: 'decisions' } };
