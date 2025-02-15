import useSWR, { SWRResponse } from 'swr';
import { z } from 'zod';
import log from '../../jrg/next-log/log';
import { createGraphQLClient } from './lib';

export const ProviderSettingSchema = z.object({
  name: z.string().min(1),
  value: z.unknown(),
});

export const ProviderSchema = z.object({
  name: z.string().min(1),
  friendlyName: z.string().min(1),
  description: z.string(),
  services: z.unknown(),
  settings: z.array(ProviderSettingSchema),
});

export type Provider = z.infer<typeof ProviderSchema>;
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
        const query = ProviderSchema.toGQL('query', 'GetProvider', { providerName });
        const response = await client.request<Provider>(query, { providerName });
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
