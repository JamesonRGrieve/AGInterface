import { useRouter } from 'next/navigation';
import useSWR, { SWRResponse } from 'swr';
import { createGraphQLClient } from '../../interactive/src/hooks/lib';
import { Prompt, PromptSchema } from './z';
import log from '@/next-log/log';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import { useToast } from '@/hooks/useToast';

/**
 * Hook to fetch and manage all prompts and categories
 * @returns SWR response containing prompts array and categories array with management functions
 */
export function usePrompts(): SWRResponse<Prompt[]> & {
  create: (name: string, content: string) => Promise<void>;
  import: (name: string, file: File) => Promise<void>;
} {
  const client = createGraphQLClient();
  const { toast } = useToast();
  const { sdk: sdk } = useInteractiveConfig();
  const router = useRouter();

  const swrHook = useSWR<Prompt[]>(
    '/prompts',
    async (): Promise<Prompt[]> => {
      try {
        const query = PromptSchema.toGQL('query', 'GetPrompts');
        const response = await client.request(query);
        return response.prompts || [];
      } catch (error) {
        log(['GQL usePrompts() Error', error], {
          client: 1,
        });
        return [];
      }
    },
    { fallbackData: [] },
  );

  return Object.assign(swrHook, {
    create: async (name: string, content: string) => {
      try {
        await sdk.addPrompt(name, content);
        swrHook.mutate();
        router.push(`/settings/prompts?prompt=${name}`);
        toast({
          title: 'Success',
          description: 'Prompt Created',
          duration: 5000,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to Create Prompt',
          duration: 5000,
        });
        console.error(error);
        throw error;
      }
    },
    import: async (name: string, file: File) => {
      name = name || file.name.replace('.json', '');
      await sdk.addPrompt(name, await file.text());
      router.push(`/settings/prompts?&prompt=${name}`);
    },
  });
}

/**
 * Hook to get a specific prompt by name from the prompts list
 * @param name - Name of the prompt to find
 * @returns SWR response containing prompt data if found
 */
export function usePrompt(name: string): SWRResponse<Prompt | null> & {
  delete: () => Promise<void>;
  rename: (newName: string) => Promise<void>;
  update: (content: string) => Promise<void>;
  export: () => Promise<void>;
} {
  const promptsHook = usePrompts();
  const { data: prompts, error: promptsError, isLoading: promptsLoading, mutate: promptsMutate } = promptsHook;
  const { sdk: sdk } = useInteractiveConfig();
  const { toast } = useToast();
  const router = useRouter();
  const swrHook = useSWR<Prompt | null>([name, prompts], () => prompts?.find((p) => p.name === name) || null, {
    fallbackData: null,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const isLoading = promptsLoading || swrHook.isLoading;
  const error = promptsError || swrHook.error;
  return Object.assign(
    { ...swrHook, isLoading, error },
    {
      delete: async () => {
        try {
          await sdk.deletePrompt(name);
          promptsMutate();
          router.push(`/settings/prompts?prompt=${(prompts && prompts.filter((p) => p.name !== name)[0]?.name) || ''}`);
          toast({
            title: 'Success',
            description: 'Prompt Deleted',
            duration: 5000,
          });
        } catch (error) {
          console.error(error);
          toast({
            title: 'Error',
            description: 'Failed to Delete Prompt',
            duration: 5000,
          });
          throw error;
        }
      },
      rename: async (newName: string) => {
        try {
          await sdk.renamePrompt(name, newName);
          swrHook.mutate();
          promptsMutate();
          toast({
            title: 'Success',
            description: 'Prompt Renamed',
            duration: 5000,
          });
        } catch (error) {
          console.error(error);
          toast({
            title: 'Error',
            description: 'Failed to Rename Prompt',
            duration: 5000,
          });
          throw error;
        }
      },
      update: async (content: string) => {
        try {
          await sdk.updatePrompt(name, content);
          swrHook.mutate();
          toast({
            title: 'Success',
            description: 'Prompt Updated',
            duration: 5000,
          });
        } catch (error) {
          console.error(error);
          toast({
            title: 'Error',
            description: 'Failed to Update Prompt',
            duration: 5000,
          });
          throw error;
        }
      },
      export: async () => {
        if (!swrHook.data) {
          toast({
            title: 'Error',
            description: 'No Active Prompt to Export',
            duration: 5000,
          });
          return;
        }
        const element = document.createElement('a');
        const file = new Blob([swrHook.data?.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `AGInteractive-Prompt-${name}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      },
    },
  );
}
