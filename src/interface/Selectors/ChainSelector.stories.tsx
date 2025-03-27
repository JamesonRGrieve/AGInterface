import { Meta, StoryContext, StoryObj } from '@storybook/react';
import { SWRConfig } from 'swr';
import { ChainSelector } from './ChainSelector';

// Mock data for chains
const mockChains = [
  {
    id: 'chain-1',
    chainName: 'Research Assistant',
    description: 'Chain for research tasks',
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chain-2',
    chainName: 'Content Creation',
    description: 'Chain for content creation',
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chain-3',
    chainName: 'Data Analysis',
    description: 'Chain for data analysis',
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock state management
const mockRouter = { push: () => {} };
let mockPathname = '/chat';
const mockSearchParams = new URLSearchParams();
mockSearchParams.set('chain', 'Research Assistant');

// Create mock implementations
let mockChainsData = mockChains;
let mockChainsError = null;

// Mock the modules using module.exports format instead of jest
const nextNavigationMock = {
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
};

const useChainMock = {
  useChains: () => ({
    data: mockChainsData,
    error: mockChainsError,
  }),
};

const usePathnameMock = () => mockPathname;

// Set up module mocks
import * as UsePathname from '@/auth/hooks/usePathname';
import * as NextNavigation from 'next/navigation';
import * as UseChain from '../hooks/useChain';

// Override module functionality
Object.defineProperty(NextNavigation, 'useRouter', {
  value: nextNavigationMock.useRouter,
});
Object.defineProperty(NextNavigation, 'useSearchParams', {
  value: nextNavigationMock.useSearchParams,
});
Object.defineProperty(UseChain, 'useChains', {
  value: useChainMock.useChains,
});
Object.defineProperty(UsePathname, 'default', {
  value: usePathnameMock,
});

const meta: Meta<typeof ChainSelector> = {
  title: 'Components/ChainSelector',
  component: ChainSelector,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context: StoryContext) => {
      // Reset mocks to default values
      mockChainsData = mockChains;
      mockChainsError = null;
      mockPathname = '/chat';

      // Update search params for value if provided
      if (context.args.value) {
        mockSearchParams.set('chain', context.args.value);
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
type Story = StoryObj<typeof ChainSelector>;

// Create a separate function to configure the mock for each story
function configureMocks(options: { error?: boolean; emptyChains?: boolean; pathInSettings?: boolean }) {
  if (options.error) {
    mockChainsError = new Error('Failed to load chains');
    mockChainsData = undefined;
  } else if (options.emptyChains) {
    mockChainsData = [];
  } else {
    mockChainsData = mockChains;
  }

  if (options.pathInSettings) {
    mockPathname = '/settings/chains';
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
    value: 'Content Creation',
  },
};

export const WithCustomOnChange: Story = {
  args: {
    onChange: (value: string) => console.log('onChange called with', value),
  },
};

export const InSettingsPage: Story = {
  args: {},
  decorators: [
    (Story) => {
      configureMocks({ pathInSettings: true });
      return <Story />;
    },
  ],
};

export const WithRouterNavigation: Story = {
  args: {},
};

export const WithError: Story = {
  args: {},
  decorators: [
    (Story) => {
      configureMocks({ error: true });
      return <Story />;
    },
  ],
};

export const EmptyChains: Story = {
  args: {},
  decorators: [
    (Story) => {
      configureMocks({ emptyChains: true });
      return <Story />;
    },
  ],
};
