import { useTeams } from '@/auth/hooks/useTeam';
import { useUser } from '@/auth/hooks/useUser';
import { InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import log from '@/next-log/log';
import { getCookie, setCookie } from 'cookies-next';
import { useContext } from 'react';
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
  const teamsHook = useTeams();
  const { data: teams } = teamsHook;
  const userHook = useUser();
  const { data: user } = userHook;

  const swrHook = useSWR<Agent[]>(
    ['/agents', teams, user],
    (): Agent[] => {
      if (!teams || !user) return [];

      // Get all team agents
      const teamAgents = teams.flatMap((team) =>
        (team.agents || []).map((agent) => ({
          ...agent,
          userId: '',
          favourite: false,
          rotationId: '',
          imageUrl: null,
          createdAt: new Date().toISOString(),
          settings: [],
          companyId: team.id,
          companyName: team.name || '',
          contextPrompts: [],
          providerInstances: [],
          providerInstanceAbilities: [],
          memories: [],
          labels: [],
          chainSteps: [],
          tasks: [],
        })),
      );

      // Get user agents
      const userAgents = (user.agents || []).map((agent) => ({
        ...agent,
        userId: user.id,
        favourite: false,
        rotationId: '',
        imageUrl: null,
        createdAt: new Date().toISOString(),
        settings: [],
        companyId: '', // User agents don't have a company
        companyName: 'Personal', // Label user agents as personal
        contextPrompts: [],
        providerInstances: [],
        providerInstanceAbilities: [],
        memories: [],
        labels: [],
        chainSteps: [],
        tasks: [],
      }));

      // Combine and return all agents
      return [...teamAgents, ...userAgents];
    },
    { fallbackData: [] },
  );

  const originalMutate = swrHook.mutate;
  swrHook.mutate = chainMutations(teamsHook, originalMutate);
  return swrHook;
}

/**
 * Hook to fetch and manage agent data and commands
 * @param withSettings - Whether to fetch full agent settings
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
  const teamsHook = useTeams();
  const { data: teams } = teamsHook;
  const userHook = useUser();
  const { data: user } = userHook;
  const state = useContext(InteractiveConfigContext);
  let searchName = name || (getCookie('aginteractive-agent') as string | undefined);
  let foundEarly: Agent | null = null;

  // Get the default agent (first alphabetical favourited agent across all sources)
  const getDefaultAgent = () => {
    if (!teams?.length && !user?.agents?.length) return null;

    // Collect all agents from teams
    const allTeamAgents =
      teams?.flatMap((team) =>
        (team.agents || []).map((agent) => ({
          ...agent,
          userId: '',
          favourite: false,
          rotationId: '',
          imageUrl: null,
          createdAt: new Date().toISOString(),
          settings: [],
          companyId: team.id,
          companyName: team.name || '',
          contextPrompts: [],
          providerInstances: [],
          providerInstanceAbilities: [],
          memories: [],
          labels: [],
          chainSteps: [],
          tasks: [],
        })),
      ) || [];

    // Collect user agents
    const allUserAgents = (user?.agents || []).map((agent) => ({
      ...agent,
      userId: user?.id || '',
      favourite: false,
      rotationId: '',
      imageUrl: null,
      createdAt: new Date().toISOString(),
      settings: [],
      companyId: '',
      companyName: 'Personal',
      contextPrompts: [],
      providerInstances: [],
      providerInstanceAbilities: [],
      memories: [],
      labels: [],
      chainSteps: [],
      tasks: [],
    }));

    // Combine all agents
    const allAgents = [...allTeamAgents, ...allUserAgents];

    // Sort alphabetically and prioritize favourited agents
    const sortedAgents = allAgents.sort((a, b) => {
      // Favourited agents come first
      if (a.favourite && !b.favourite) return -1;
      if (!a.favourite && b.favourite) return 1;
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });

    // Return the first agent after sorting
    const selectedAgent = sortedAgents.length > 0 ? sortedAgents[0] : null;

    if (selectedAgent) {
      // Set the cookie for future reference
      setCookie('aginteractive-agent', selectedAgent.name, {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      });

      return selectedAgent;
    }

    return null;
  };

  // If no agent is specified in the cookie, find the default one
  if (!searchName) {
    foundEarly = getDefaultAgent();
    if (foundEarly) {
      searchName = foundEarly.name;
    }
  }

  log([`GQL useAgent() SEARCH NAME: ${searchName}`], {
    client: 3,
  });

  const swrHook = useSWR<{ agent: Agent | null; commands: string[]; extensions: any[] }>(
    [`/agent?name=${searchName}`, teams, user, withSettings],
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

          // If we haven't found an agent yet, search through team agents
          if (!toReturn.agent && teams?.length) {
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
                  companyName: team.name || '',
                  contextPrompts: [],
                  providerInstances: [],
                  providerInstanceAbilities: [],
                  memories: [],
                  labels: [],
                  chainSteps: [],
                  tasks: [],
                };
                break;
              }
            }
          }

          // If still not found, check user agents
          if (!toReturn.agent && user?.agents?.length) {
            const agent = user.agents.find((a) => a.name === searchName);
            if (agent) {
              toReturn.agent = {
                ...agent,
                userId: user.id,
                favourite: false,
                rotationId: '',
                imageUrl: null,
                createdAt: new Date().toISOString(),
                settings: [],
                companyId: '',
                companyName: 'Personal',
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

          // If still no agent is found, get the default one
          if (!toReturn.agent) {
            log(['GQL useAgent() Agent Not Found, Using Default', toReturn], {
              client: 3,
            });
            toReturn.agent = getDefaultAgent();
          }

          // Fetch extensions and commands if an agent was found
          if (toReturn.agent) {
            log(['GQL useAgent() Agent Found, Getting Commands', toReturn], {
              client: 3,
            });
            // toReturn.extensions = (
            //   await axios.get(`${process.env.NEXT_PUBLIC_API_URI}/api/agent/${toReturn.agent.name}/extensions`, {
            //     headers: {
            //       Authorization: getCookie('jwt'),
            //     },
            //   })
            // ).data.extensions;
            // toReturn.commands = await state.sdk.getCommands(toReturn.agent.name);
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
