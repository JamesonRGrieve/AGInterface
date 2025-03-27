import { Team } from '@/auth/hooks/z';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SWRConfig } from 'swr';
import { Agent } from '../hooks/z';
import { AgentSelector } from './AgentSelector';

// Mock data
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Marketing Bot',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teamId: 'team-1',
  },
  {
    id: 'agent-2',
    name: 'Customer Support Bot',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teamId: 'team-1',
  },
  {
    id: 'agent-3',
    name: 'Sales Assistant',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teamId: 'team-1',
  },
];

const mockTeam: Team = {
  id: 'team-1',
  name: 'Acme Corporation',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Create mutable mock states
let mockActiveAgent = mockAgents[0];
let mockAgentsData = mockAgents;
let mockActiveTeam = mockTeam;
let mockIsMobile = false;
let mockAgentError = null;
let mockTeamError = null;

// Mock router
const mockRouter = { push: () => {} };

// Mock cookie setter
const mockSetCookie = () => {};

// Mock the modules using object properties
const useAgentMock = {
  useAgent: () => ({
    data: mockActiveAgent,
    mutate: () => {},
    error: mockAgentError,
  }),
  useAgents: () => ({
    data: mockAgentsData,
    mutate: () => {},
    error: null,
  }),
};

const useTeamMock = {
  useTeam: () => ({
    data: mockActiveTeam,
    mutate: () => {},
    error: mockTeamError,
  }),
};

const useSidebarMock = {
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div className='sidebar-menu'>{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div className='sidebar-menu-item'>{children}</div>,
  SidebarMenuButton: ({ children, ...props }: any) => (
    <button className={`sidebar-menu-button ${props.className || ''}`} {...props}>
      {children}
    </button>
  ),
  useSidebar: () => ({ isMobile: mockIsMobile }),
};

const cookiesNextMock = {
  setCookie: mockSetCookie,
};

const nextNavigationMock = {
  useRouter: () => mockRouter,
};

// Set up module mocks
import * as UseTeam from '@/auth/hooks/useTeam';
import * as SidebarUI from '@/components/ui/sidebar';
import * as CookiesNext from 'cookies-next';
import * as NextNavigation from 'next/navigation';
import * as UseAgent from '../hooks/useAgent';

// Override module functionality
Object.defineProperty(UseAgent, 'useAgent', {
  value: useAgentMock.useAgent,
});
Object.defineProperty(UseAgent, 'useAgents', {
  value: useAgentMock.useAgents,
});
Object.defineProperty(UseTeam, 'useTeam', {
  value: useTeamMock.useTeam,
});
Object.defineProperty(SidebarUI, 'SidebarMenu', {
  value: useSidebarMock.SidebarMenu,
});
Object.defineProperty(SidebarUI, 'SidebarMenuItem', {
  value: useSidebarMock.SidebarMenuItem,
});
Object.defineProperty(SidebarUI, 'SidebarMenuButton', {
  value: useSidebarMock.SidebarMenuButton,
});
Object.defineProperty(SidebarUI, 'useSidebar', {
  value: useSidebarMock.useSidebar,
});
Object.defineProperty(CookiesNext, 'setCookie', {
  value: cookiesNextMock.setCookie,
});
Object.defineProperty(NextNavigation, 'useRouter', {
  value: nextNavigationMock.useRouter,
});

const meta: Meta<typeof AgentSelector> = {
  title: 'Components/AgentSelector',
  component: AgentSelector,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      // Reset defaults
      mockActiveAgent = mockAgents[0];
      mockAgentsData = mockAgents;
      mockActiveTeam = mockTeam;
      mockIsMobile = false;
      mockAgentError = null;
      mockTeamError = null;

      return (
        <SWRConfig value={{ provider: () => new Map() }}>
          <div style={{ padding: '1rem', background: '#f0f0f0', minHeight: '200px', minWidth: '300px' }}>
            <Story />
          </div>
        </SWRConfig>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof AgentSelector>;

// Function to configure mocks for different scenarios
function configureMocks(options: {
  activeAgent?: Agent;
  agents?: Agent[];
  activeTeam?: Team;
  isMobile?: boolean;
  agentError?: boolean;
  teamError?: boolean;
}) {
  if (options.activeAgent) {
    mockActiveAgent = options.activeAgent;
  }

  if (options.agents) {
    mockAgentsData = options.agents;
  }

  if (options.activeTeam) {
    mockActiveTeam = options.activeTeam;
  }

  if (options.isMobile !== undefined) {
    mockIsMobile = options.isMobile;
  }

  if (options.agentError) {
    mockAgentError = new Error('Failed to fetch agent');
  }

  if (options.teamError) {
    mockTeamError = new Error('Failed to fetch team');
  }
}

export const Default: Story = {};

export const WithDifferentActiveAgent: Story = {
  decorators: [
    (Story) => {
      configureMocks({ activeAgent: mockAgents[1] });
      return <Story />;
    },
  ],
};

export const MobileView: Story = {
  decorators: [
    (Story) => {
      configureMocks({ isMobile: true });
      return <Story />;
    },
  ],
};

export const NoAgentsAvailable: Story = {
  decorators: [
    (Story) => {
      configureMocks({ agents: [] });
      return <Story />;
    },
  ],
};

export const LoadingState: Story = {
  decorators: [
    (Story) => {
      configureMocks({ activeAgent: undefined, agents: undefined });
      return <Story />;
    },
  ],
};

export const ErrorState: Story = {
  decorators: [
    (Story) => {
      configureMocks({ agentError: true });
      return <Story />;
    },
  ],
};
