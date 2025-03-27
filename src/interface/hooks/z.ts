import { z } from 'zod';

export const ProviderSettingSchema = z.object({ name: z.string().min(1), value: z.unknown() });

export const ProviderExtensionSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  extensionId: z.string(),
  createdAt: z.string().datetime(),
});

export const ProviderSchema = z.object({
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
});
export type Provider = z.infer<typeof ProviderSchema>;
export type ProviderSetting = z.infer<typeof ProviderSettingSchema>;
export type ProviderExtension = z.infer<typeof ProviderExtensionSchema>;
export const ExecutionTypeEnum = z.enum(['STANDARD', 'CONDITIONAL', 'ITERATION', 'PARALLEL_ITERATION']);

// Aggregation strategy enum
export const AggregationStrategyEnum = z.enum(['FIRST_SUCCESS', 'MAJORITY_VOTE', 'ALL', 'CUSTOM']);

// Iteration type enum
export const IterationTypeEnum = z.enum(['FOR_EACH', 'WHILE', 'COUNT']);

export const ChainStepPromptSchema = z.object({
  chainName: z.string().nullable(),
  commandName: z.string().nullable(),
  promptCategory: z.unknown(),
  promptName: z.string().nullable(),
});

export const ChainStepSchema = z.object({
  id: z.string(),
  chainId: z.string(),
  agentId: z.string(),
  promptType: z.string().optional().nullable(),
  prompt: z.string().optional().nullable(),
  targetChainId: z.string().optional().nullable(),
  targetCommandId: z.string().optional().nullable(),
  targetPromptId: z.string().optional().nullable(),
  executionType: ExecutionTypeEnum.default('STANDARD'),
  conditionExpression: z.string().optional().nullable(),
  iterationType: IterationTypeEnum.optional().nullable(),
  iterationExpression: z.string().optional().nullable(),
  iterationVariable: z.string().optional().nullable(),
  maxIterations: z.number().int().optional().nullable(),
  parallelExecution: z.boolean().default(false),
  aggregationStrategy: AggregationStrategyEnum.optional().nullable(),
  aggregationExpression: z.string().optional().nullable(),
  maxParallelInstances: z.number().int().optional().nullable(),
  createdAt: z.string().datetime(),
  agent: z.object({ name: z.string() }).optional(),
});

export const ChainSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  companyId: z.string(),
  description: z.string().optional().nullable(),
  favourite: z.boolean(),
  createdAt: z.string().datetime(),
  steps: z.array(ChainStepSchema),
});

export const ChainsSchema = ChainSchema.pick({ id: true, name: true, favourite: true, description: true, createdAt: true });

export type Chain = z.infer<typeof ChainSchema>;
export type ChainStepPrompt = z.infer<typeof ChainStepPromptSchema>;
export type ChainStep = z.infer<typeof ChainStepSchema>;

export const PromptArgumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  defaultValue: z.string().optional().nullable(),
  promptId: z.string(),
  createdAt: z.string().datetime(),
});

export const PromptSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  companyId: z.string(),
  favourite: z.boolean(),
  description: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  arguments: z.array(PromptArgumentSchema),
  category: z.string().optional(),
});
export type Prompt = z.infer<typeof PromptSchema>;
export type PromptArgument = z.infer<typeof PromptArgumentSchema>;

export const CommandArgValueSchema = z.object({ value: z.string() });

export const CommandArgSchema = z.object({ name: z.string().min(1), value: CommandArgValueSchema });

export type CommandArgs = z.infer<typeof CommandArgSchema>;

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  // userId: z.string(),
  teamId: z.string(),
  rotationId: z.string().optional().nullable(),
  // imageUrl: z.string().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional().nullable(),
  // updatedByUser: z.string().optional().nullable(),
  // companyName: z.string().min(1).optional(),
  // Relationships
  // contextPrompts: z.array(z.any()).optional(),
  // providerInstances: z.array(z.any()).optional(),
  // providerInstanceAbilities: z.array(z.any()).optional(),
  // memories: z.array(z.any()).optional(),
  // labels: z.array(z.any()).optional(),
  // chainSteps: z.array(z.any()).optional(),
  // tasks: z.array(z.any()).optional(),
});

export type Agent = z.infer<typeof AgentSchema>;
