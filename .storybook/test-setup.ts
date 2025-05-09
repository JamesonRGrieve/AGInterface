/**
 * This file sets up the necessary global mocks for Storybook
 */

import { vi } from '@storybook/test';

// Create global Jest-compatible mocks
global.jest = {
  spyOn: (obj, method) => {
    const original = obj[method];
    obj[method] = vi.fn();

    // Add mock implementation method
    obj[method].mockImplementation = (impl) => {
      obj[method] = vi.fn(impl);
      return obj[method];
    };

    // Add cleanup method
    obj[method].mockRestore = () => {
      obj[method] = original;
    };

    return obj[method];
  },
};
