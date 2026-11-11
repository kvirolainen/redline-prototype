import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProcessPage } from '../../behind/Process';

const meta = { title: 'Behind the build/Process', component: ProcessPage, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ProcessPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Concept: Story = { name: 'Concept open', args: { initial: 'concept' } };
export const Research: Story = { name: 'Research open', args: { initial: 'research' } };
