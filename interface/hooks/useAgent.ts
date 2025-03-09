import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { useContext } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { chainMutations, createGraphQLClient } from '../../interactive/src/hooks/lib';
import { Agent, AgentSchema } from './z';
import log from '@/next-log/log';
import { InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import { useTeams } from '@/auth/hooks/useTeam';

// ============================================================================
// Agent Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage all agents across companies
 * @returns SWR response containing array of agents
 */
export function useAgents(): SWRResponse<Agent[]> {
  const teamsHook = useTeams();
  const { data: teams } = teamsHook;

  const swrHook = useSWR<Agent[]>(
    ['/agents', teams],
    (): Agent[] => {
      if (!teams) return [];
      return teams.flatMap((team) =>
        team.agents.map((agent) => ({
          ...agent,
          userId: '',
          favourite: false,
          rotationId: '',
          imageUrl: null,
          createdAt: new Date().toISOString(),
          settings: [],
          companyId: team.id,
          companyName: team.name,
          contextPrompts: [],
          providerInstances: [],
          providerInstanceAbilities: [],
          memories: [],
          labels: [],
          chainSteps: [],
          tasks: [],
        })),
      );
    },
    { fallbackData: [] },
  );

  const originalMutate = swrHook.mutate;
  swrHook.mutate = chainMutations(teamsHook, originalMutate);
  return swrHook;
}

/**
 * Hook to fetch and manage agent data and commands
 * @param name - Optional agent name to fetch
 * @returns SWR response containing agent data and commands
 */
export function useAgent(
  withSettings = false,
  name?: string,
): SWRResponse<{
  agent: Agent | null;
  commands: string[];
  extensions: any[];
}> {
  const getDefaultAgent = () => {
    const primaryTeam = teams?.find((c) => c.primary);
    if (primaryTeam?.agents?.length) {
      const primaryAgent = primaryTeam?.agents.find((a) => a.default);
      const baseAgent = primaryAgent || primaryTeam?.agents[0];
      if (baseAgent) {
        foundEarly = {
          ...baseAgent,
          userId: '',
          favourite: false,
          rotationId: '',
          imageUrl: null,
          createdAt: new Date().toISOString(),
          settings: [],
          companyId: primaryTeam.id,
          companyName: primaryTeam.name,
          contextPrompts: [],
          providerInstances: [],
          providerInstanceAbilities: [],
          memories: [],
          labels: [],
          chainSteps: [],
          tasks: [],
        };
        searchName = foundEarly.name;
        setCookie('aginteractive-agent', searchName, {
          domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        });
      }
    }
    return null;
  };
  const teamsHook = useTeams();
  const { data: teams } = teamsHook;
  const state = useContext(InteractiveConfigContext);
  let searchName = name || (getCookie('aginteractive-agent') as string | undefined);
  let foundEarly: Agent | null = null;

  if (!searchName && teams?.length) {
    foundEarly = getDefaultAgent();
  }
  log([`GQL useAgent() SEARCH NAME: ${searchName}`], {
    client: 3,
  });
  const swrHook = useSWR<{ agent: Agent | null; commands: string[]; extensions: any[] }>(
    [`/agent?name=${searchName}`, teams, withSettings],
    async (): Promise<{ agent: Agent | null; commands: string[]; extensions: any[] }> => {
      try {
        if (withSettings) {
          const client = createGraphQLClient();
          const query = AgentSchema.toGQL('query', 'GetAgent', { name: searchName });
          log(['GQL useAgent() Query', query], {
            client: 3,
          });
          const response = await client.request<{ agent: Agent }>(query, { name: searchName });
          log(['GQL useAgent() Response', response], {
            client: 3,
          });
          return {
            agent: AgentSchema.parse(response.agent),
            commands: [],
            extensions: [],
          };
        } else {
          const toReturn = { agent: foundEarly, commands: [], extensions: [] };
          if (teams?.length && !toReturn.agent) {
            for (const team of teams) {
              log(['GQL useAgent() Checking Team', team], {
                client: 3,
              });
              const agent = team.agents.find((a) => a.name === searchName);
              if (agent) {
                toReturn.agent = {
                  ...agent,
                  userId: '',
                  favourite: false,
                  rotationId: '',
                  imageUrl: null,
                  createdAt: new Date().toISOString(),
                  settings: [],
                  companyId: team.id,
                  companyName: team.name,
                  contextPrompts: [],
                  providerInstances: [],
                  providerInstanceAbilities: [],
                  memories: [],
                  labels: [],
                  chainSteps: [],
                  tasks: [],
                };
              }
            }
          }
          if (!toReturn.agent) {
            log(['GQL useAgent() Agent Not Found, Using Default', toReturn], {
              client: 3,
            });
            toReturn.agent = getDefaultAgent();
          }
          if (toReturn.agent) {
            log(['GQL useAgent() Agent Found, Getting Commands', toReturn], {
              client: 3,
            });
            toReturn.extensions = (
              await axios.get(`${process.env.NEXT_PUBLIC_API_URI}/api/agent/${toReturn.agent.name}/extensions`, {
                headers: {
                  Authorization: getCookie('jwt'),
                },
              })
            ).data.extensions;
            toReturn.commands = await state.sdk.getCommands(toReturn.agent.name);
          } else {
            log(['GQL useAgent() Did Not Get Agent', toReturn], {
              client: 3,
            });
          }

          return toReturn;
        }
      } catch (error) {
        log(['GQL useAgent() Error', error], {
          client: 1,
        });
        return { agent: null, commands: [], extensions: [] };
      }
    },
    { fallbackData: { agent: null, commands: [], extensions: [] } },
  );
  const originalMutate = swrHook.mutate;
  swrHook.mutate = chainMutations(teamsHook, originalMutate);
  return swrHook;
}
