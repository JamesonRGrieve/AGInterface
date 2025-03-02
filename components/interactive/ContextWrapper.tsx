'use client';
import AGInterfaceSDK from '@/lib/sdk';
import { getCookie } from 'cookies-next';
import OpenAI from 'openai';
import React, { ReactNode, useState } from 'react';
import log from '../jrg/next-log/log';
import { InteractiveConfig, InteractiveConfigContext, InteractiveConfigDefault } from './InteractiveConfigContext';

export default function InteractiveConfigContextWrapper({
  initialState = InteractiveConfigDefault,
  apiKey = getCookie('jwt') || '',
  backEndURI: backEndURI = process.env.NEXT_PUBLIC_API_URI,
  children,
}: {
  requireKey?: boolean;
  apiKey?: string;
  backEndURI?: string;
  initialState?: InteractiveConfig;
  children: ReactNode;
}): React.JSX.Element {
  if (process.env.NEXT_PUBLIC_ENV === 'development') {
    log(
      [InteractiveConfigDefault],
      {
        client: 2,
      },
      'Default Config Provided',
    );
    log(
      [initialState],
      {
        client: 2,
      },
      'Initial State Provided',
    );
    log(
      [
        {
          ...InteractiveConfigDefault,
          ...initialState,
          // Overridden in context provider.
          mutate: null,
        },
      ],

      {
        client: 1,
      },
      'Booting State With',
    );
  }
  const sdk: AGInterfaceSDK = new AGInterfaceSDK({
    baseUri: backEndURI,
    apiKey: apiKey,
  });
  const openai: OpenAI = new OpenAI({
    apiKey: apiKey.replace('Bearer ', ''),
    baseURL: backEndURI + '/v1',
    dangerouslyAllowBrowser: true,
  });
  // Used to determine whether to render the app or not (populates with any fetch errors from tryFetch calls).
  const [InteractiveConfigState, setInteractiveConfigState] = useState<InteractiveConfig>({
    // Default state and initializes the SDK
    ...InteractiveConfigDefault,
    ...initialState,
    // Overridden in context provider.
    sdk: sdk,
    openai: openai,
    mutate: null,
  } as InteractiveConfig);

  log([`Context Wrapper initializing AGInterfaceSDK and OpenAI with baseUri ${backEndURI} and apiKey ${apiKey}.`], {
    client: 1,
  });

  return (
    <InteractiveConfigContext.Provider
      value={{ ...InteractiveConfigState, sdk, openai: openai, mutate: setInteractiveConfigState }}
    >
      {children}
    </InteractiveConfigContext.Provider>
  );
}
