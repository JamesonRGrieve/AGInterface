'use client';
import AGInterfaceSDK from '@/lib/sdk';
import OpenAI from 'openai';
import { Context, createContext, useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ConfigDefault = require('./InteractiveConfigDefault');

export type ChainConfig = {
  chainArgs: object;
  singleStep: boolean;
  fromStep: number;
  allResponses: boolean;
};
export type Overrides = {
  mode?: 'prompt' | 'chain' | 'command';
  prompt?: string;
  promptCategory?: string;
  command?: string;
  commandArgs?: object;
  commandMessageArg?: string;
  chain?: string;
  chainRunConfig?: ChainConfig;
  contextResults?: number;
  shots?: number;
  websearchDepth?: number;
  injectMemoriesFromCollectionNumber?: number;
  conversationResults?: number;
  conversation?: string;
  conversationID?: string;
  browseLinks?: boolean;
  webSearch?: boolean;
  insightAgentName?: string;
  enableMemory?: boolean;
};
export type InteractiveConfig = {
  agent: string;
  sdk: AGInterfaceSDK;
  openai?: OpenAI;
  overrides?: Overrides;
  mutate?: (InteractiveConfig) => void | ((previous: InteractiveConfig) => InteractiveConfig);
};
export const InteractiveConfigContext: Context<InteractiveConfig> = createContext<InteractiveConfig>(
  ConfigDefault as unknown as InteractiveConfig,
);
export const InteractiveConfigDefault = ConfigDefault;

export const useInteractiveConfig = (): InteractiveConfig => {
  const context = useContext(InteractiveConfigContext);

  if (context === undefined) {
    throw new Error('No InteractiveConfigContext found');
  }

  return context;
};
