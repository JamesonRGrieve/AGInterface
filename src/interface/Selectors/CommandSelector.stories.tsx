import { Meta, StoryContext, StoryObj } from '@storybook/react';
import { SWRConfig } from 'swr';
import { Agent } from '../hooks/z';
import { CommandSelector } from './CommandSelector';

// Mock data
const mockAgent: Agent = {
  id: 'agent-1',
  name: 'Marketing Bot',
  commands: {
    'generate-email': 'Generate marketing email',
    'create-social-post': 'Create a social media post',
    'analyze-campaign': 'Analyze marketing campaign',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  teamId: 'team-1',
};

// Mock state and functions
const mockRouter = { push: () => {} };
let mockPathname = '/chat';
const mockSearchParams = new URLSearchParams();
mockSearchParams.set('command', 'generate-email');

// Create mock data that can be modified
let mockAgentData = mockAgent;
let mockAgentError = null;

// Mock the modules using object properties
const nextNavigationMock = {
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
};

const useAgentMock = {
  useAgent: () => ({
    data: mockAgentData,
    error: mockAgentError,
  }),
};

const usePathnameMock = () => mockPathname;

// Set up module mocks
import * as UsePathname from '@/auth/hooks/usePathname';
import * as NextNavigation from 'next/navigation';
import * as UseAgent from '../hooks/useAgent';

// Override module functionality
Object.defineProperty(NextNavigation, 'useRouter', {
  value: nextNavigationMock.useRouter,
});
Object.defineProperty(NextNavigation, 'useSearchParams', {
  value: nextNavigationMock.useSearchParams,
});
Object.defineProperty(UseAgent, 'useAgent', {
  value: useAgentMock.useAgent,
});
Object.defineProperty(UsePathname, 'default', {
  value: usePathnameMock,
});

const meta: Meta<typeof CommandSelector> = {
  title: 'Components/CommandSelector',
  component: CommandSelector,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context: StoryContext) => {
      // Reset to defaults
      mockAgentData = mockAgent;
      mockAgentError = null;
      mockPathname = '/chat';

      // Update value in search params if provided
      if (context.args.value) {
        mockSearchParams.set('command', context.args.value);
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
type Story = StoryObj<typeof CommandSelector>;

// Function to configure mocks for each story scenario
function configureMocks(options: { error?: boolean; emptyCommands?: boolean; pathInSettings?: boolean }) {
  if (options.error) {
    mockAgentError = new Error('Failed to load agent');
    mockAgentData = undefined;
  } else if (options.emptyCommands) {
    mockAgentData = {
      ...mockAgent,
      commands: {},
    };
  } else {
    mockAgentData = mockAgent;
  }

  if (options.pathInSettings) {
    mockPathname = '/settings/commands';
  } else {
    mockPathname = '/chat';
  }
}

export const Default: Story = {
  args: {
    agentName: 'Marketing Bot',
  },
};

export const WithCustomValue: Story = {
  args: {
    agentName: 'Marketing Bot',
    value: 'create-social-post',
  },
};

export const WithCustomOnChange: Story = {
  args: {
    agentName: 'Marketing Bot',
    onChange: (value: string) => console.log('onChange called with', value),
  },
};

export const InSettingsPage: Story = {
  args: {
    agentName: 'Marketing Bot',
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
    agentName: 'Marketing Bot',
  },
};

export const WithError: Story = {
  args: {
    agentName: 'Marketing Bot',
  },
  decorators: [
    (Story) => {
      configureMocks({ error: true });
      return <Story />;
    },
  ],
};

export const EmptyCommands: Story = {
  args: {
    agentName: 'Marketing Bot',
  },
  decorators: [
    (Story) => {
      configureMocks({ emptyCommands: true });
      return <Story />;
    },
  ],
};
