import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArchitecturePage } from '../../behind/Architecture';

const meta = { title: 'Behind the build/Architecture', component: ArchitecturePage, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ArchitecturePage>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
