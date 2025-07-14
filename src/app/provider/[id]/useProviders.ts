import { getCookie } from 'cookies-next';
import axios from 'axios';
import useSWR, { SWRResponse } from 'swr';

export interface ProviderInstance {
  provider_id: string;
  team_id: string;
  user_id: string;
  name: string;
  updated_at: string;
  updated_by_user_id: string;
  id: string;
  created_at: string;
  created_by_user_id: string;
  model_name: string;
  api_key: string;
  enabled: boolean;
}



/**
 * Hook to fetch provider instances for the current team
 * @returns SWR response containing array of provider instances
 */
export function useProviderInstances(): SWRResponse<ProviderInstance[]> {
  return useSWR<ProviderInstance[]>(
    ['/provider-instances', getCookie('auth-team'), getCookie('jwt')],
    async (): Promise<ProviderInstance[]> => {
      const teamId = getCookie('auth-team');
      if (!teamId) return [];
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URI}/v1/provider/instance?target_team_id=${teamId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('jwt')}`,
            },
          }
        );
        
        return response.data.provider_instances || [];
      } catch (error) {
        return [];
      }
    },
    { fallbackData: [] },
  );
}



/**
 * Hook to fetch a specific provider instance by ID
 * @param id The provider instance ID
 * @returns SWR response containing the provider instance
 */
export function useProviderInstance(id: string | undefined): SWRResponse<ProviderInstance | null> {
  return useSWR<ProviderInstance | null>(
    id ? ['/provider-instance', id, getCookie('jwt')] : null,
    async (): Promise<ProviderInstance | null> => {
      if (!id) return null;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URI}/v1/provider/instance/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('jwt')}`,
            },
          }
        );
        return response.data.provider_instance || null;
      } catch (error) {
        return null;
      }
    },
    { fallbackData: null },
  );
}