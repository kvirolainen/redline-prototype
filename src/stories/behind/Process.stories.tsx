import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProcessPage } from '../../behind/Process';

const meta = { title: 'Behind the build/Process', component: ProcessPage, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ProcessPage>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
