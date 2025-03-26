import { useToast } from '@/hooks/useToast';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import log from '@/next-log/log';
import '@/zod2gql/zod2gql';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import useSWR, { SWRResponse } from 'swr';
import { chainMutations, createGraphQLClient } from '../../interactive/src/hooks/lib';
import { Agent, AgentSchema } from './z';

// ============================================================================
// Agent Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage all agents across teams and user agents
 * @returns SWR response containing array of agents
 */
export function useAgents(): SWRResponse<Agent[]> {
  const client = createGraphQLClient();
  const { toast } = useToast();
  const { sdk: sdk } = useInteractiveConfig();
  const router = useRouter();

  return useSWR<Agent[]>(
    '/agents',
    async (): Promise<Agent[]> => {
      try {
        const query = AgentSchema.toGQL('query', 'GetAgents');
        const response = await client.request(query);
        return response.agents || [];
      } catch (error) {
        log(['GQL useAgents() Error', error], {
          client: 1,
        });
        return [];
      }
    },
    { fallbackData: [] },
  );
}

/**
 * Hook to fetch and manage agent data and commands
 * @param withSettings - Whether to fetch full agent settings
 * @param name - Optional agent name to fetch
 * @returns SWR response containing agent data and commands
 */
/**
 * Hook to fetch and manage specific team data
 * @param id - Optional team ID to fetch
 * @returns SWR response containing team data or null
 */
export function useAgent(id?: string): SWRResponse<Agent | null> {
  const agentsHook = useAgents();
  const { data: agents } = agentsHook;
  if (!id) id = getCookie('aginfrastructure-agent');
  const swrHook = useSWR<Agent | null>(
    [`/agent?id=${id}`, agents, getCookie('jwt')],
    async (): Promise<Agent | null> => {
      if (!getCookie('jwt')) return null;
      try {
        // If an ID is explicitly provided, use that
        if (id) {
          return agents?.find((agent) => agent.id === id) || null;
        }
      } catch (error) {
        log(['GQL useAgent() Error', error], {
          client: 3,
        });
        return null;
      }
    },
    { fallbackData: null },
  );

  const originalMutate = swrHook.mutate;
  swrHook.mutate = chainMutations(agentsHook, originalMutate);

  return swrHook;
}
