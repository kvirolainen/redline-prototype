import type { Meta, StoryObj } from '@storybook/react-vite';
import { Architecture } from '../../behind/Architecture';

const meta = { title: 'Behind the build/Architecture', component: Architecture, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Architecture>;
export default meta;

// Named like the component so the sidebar shows a single "Architecture" entry.
export const Architecture_: StoryObj<typeof meta> = { name: 'Architecture' };
