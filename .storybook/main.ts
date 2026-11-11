import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/react-vite",
  // Clutch's icon in the browser tab, from public/ (shared with the app).
  "staticDirs": ["../public"],
  managerHead: (head) => `${head}
    <link rel="icon" href="./favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />`,
  // Previews are opened through a temporary public tunnel on *.trycloudflare.com.
  "core": { "allowedHosts": [".trycloudflare.com"] },
  // Previews are opened through a temporary public tunnel, so accept any host.
  async viteFinal(config) {
    config.server = { ...config.server, allowedHosts: true };
    return config;
  }
};
export default config;