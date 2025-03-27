const path = require('path');

const config = {
  stories: ['../app/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)', '../components/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)', '../interface/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)', '../interactive/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)', '../iteration/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)'],
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
    if (config.resolve) {
      const rootDir = path.resolve(__dirname, '..');
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': rootDir,
        '@/jrg': path.resolve(rootDir, 'components/jrg'),
        '@/next-log': path.resolve(rootDir, 'components/jrg/next-log/src'),
        '@/zod2gql': path.resolve(rootDir, 'components/jrg/zod2gql/src'),
        '@/auth': path.resolve(rootDir, 'components/jrg/auth/src'),
        '@/appwrapper': path.resolve(rootDir, 'components/jrg/appwrapper/src'),
        '@/dynamic-form': path.resolve(rootDir, 'components/jrg/dynamic-form/src'),
        '@/interactive': path.resolve(rootDir, 'interactive/src'),
        '@/interface': path.resolve(rootDir, 'interface'),
        '@/iteration': path.resolve(rootDir, 'iteration'),
      };
    }

    return config;
  },
};
export default config;
