import { InteractiveConfig, InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import { Meta, StoryContext, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { http, HttpResponse } from 'msw';
import * as usePromptHooks from '../hooks/usePrompt';
import PromptSelector from './PromptSelector';

// Create mock data for prompts that match your real data structure
const mockPrompts = [
  { name: 'Think About It', content: 'This is a thinking prompt', category: 'Default' },
  { name: 'Summarize This', content: 'This is a summary prompt', category: 'Default' },
  { name: 'Analyze Data', content: 'This is an analysis prompt', category: 'Data' },
  { name: 'Creative Writing', content: 'This is a creative writing prompt', category: 'Creative' },
  { name: 'Code Review', content: 'This is a code review prompt', category: 'Development' },
];

// Mock Next.js router
const mockRouter = {
  push: (url) => console.log(`[Mock Router] Navigating to: ${url}`),
};

// Mock search params
const createMockSearchParams = (params = {}) => {
  return {
    get: (key) => params[key] || null,
    has: (key) => params.hasOwnProperty(key),
  };
};

// Mock InteractiveConfigContext matching your provided structure
const mockInteractiveConfig: InteractiveConfig = {
  agent: 'XT',
  sdk: null,
  openai: null,
  overrides: {
    mode: 'prompt',
    prompt: 'Think About It',
    promptCategory: 'Default',
    command: '',
    commandArgs: {},
    commandMessageArg: 'message',
    chain: '',
    chainRunConfig: {
      chainArgs: {},
      singleStep: false,
      fromStep: 0,
      allResponses: false,
    },
    contextResults: 0,
    shots: 0,
    websearchDepth: 0,
    injectMemoriesFromCollectionNumber: 0,
    conversationResults: 5,
    conversation: '-',
    conversationID: '',
    browseLinks: false,
    webSearch: false,
    insightAgentName: '',
    enableMemory: false,
  },
  mutate: () => {},
};

// Set up the meta for the story
const meta: Meta<typeof PromptSelector> = {
  title: 'Components/PromptSelector',
  component: PromptSelector,
  decorators: [
    (Story, context: StoryContext) => {
      // Get configuration from story parameters
      const pathname = context.parameters.pathname || '/some-path';
      const promptData = context.args.promptData !== undefined ? context.args.promptData : mockPrompts;
      const params = context.parameters.searchParams || {};

      // Mock the usePrompts hook
      const originalUsePrompts = usePromptHooks.usePrompts;
      jest.spyOn(usePromptHooks, 'usePrompts').mockImplementation(() => ({
        data: promptData,
        error: context.args.error || null,
        mutate: async () => {},
        isValidating: false,
        isLoading: false,
        create: async () => {},
        import: async () => {},
      }));

      // Mock Next.js hooks for Storybook context
      // @ts-ignore - Mocking for storybook
      window.useRouter = () => mockRouter;
      // @ts-ignore - Mocking for storybook
      window.useSearchParams = () => createMockSearchParams(params);
      // @ts-ignore - Mocking for storybook
      window.usePathname = () => pathname;

      return (
        <InteractiveConfigContext.Provider value={mockInteractiveConfig}>
          <div className='p-4 max-w-md'>
            <Story />
          </div>
        </InteractiveConfigContext.Provider>
      );
    },
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/some-path',
      },
    },
    msw: {
      handlers: [
        http.get('/api/prompts', () => {
          return HttpResponse.json(mockPrompts);
        }),
      ],
    },
  },
  // Adding argTypes for the component props
  argTypes: {
    category: {
      control: 'text',
      description: 'The prompt category',
      defaultValue: 'Default',
    },
    value: {
      control: 'text',
      description: 'The selected prompt value',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when prompt selection changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PromptSelector>;

// Default story
export const Default: Story = {
  args: {
    category: 'Default',
  },
  parameters: {
    searchParams: {
      category: 'Default',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the Select trigger
    const selectTrigger = canvas.getByText('Select a Prompt');
    expect(selectTrigger).toBeInTheDocument();
  },
};

// Story with pre-selected value
export const WithPreselectedValue: Story = {
  args: {
    value: 'Summarize This',
    category: 'Default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show the pre-selected value
    const selectValue = canvas.getByText('Summarize This');
    expect(selectValue).toBeInTheDocument();
  },
};

// Story with pre-selected value from URL query param
export const WithValueFromQueryParam: Story = {
  args: {
    category: 'Default',
  },
  parameters: {
    searchParams: {
      prompt: 'Analyze Data',
      category: 'Default',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show the value from query param
    const selectValue = canvas.getByText('Analyze Data');
    expect(selectValue).toBeInTheDocument();
  },
};

// Story with custom onChange handler
export const WithCustomOnChange: Story = {
  args: {
    category: 'Default',
    onChange: (value) => console.log(`Selected prompt: ${value}`),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the dropdown
    const selectTrigger = canvas.getByRole('combobox');
    await userEvent.click(selectTrigger);

    // Select an option
    const option = canvas.getByText('Creative Writing');
    await userEvent.click(option);

    // Can't directly test the console.log, but the dropdown should close after selection
    expect(canvas.queryByText('Creative Writing')).toBeInTheDocument();
  },
};

// Story for when in settings page path
export const InSettingsPage: Story = {
  args: {
    category: 'Default',
  },
  parameters: {
    pathname: '/settings/prompts',
    searchParams: {
      category: 'Default',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the dropdown
    const selectTrigger = canvas.getByRole('combobox');
    await userEvent.click(selectTrigger);

    // Verify that "- Use Agent Default -" option is not shown in settings page
    const defaultOption = canvas.queryByText('- Use Agent Default -');
    expect(defaultOption).not.toBeInTheDocument();
  },
};

// Story for non-settings page (should show agent default option)
export const NonSettingsPage: Story = {
  args: {
    category: 'Default',
  },
  parameters: {
    pathname: '/chat',
    searchParams: {
      category: 'Default',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the dropdown
    const selectTrigger = canvas.getByRole('combobox');
    await userEvent.click(selectTrigger);

    // Verify that "- Use Agent Default -" option IS shown in non-settings pages
    const defaultOption = canvas.queryByText('- Use Agent Default -');
    expect(defaultOption).toBeInTheDocument();
  },
};

// Story for empty prompts
export const EmptyPrompts: Story = {
  args: {
    category: 'Default',
    promptData: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Select should be disabled
    const selectTrigger = canvas.getByRole('combobox');
    expect(selectTrigger).toBeDisabled();
  },
};

// Story with error state
export const WithError: Story = {
  args: {
    category: 'Default',
    promptData: null,
    error: new Error('Failed to load prompts'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Select should be disabled when there's an error
    const selectTrigger = canvas.getByRole('combobox');
    expect(selectTrigger).toBeDisabled();
  },
};

// Different category filter
export const DataCategory: Story = {
  args: {
    category: 'Data',
  },
  parameters: {
    searchParams: {
      category: 'Data',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the dropdown
    const selectTrigger = canvas.getByRole('combobox');
    await userEvent.click(selectTrigger);

    // Should show data category prompts
    expect(canvas.queryByText('Analyze Data')).toBeInTheDocument();
  },
};
