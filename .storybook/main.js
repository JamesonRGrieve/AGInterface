const path = require('path');

const config = {
  stories: ['../src/app/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)', '../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },
  staticDirs: [],
  webpackFinal: async (config, { configType }) => {
    if (config.resolve)
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '..'),
      };

    return config;
  },
};
export default config;
