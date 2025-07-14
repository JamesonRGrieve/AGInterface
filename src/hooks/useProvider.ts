import { createGraphQLClient } from '@/auth/hooks/lib';
import log from '@/next-log/log';
import useSWR, { SWRResponse } from 'swr';
import { z } from 'zod';
import { Provider, ProviderSchema } from './z';

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
      try {
        const query = ProviderSchema.toGQL('query', 'GetProvider', {
          providerName,
        });
        const response = await client.request<Provider>(query, {
          providerName,
        });
        const validated = ProviderSchema.parse(response);
        return validated.provider;
      } catch (error) {
        log(['GQL useProvider() Error', error], {
          client: 1,
        });
        return null;
      }
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
      try {
        const query = ProviderSchema.toGQL('query', 'GetProviders');
        const response = await client.request<Provider[]>(query);
        log(['GQL useProviders() Response', response], {
          client: 3,
        });
        const validated = z.array(ProviderSchema).parse(response.providers);
        log(['GQL useProviders() Validated', validated], {
          client: 3,
        });
        return validated;
      } catch (error) {
        log(['GQL useProviders() Error', error], {
          client: 1,
        });
        return [];
      }
    },
    { fallbackData: [] },
  );
}
