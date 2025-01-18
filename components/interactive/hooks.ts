import { useContext } from 'react';
import { getCookie, setCookie } from 'cookies-next';
import { GraphQLClient } from 'graphql-request';
import { InteractiveConfigContext } from './InteractiveConfigContext';
import useSWR, { SWRResponse } from 'swr';

// Import all types from the centralized schema file
import {
  User,
  UserSchema,
  Agent,
  AgentSchema,
  Company,
  CompanySchema,
  Prompt,
  PromptSchema,
  Provider,
  ProviderSchema,
  Invitation,
  CommandArgs,
  Chain,
  ChainSchema,
  Conversation,
  ConversationSchema,
  ConversationEdge,
  InvitationSchema,
  CommandArgSchema,
  PromptCategorySchema,
  ChainsSchema,
  ConversationsSchema,
  ConversationMetadataSchema,
  ConversationMetadata,
  ConversationEdgeSchema,
} from './types';
import { z } from 'zod';
import { RiRhythmFill } from 'react-icons/ri';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a configured GraphQL client instance
 * @returns Configured GraphQLClient instance
 */
const createGraphQLClient = (): GraphQLClient =>
  new GraphQLClient(`${process.env.NEXT_PUBLIC_AGIXT_SERVER}/graphql`, {
    headers: { authorization: getCookie('jwt') || '' },
  });

// ============================================================================
// Agent Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage all agents across companies
 * @returns SWR response containing array of agents
 */
export function useAgents(): SWRResponse<Agent[]> {
  const { data: companies } = useCompanies();

  return useSWR<Agent[]>(
    '/agents',
    (): Agent[] =>
      companies?.flatMap((company) =>
        company.agents.map((agent) => ({
          ...agent,
          companyName: company.name,
        })),
      ) || [],
    { fallbackData: [] },
  );
}

/**
 * Hook to fetch and manage agent data and commands
 * @param name - Optional agent name to fetch
 * @returns SWR response containing agent data and commands
 */
export function useAgent(name?: string): SWRResponse<{
  agent: Agent | null;
  commands: string[];
}> {
  const { data: companies } = useCompanies();
  const state = useContext(InteractiveConfigContext);
  let searchName = name || (getCookie('agixt-agent') as string | undefined);
  let foundEarly = null;

  if (!searchName && companies?.length) {
    const primaryCompany = companies.find((c) => c.primary);
    if (primaryCompany?.agents?.length) {
      const primaryAgent = primaryCompany?.agents.find((a) => a.default);
      foundEarly = primaryAgent || primaryCompany?.agents[0];
      searchName = foundEarly?.name;
      setCookie('agixt-agent', searchName, {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      });
    }
  }

  return useSWR<{ agent: Agent | null; commands: string[] }>(
    [`/agent?name=${searchName}`],
    async (): Promise<{ agent: Agent | null; commands: string[] }> => {
      const toReturn = { agent: foundEarly, commands: [] };
      if (companies?.length && !toReturn.agent) {
        for (const company of companies) {
          const agent = company.agents.find((a) => a.name === searchName);
          if (agent) {
            toReturn.agent = agent;
          }
        }
      }
      if (toReturn.agent) {
        toReturn.commands = await state.agixt.getCommands(toReturn.agent.name);
      }
      return toReturn;
    },
    { fallbackData: { agent: null, commands: [] } },
  );
}

// ============================================================================
// Prompt Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage prompt categories
 * @returns SWR response containing array of prompt categories
 */
export function usePromptCategories(): SWRResponse<string[]> {
  const client = createGraphQLClient();

  return useSWR<string[]>(
    '/promptCategories',
    async (): Promise<string[]> => {
      const query = PromptCategorySchema.toGQL('query', 'GetPromptCategories');
      const response = await client.request(query);
      return response || [];
    },
    { fallbackData: [] },
  );
}
/**
 * Hook to get a specific prompt by name from the prompts list
 * @param name - Name of the prompt to find
 * @returns SWR response containing prompt data if found
 */
export function usePrompt(name: string): SWRResponse<Prompt | null> {
  const { data: prompts, error, isLoading } = usePrompts();
  return useSWR<Prompt | null>(`/prompt?name=${name}`, () => prompts?.find((p) => p.name === name) || null, {
    fallbackData: null,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}

/**
 * Hook to fetch and manage all prompts and categories
 * @returns SWR response containing prompts array and categories array
 */
export function usePrompts(): SWRResponse<Prompt[]> {
  const client = createGraphQLClient();

  return useSWR<Prompt[]>(
    '/prompts',
    async (): Promise<Prompt[]> => {
      const query = PromptSchema.toGQL('query', 'GetPrompts');
      const response = await client.request(query);
      return response.prompts || [];
    },
    { fallbackData: [] },
  );
}
// ============================================================================
// Company Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage company data
 * @returns SWR response containing array of companies
 */
export function useCompanies(): SWRResponse<Company[]> {
  const { data: user } = useUser();

  return useSWR<Company[]>('/companies', () => user?.companies || [], { fallbackData: [] });
}

/**
 * Hook to fetch and manage specific company data
 * @param id - Optional company ID to fetch
 * @returns SWR response containing company data or null
 */
export function useCompany(id?: string): SWRResponse<Company | null> {
  const { data: companies } = useCompanies();

  return useSWR<Company | null>(
    ['/company', id],
    (): Company | null => {
      if (id) {
        return companies?.find((c) => c.id === id) || null;
      } else {
        const agentName = getCookie('agixt-agent');
        return companies?.find((c) => (agentName ? c.agents.some((a) => a.name === agentName) : c.primary)) || null;
      }
    },
    { fallbackData: null },
  );
}

// ============================================================================
// User Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage current user data
 * @returns SWR response containing user data
 */
export function useUser(): SWRResponse<User> {
  const client = createGraphQLClient();

  return useSWR<User>(
    '/user',
    async (): Promise<User> => {
      const query = UserSchema.toGQL('query', 'GetUser');
      console.log(query);
      const response = await client.request<{ user: User }>(query);
      console.log(response);
      return UserSchema.parse(response.user);
    },
    {
      fallbackData: {
        companies: [],
        email: '',
        firstName: '',
        id: '',
        lastName: '',
      },
    },
  );
}

// ============================================================================
// Provider Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage provider data
 * @param providerName - Optional provider name to fetch specific provider
 * @returns SWR response containing provider data
 */
export function useProvider(providerName?: string): SWRResponse<Provider | null> {
  const client = createGraphQLClient();

  return useSWR<Provider | null>(
    providerName ? [`/provider`, providerName] : null,
    async (): Promise<Provider | null> => {
      const query = ProviderSchema.toGQL('query', 'GetProvider', { providerName });
      const response = await client.request<Provider>(query, { providerName });
      const validated = ProviderSchema.parse(response);
      return validated.provider;
    },
    { fallbackData: null },
  );
}

/**
 * Hook to fetch and manage all providers
 * @returns SWR response containing array of providers
 */
export function useProviders(): SWRResponse<Provider[]> {
  const client = createGraphQLClient();

  return useSWR<Provider[]>(
    '/providers',
    async (): Promise<Provider[]> => {
      const query = ProviderSchema.toGQL('query', 'GetProviders');
      const response = await client.request<Provider[]>(query);
      const validated = ProviderSchema.parse(response);
      return validated.providers;
    },
    { fallbackData: [] },
  );
}

// ============================================================================
// Invitation Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage invitations
 * @param companyId - Optional company ID to fetch invitations for
 * @returns SWR response containing array of invitations
 */
export function useInvitations(companyId?: string): SWRResponse<Invitation[]> {
  const client = createGraphQLClient();

  return useSWR<Invitation[]>(
    companyId ? [`/invitations`, companyId] : '/invitations',
    async (): Promise<Invitation[]> => {
      const query = InvitationSchema.toGQL('query', 'GetInvitations', { companyId });
      const response = await client.request<Invitation[]>(query, { companyId });
      const validated = InvitationSchema.parse(response);
      return validated.invitations;
    },
    { fallbackData: [] },
  );
}

// ============================================================================
// Command Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage command arguments
 * @param commandName - Command name to fetch arguments for
 * @returns SWR response containing command arguments
 */
export function useCommandArgs(commandName: string): SWRResponse<CommandArgs | null> {
  const client = createGraphQLClient();

  return useSWR<CommandArgs | null>(
    commandName ? [`/command_args`, commandName] : null,
    async (): Promise<CommandArgs | null> => {
      const query = CommandArgSchema.toGQL('query', 'GetCommandArgs', { commandName });
      const response = await client.request<CommandArgs>(query, { commandName });
      const validated = CommandArgSchema.parse(response);
      return validated;
    },
    { fallbackData: null },
  );
}

// ============================================================================
// Chain Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage chain data
 * @param chainName - Optional chain name to fetch specific chain
 * @returns SWR response containing chain data
 */
// export function useChain(chainName?: string): SWRResponse<Chain | null> {
//   const client = createGraphQLClient();

//   return useSWR<Chain | null>(
//     chainName ? [`/chain`, chainName] : null,
//     async (): Promise<Chain | null> => {
//       try {
//         const query = ChainSchema.toGQL('query', 'GetChain', { chainName: chainName });
//         console.log('QUERY', query);
//         const response = await client.request<Chain>(query, { chainName: chainName });
//         console.log('RESPONSE', response);
//         const validated = ChainSchema.parse(response.data);
//         return validated.chain;
//       } catch (error) {
//         console.log('ERROR:', error);
//         return null;
//       }
//     },
//     { fallbackData: null },
//   );
// }
export function useChain(chainName?: string): SWRResponse<Chain | null> {
  const state = useContext(InteractiveConfigContext);

  return useSWR<Chain | null>(
    chainName ? [`/chain`, chainName] : null,
    async (): Promise<Chain | null> => {
      try {
        const response = await state.agixt.getChain(chainName);
        response.chainName = response.chain_name;
        delete response.chain_name;
        const validated = ChainSchema.parse(response);
        return validated.chain;
      } catch (error) {
        console.log('ERROR:', error);
        return null;
      }
    },
    { fallbackData: null },
  );
}

/**
 * Hook to fetch and manage all chains
 * @returns SWR response containing array of chains
 */
export function useChains(): SWRResponse<Chain[]> {
  const client = createGraphQLClient();

  return useSWR<Chain[]>(
    '/chains',
    async (): Promise<Chain[]> => {
      try {
        const query = ChainsSchema.toGQL('query', 'GetChains');
        const response = await client.request<{ chains: Chain[] }>(query);
        const validated = z.array(ChainsSchema).parse(response.chains);
        return validated;
      } catch (error) {
        return [];
      }
    },
    { fallbackData: [] },
  );
}

// ============================================================================
// Conversation Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage conversation data with real-time updates
 * @param conversationId - Conversation ID to fetch
 * @returns SWR response containing conversation data
 */
export function useConversation(conversationId: string): SWRResponse<Conversation | null> {
  const client = createGraphQLClient();

  return useSWR<Conversation | null>(
    conversationId ? [`/conversation`, conversationId] : null,
    async (): Promise<Conversation | null> => {
      const query = ConversationSchema.toGQL('subscription', 'WatchConversation', { conversationId });
      const response = await client.request<Conversation>(query, { conversationId });
      return response.conversation;
    },
    {
      fallbackData: null,
      refreshInterval: 1000, // Real-time updates
    },
  );
}

/**
 * Hook to fetch and manage all conversations with real-time updates
 * @returns SWR response containing array of conversation edges
 */
export function useConversations(): SWRResponse<Conversation[]> {
  const client = createGraphQLClient();

  return useSWR<Conversation[]>(
    '/chains',
    async (): Promise<Conversation[]> => {
      try {
        const query = z.object({ edges: ConversationEdgeSchema }).toGQL('query', 'GetConversations');
        console.log('QUERY', query);
        const response = await client.request<{ conversations: { edges: ConversationEdge }[] }>(query);
        const validated = z.array(ConversationEdgeSchema).parse(response.conversations.edges);
        return validated;
      } catch (error) {
        console.log('ERROR:', error);
        return [];
      }
    },
    { fallbackData: [] },
  );
}