import { Controls, Description, Primary, Stories, Subtitle, Title } from '@storybook/blocks';
import { initialize, mswLoader } from 'msw-storybook-addon';
import React from 'react';
import './../src/app/globals.css'; // Import global styles for the app

initialize({
  onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
});
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories />
        </>
      ),
    },
    nextjs: {
      appDirectory: true, // Set to true if your project uses the app directory
    },
    loaders: [mswLoader],
  },
};

export default preview;
