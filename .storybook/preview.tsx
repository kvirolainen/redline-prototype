import '../src/index.css'
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    // iPad sizes in the toolbar, to check the Behind-the-build pages fit without sideways scrolling.
    viewport: {
      options: {
        ipadLandscape: { name: 'iPad landscape 1024', styles: { width: '1024px', height: '768px' }, type: 'tablet' },
        ipadPortrait: { name: 'iPad portrait 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
      },
    },

    options: {
      storySort: {
        order: ['App', 'Screens', ['Trade-in', 'Clutch ops', 'Clutch inspector', 'Back office'], 'Behind the build', ['Car journey', 'The thinking'], 'Foundations', ['Brand', 'Components']],
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
