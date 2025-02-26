import { getCookie } from 'cookies-next';
import { GraphQLClient } from 'graphql-request';

// Import all types from the centralized schema file

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a configured GraphQL client instance
 * @returns Configured GraphQLClient instance
 */
export const createGraphQLClient = (): GraphQLClient =>
  new GraphQLClient(`${process.env.NEXT_PUBLIC_AGINTERACTIVE_SERVER}/graphql`, {
    headers: { authorization: getCookie('jwt') || '' },
  });

/**
 * Helper to chain mutations between hooks
 * @param parentHook - Parent hook containing mutate function
 * @param currentHook - Current hook's mutate function
 */
export const chainMutations = (parentHook: any, originalMutate: () => Promise<any>) => {
  return async () => {
    await parentHook.mutate();
    return originalMutate();
  };
};
