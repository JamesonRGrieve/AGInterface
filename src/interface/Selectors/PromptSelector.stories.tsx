import { Meta, StoryContext, StoryObj } from '@storybook/react';
import React from 'react';
import { SWRConfig } from 'swr';
import PromptSelector from './PromptSelector';

// Mock data for prompts
const mockPrompts = [
  {
    id: 'prompt-1',
    name: 'Customer Support',
    content: 'You are a helpful customer support agent...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-2',
    name: 'Marketing Copy',
    content: 'You are a creative marketing copywriter...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-3',
    name: 'Technical Documentation',
    content: 'You are a technical writer specializing in documentation...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock state management
const mockRouter = { push: () => {} };
let mockPathname = '/chat';
const mockSearchParams = new URLSearchParams();
mockSearchParams.set('prompt', 'Customer Support');
mockSearchParams.set('category', 'Default');

// Mock the context
const mockInteractiveConfigContext = {
  config: {},
  setConfig: () => {},
};

// Create mock data and error states
let mockPromptsData = mockPrompts;
let mockPromptsError = null;

// Mock the modules using object properties
const nextNavigationMock = {
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
};

const usePromptMock = {
  usePrompts: () => ({
    data: mockPromptsData,
    error: mockPromptsError,
  }),
};

const usePathnameMock = () => mockPathname;

const interactiveConfigContextMock = {
  InteractiveConfigContext: React.createContext(mockInteractiveConfigContext),
};

// Set up module mocks
import * as UsePathname from '@/auth/hooks/usePathname';
import * as InteractiveConfig from '@/interactive/InteractiveConfigContext';
import * as NextNavigation from 'next/navigation';
import * as UsePrompt from '../hooks/usePrompt';

// Override module functionality
Object.defineProperty(NextNavigation, 'useRouter', {
  value: nextNavigationMock.useRouter,
});
Object.defineProperty(NextNavigation, 'useSearchParams', {
  value: nextNavigationMock.useSearchParams,
});
Object.defineProperty(UsePrompt, 'usePrompts', {
  value: usePromptMock.usePrompts,
});
Object.defineProperty(UsePathname, 'default', {
  value: usePathnameMock,
});
Object.defineProperty(InteractiveConfig, 'InteractiveConfigContext', {
  value: interactiveConfigContextMock.InteractiveConfigContext,
});

const meta: Meta<typeof PromptSelector> = {
  title: 'Components/PromptSelector',
  component: PromptSelector,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context: StoryContext) => {
      // Reset to defaults
      mockPromptsData = mockPrompts;
      mockPromptsError = null;
      mockPathname = '/chat';

      // Set category in search params
      if (context.args.category) {
        mockSearchParams.set('category', context.args.category);
      }

      // Update search params for value if provided
      if (context.args.value) {
        mockSearchParams.set('prompt', context.args.value);
      }

      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          <div style={{ padding: '1rem', width: '300px' }}>
            <Story />
          </div>
        </SWRConfig>
      );
    },
  ],
  argTypes: {
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof PromptSelector>;

// Configure mocks for different scenarios
function configureMocks(options: { emptyPrompts?: boolean; pathInSettings?: boolean }) {
  if (options.emptyPrompts) {
    mockPromptsData = [];
  } else {
    mockPromptsData = mockPrompts;
  }

  if (options.pathInSettings) {
    mockPathname = '/settings/prompts';
  } else {
    mockPathname = '/chat';
  }
}

export const Default: Story = {
  args: {
    category: 'Default',
  },
};

export const WithCustomValue: Story = {
  args: {
    category: 'Default',
    value: 'Marketing Copy',
  },
};

export const WithCustomCategory: Story = {
  args: {
    category: 'Technical',
    value: 'Technical Documentation',
  },
};

export const WithCustomOnChange: Story = {
  args: {
    category: 'Default',
    onChange: (value: string) => console.log('onChange called with', value),
  },
};

export const InSettingsPage: Story = {
  args: {
    category: 'Default',
  },
  decorators: [
    (Story) => {
      configureMocks({ pathInSettings: true });
      return <Story />;
    },
  ],
};

export const WithRouterNavigation: Story = {
  args: {
    category: 'Default',
  },
};

export const EmptyPrompts: Story = {
  args: {
    category: 'Default',
  },
  decorators: [
    (Story) => {
      configureMocks({ emptyPrompts: true });
      return <Story />;
    },
  ],
};
