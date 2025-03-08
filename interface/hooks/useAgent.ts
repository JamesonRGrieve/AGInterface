import { useTeams } from '@/auth/hooks/useTeam';
import { InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import log from '@/next-log/log';
import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { useContext } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { chainMutations, createGraphQLClient } from '../../interactive/src/hooks/lib';
import { Agent, AgentSchema } from './z';

// ============================================================================
// Agent Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage all agents across companies
 * @returns SWR response containing array of agents
 */
export function useAgents(): SWRResponse<Agent[]> {
  const companiesHook = useTeams();
  const { data: companies } = companiesHook;

  const swrHook = useSWR<Agent[]>(
    ['/agents', companies],
    (): Agent[] =>
      teams?.flatMap((team) =>
        team.agents.map((agent) => ({
          ...agent,
          teamName: team.name,
        })),
      ) || [],
    { fallbackData: [] },
  );

  const originalMutate = swrHook.mutate;
  swrHook.mutate = chainMutations(companiesHook, originalMutate);
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
}> {
  const getDefaultAgent = () => {
    const primaryCompany = teams.find((c) => c.primary);
    if (primaryCompany?.agents?.length) {
      const primaryAgent = primaryCompany?.agents.find((a) => a.default);
      foundEarly = primaryAgent || primaryCompany?.agents[0];
      searchName = foundEarly?.name;
      setCookie('aginteractive-agent', searchName, {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      });
    }
    return teams;
  };
  const companiesHook = useTeams();
  const { data: companies } = companiesHook;
  const state = useContext(InteractiveConfigContext);
  let searchName = name || (getCookie('aginteractive-agent') as string | undefined);
  let foundEarly = null;

  if (!searchName && companies?.length) {
    foundEarly = getDefaultAgent();
  }
  log([`GQL useAgent() SEARCH NAME: ${searchName}`], {
    client: 3,
  });
  const swrHook = useSWR<{ agent: Agent | null; commands: string[]; extensions: any[] }>(
    [`/agent?name=${searchName}`, companies, withSettings],
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
          return AgentSchema.parse(response.agent);
        } else {
          const toReturn = { agent: foundEarly, commands: [], extensions: [] };
          if (companies?.length && !toReturn.agent) {
            for (const company of companies) {
              log(['GQL useAgent() Checking Company', company], {
                client: 3,
              });
              const agent = company.agents.find((a) => a.name === searchName);
              if (agent) {
                toReturn.agent = agent;
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
  swrHook.mutate = chainMutations(companiesHook, originalMutate);
  return swrHook;
}
