import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocBody, DocsViewer } from '../../behind/DocsViewer';

// Title repeats the tab label (DOCS_TAB_LABEL in src/shell/views.ts); Storybook needs a literal here.
const meta = {
  title: 'Behind the build/The thinking',
  component: DocsViewer,
  parameters: { layout: 'fullscreen' },
  // The shell gives the page the full height under its header; this does the same here.
  decorators: [(Story) => <div className="flex min-h-screen flex-col"><Story /></div>],
} satisfies Meta<typeof DocsViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

// One story per document in docs/, in reading order. Empty ones show "Coming next".
export const Concept: Story = { args: { initial: 'concept' } };
export const DeskOrOnline: Story = { name: 'Desk or online?', args: { initial: 'desk-or-online' } };
export const TheApp: Story = { name: 'The app', args: { initial: 'the-app' } };
export const ClutchsLook: Story = { name: 'Clutch’s look', args: { initial: 'clutchs-look' } };
export const Prototypes: Story = { args: { initial: 'prototypes' } };
export const Architecture: Story = { args: { initial: 'architecture' } };
export const TestReport: Story = { name: 'Test report', args: { initial: 'test-report' } };
export const DealerResearch: Story = { name: 'Dealer research', args: { initial: 'dealer-research' } };
export const DecisionsLog: Story = { name: 'Decisions log', args: { initial: 'decisions' } };

const DEMO = `# Embeds demo

Every block a document can embed, one of each. Each directive sits on its own line.

## One screen

::screen[trade-in/B]

## A phone screen

::screen[inspector/B]

## All three variants

::screens[ops-board]

## Diagram

::diagram[architecture]

## Image

![Trade-in · A · Step by step, captured at iPad size](img/demo-trade-in-A.png)

## Unknown directive

::screen[trade-in/D]
`;

/** Renders an inline markdown string through the same body renderer the documents use. */
export const EmbedsDemo: Story = {
  name: 'Embeds demo',
  render: () => (
    <div className="min-w-0 bg-white px-6 py-8 lg:px-12 lg:py-10">
      <DocBody body={DEMO} />
    </div>
  ),
};
