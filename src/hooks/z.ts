import z from '@/zod2gql';

export const ProviderSettingSchema = z.object({ name: z.string().min(1), value: z.unknown() });

export const ProviderExtensionSchema = z
  .object({
    id: z.string(),
    providerId: z.string(),
    extensionId: z.string(),
    createdAt: z.string().datetime(),
  })
  .describe('ProviderExtension');

export const ProviderSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    agentSettingsJson: z.string().optional().nullable(),
    clientId: z.string().optional().nullable(),
    clientSecret: z.string().optional().nullable(),
    authUrl: z.string().optional().nullable(),
    tokenUrl: z.string().optional().nullable(),
    userinfoUrl: z.string().optional().nullable(),
    scopeDelimiter: z.string().optional().default(' '),
    createdAt: z.string().datetime(),
    friendlyName: z.string().min(1).optional(),
    description: z.string().optional(),
    services: z.unknown().optional(),
    settings: z.array(ProviderSettingSchema).optional(),
    extensions: z.array(ProviderExtensionSchema).optional(),
  })
  .describe('Provider');
export type Provider = z.infer<typeof ProviderSchema>;
export type ProviderSetting = z.infer<typeof ProviderSettingSchema>;
export type ProviderExtension = z.infer<typeof ProviderExtensionSchema>;
