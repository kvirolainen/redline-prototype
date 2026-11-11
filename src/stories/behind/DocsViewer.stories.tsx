import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsViewer } from '../../behind/DocsViewer';

const meta = { title: 'Behind the build/Docs viewer', component: DocsViewer, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof DocsViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Concept: Story = { args: { initial: 'concept' } };
export const Decisions: Story = { args: { initial: 'decisions' } };
export const ComingNext: Story = { name: 'Coming next', args: { initial: 'build-plan' } };
