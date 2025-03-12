import log from '@/next-log/log';
import useSWR, { SWRResponse } from 'swr';
import { z } from 'zod';
import { createGraphQLClient } from '../../interactive/src/hooks/lib';
import { Chain, ChainSchema, ChainsSchema } from './z';

// ============================================================================
// Chain Related Hooks
// ============================================================================

/**
 * Hook to fetch and manage chain data
 * @param chainName - Optional chain name to fetch specific chain
 * @returns SWR response containing chain data
 */
export function useChain(chainName?: string): SWRResponse<Chain | null> {
  const client = createGraphQLClient();

  return useSWR<Chain | null>(
    chainName ? [`/chain`, chainName] : null,
    async (): Promise<Chain | null> => {
      try {
        const query = ChainSchema.toGQL('query', 'GetChain', { chainName: chainName });
        log(['GQL useChain() Query', query], {
          client: 3,
        });
        const response = await client.request<{ chain: Chain }>(query, { chainName: chainName });
        log(['GQL useChain() Response', response], {
          client: 3,
        });
        const validated = ChainSchema.parse(response.chain);
        log(['GQL useChain() Validated', validated], {
          client: 3,
        });
        return validated;
      } catch (error) {
        log(['GQL useChain() Error', error], {
          client: 1,
        });
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
        log(['GQL useChains() Query', query], {
          client: 3,
        });
        const response = await client.request<{ chains: Chain[] }>(query);
        log(['GQL useChains() Response', response], {
          client: 3,
        });
        const validated = z.array(ChainsSchema).parse(response.chains);
        log(['GQL useChains() Validated', validated], {
          client: 3,
        });
        return validated;
      } catch (error) {
        log(['GQL useChains() Error', error], {
          client: 1,
        });
        return [];
      }
    },
    { fallbackData: [] },
  );
}
