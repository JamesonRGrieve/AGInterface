'use client';
import Gravatar from '@/components/jrg/auth/management/Gravatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { useSearchParams } from 'next/navigation';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { LuMenu as Menu } from 'react-icons/lu';
import useSWR from 'swr';
import AppWrapper from '../jrg/appwrapper/AppWrapper';
import log from '../jrg/next-log/log';
import Chat from './Chat/Chat';
import ContextWrapper from './ContextWrapper';
import Form from './Form/Form';
import { InteractiveConfig, InteractiveConfigDefault, Overrides } from './InteractiveConfigContext';
import { AgentSelector } from './Selectors/AgentSelector';
import ConversationSelector from './Selectors/ConversationSelector';
import PromptSelector from './Selectors/PromptSelector';

export type FormProps = {
  fieldOverrides?: { [key: string]: ReactNode };
  formContext?: object;
  additionalFields?: { [key: string]: ReactNode };
  additionalOutputButtons: { [key: string]: ReactNode };
  onSubmit?: (data: object) => void;
};
export type UIProps = {
  showAppBar?: boolean;
  showSelectorsCSV?: string;
  showChatThemeToggles?: boolean;
  enableFileUpload?: boolean;
  enableVoiceInput?: boolean;
  alternateBackground?: 'primary' | 'secondary';
  footerMessage?: string;
  showOverrideSwitchesCSV?: string;
};
export type ServerProps = {
  apiKey: string;
  backEndURI: string;
};
export type AGInteractiveProps = {
  agent?: string;
  overrides?: Overrides;
  uiConfig?: UIProps;
  serverConfig?: ServerProps;
  formConfig?: FormProps;
};
const selectionBars = {
  agent: <AgentSelector key='agent' />,
  conversation: <ConversationSelector key='conversation' />,
  prompt: <PromptSelector key='prompt' />,
  '': <span>&nbsp;</span>,
};
function removeUndefined(obj: object): object {
  return Object.keys(obj).reduce((acc: object, key: string) => {
    if (obj[key.toString()] && typeof obj[key.toString()] === 'object') {
      const childObject = removeUndefined(obj[key.toString()]);
      if (Object.keys(childObject).length > 0) {
        acc[key.toString()] = childObject;
      }
    } else if (![undefined, null, ''].includes(obj[key.toString()])) {
      acc[key.toString()] = obj[key.toString()];
    }
    return acc;
  }, {});
}
// eslint-disable-next-line sonarjs/cognitive-complexity -- Can't be simplified past this without being less maintainable.
const generateSearchParamConfig = (searchParams: URLSearchParams): InteractiveConfig =>
  removeUndefined({
    agent: searchParams.get('agent') || undefined,
    sdk: undefined,
    openai: undefined,
    overrides: {
      mode: (searchParams.get('mode') as 'prompt' | 'chain' | 'command') || undefined,
      prompt: searchParams.get('prompt') || undefined,
      promptCategory: searchParams.get('promptCategory') || undefined,
      command: searchParams.get('command') || undefined,
      commandArgs: JSON.parse(searchParams.get('commandArgs')) || undefined,
      commandMessageArg: searchParams.get('commandMessageArg') || undefined,
      chain: searchParams.get('chain') || undefined,
      chainRunConfig: {
        chainArgs: JSON.parse(searchParams.get('chainArgs')) || undefined,
        singleStep: Boolean(searchParams.get('singleStep')) || undefined,
        fromStep: Number(searchParams.get('fromStep')) || undefined,
        allResponses: Boolean(searchParams.get('allResponses')) || undefined,
      },
      contextResults: Number(searchParams.get('contextResults')) || undefined,
      shots: Number(searchParams.get('shots')) || undefined,
      websearchDepth: Number(searchParams.get('websearchDepth')) || undefined,
      injectMemoriesFromCollectionNumber: Number(searchParams.get('injectMemoriesFromCollectionNumber')) || undefined,
      conversationResults: Number(searchParams.get('results')) || undefined,
      conversation: searchParams.get('conversation') || undefined,
      conversationID: searchParams.get('conversationID') || undefined,
      browseLinks: Boolean(searchParams.get('browseLinks')) || undefined,
      webSearch: Boolean(searchParams.get('webSearch')) || undefined,
      insightAgentName: searchParams.get('insightAgent') || undefined,
      enableMemory: Boolean(searchParams.get('memory')) || undefined,
    },
    mutate: undefined,
  }) as InteractiveConfig;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
const Stateful = (props: AGInteractiveProps): React.JSX.Element => {
  const searchParams = useSearchParams();
  const searchParamConfig = generateSearchParamConfig(searchParams);

  const uuid = getCookie('uuid');
  if (process.env.NEXT_PUBLIC_AGINTERACTIVE_CONVERSATION_MODE === 'uuid' && !uuid) {
    setCookie('uuid', crypto.randomUUID(), { domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN, maxAge: 2147483647 });
  }
  log(['Overrides Prop Provided to Stateful:', props.overrides], { client: 3, server: 3 });
  log(['UI Config Provided to Stateful:', props.uiConfig], { client: 3, server: 3 });
  log(['Server Config Prop Provided to Stateful:', props.serverConfig], { client: 3, server: 3 });
  return (
    <ContextWrapper
      apiKey={props.serverConfig?.apiKey || process.env.NEXT_PUBLIC_AGINTERACTIVE_API_KEY || getCookie('jwt') || ''}
      backEndURI={props.serverConfig?.backEndURI || process.env.NEXT_PUBLIC_API_URI || 'http://localhost:7437'}
      initialState={{
        ...InteractiveConfigDefault,
        agent: props.agent ?? process.env.NEXT_PUBLIC_AGINTERACTIVE_AGENT ?? InteractiveConfigDefault.agent,
        overrides: {
          ...InteractiveConfigDefault.overrides,
          mode: process.env.NEXT_PUBLIC_AGINTERACTIVE_MODE,
          prompt: process.env.NEXT_PUBLIC_AGINTERACTIVE_PROMPT_NAME,
          promptCategory: process.env.NEXT_PUBLIC_AGINTERACTIVE_PROMPT_CATEGORY,
          chain: process.env.NEXT_PUBLIC_AGINTERACTIVE_CHAIN,
          command: process.env.NEXT_PUBLIC_AGINTERACTIVE_COMMAND,
          commandMessageArg: process.env.NEXT_PUBLIC_AGINTERACTIVE_COMMAND_MESSAGE_ARG,
          conversation:
            process.env.NEXT_PUBLIC_AGINTERACTIVE_CONVERSATION_MODE === 'uuid'
              ? uuid
              : process.env.NEXT_PUBLIC_AGINTERACTIVE_CONVERSATION_NAME,
          ...props.overrides,
        },
        ...(process.env.NEXT_PUBLIC_AGINTERACTIVE_ENABLE_SEARCHPARAM_CONFIG === 'true' ? searchParamConfig : {}),
        ...(getCookie('aginteractive-conversation') && {
          overrides: {
            conversation: getCookie('aginteractive-conversation'),
          },
        }),
      }}
    >
      <Interactive {...props.overrides} {...props.uiConfig} />
    </ContextWrapper>
  );
};
const Interactive = (props: Overrides & UIProps): React.JSX.Element => {
  const mobile = useMediaQuery('(max-width: 1100px)');
  const menuItem = (): ReactNode => (
    <div className='flex flex-col gap-2 p-2'>
      {props.showSelectorsCSV?.split(',').map((selector) => selectionBars[String(selector)])}
    </div>
  );
  const {
    data: user,
    isLoading,
    error,
  } = useSWR('/user', async () => {
    return (
      await axios.get(`${process.env.NEXT_PUBLIC_API_URI}/v1/user`, {
        headers: {
          Authorization: `${getCookie('jwt')}`,
        },
      })
    ).data;
  });
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  return (
    <AppWrapper
      header={
        props.showAppBar && {
          components: {
            left: mobile ? (
              {
                icon: <Menu />,
                swr: (): object => {
                  return {};
                },
                menu: menuItem,
                width: mobile ? '12rem' : '30rem',
              }
            ) : (
              <Box display='flex' gap='1rem' width='100%' maxWidth='32rem'>
                {props.showSelectorsCSV
                  ?.split(',')
                  .map((selector) =>
                    selector === 'conversation' && props.showSelectorsCSV?.split(',').length > 1
                      ? null
                      : selectionBars[selector],
                  )}
              </Box>
            ),
            right: (
              <>
                {props.showSelectorsCSV &&
                  (!mobile && props.showSelectorsCSV.includes('conversation') && props.showSelectorsCSV.includes(',') ? (
                    <div className='w-full flex min-w-48'>{selectionBars['conversation']}</div>
                  ) : undefined)}

                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                      }}
                      className='p-0'
                    >
                      {user?.email ? (
                        <Gravatar email={user.email} className='w-8 h-8 rounded-full' />
                      ) : (
                        <Menu className='w-5 h-5' />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Menu</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ),
          },
        }
      }
      footer={
        props.footerMessage
          ? {
              components: {
                center: (
                  <div className='text-center'>
                    <p className='text-sm m-0'>{props.footerMessage}</p>
                  </div>
                ),
              },
            }
          : undefined
      }
    >
      {process.env.NEXT_PUBLIC_INTERACTIVE_UI === 'form' ? (
        <Form
          mode={props.mode}
          showChatThemeToggles={props.showChatThemeToggles}
          enableFileUpload={props.enableFileUpload}
          enableVoiceInput={props.enableVoiceInput}
          showOverrideSwitchesCSV={props.showOverrideSwitchesCSV}
        />
      ) : (
        <Chat
          mode={props.mode}
          showChatThemeToggles={props.showChatThemeToggles}
          alternateBackground={props.alternateBackground}
          enableFileUpload={props.enableFileUpload}
          enableVoiceInput={props.enableVoiceInput}
          showOverrideSwitchesCSV={props.showOverrideSwitchesCSV}
        />
      )}
    </AppWrapper>
  );
};
const AGInteractive = ({
  stateful = true,
  agent,
  overrides = {
    mode: (process.env.NEXT_PUBLIC_AGINTERACTIVE_MODE &&
    ['chain', 'prompt'].includes(process.env.NEXT_PUBLIC_AGINTERACTIVE_MODE)
      ? process.env.NEXT_PUBLIC_AGINTERACTIVE_MODE
      : 'prompt') as 'chain' | 'prompt',
  },
  serverConfig = null,
  uiConfig = {},
}: AGInteractiveProps & { stateful?: boolean; agent?: string }): React.JSX.Element => {
  const uiConfigWithEnv = useMemo(
    () => ({
      showAppBar: process.env.NEXT_PUBLIC_AGINTERACTIVE_SHOW_APP_BAR === 'true', // Show the conversation selection bar to create, delete, and export conversations
      showRLHF: process.env.NEXT_PUBLIC_AGINTERACTIVE_RLHF === 'true',
      showChatThemeToggles: process.env.NEXT_PUBLIC_AGINTERACTIVE_SHOW_CHAT_THEME_TOGGLES === 'true',
      footerMessage: process.env.NEXT_PUBLIC_AGINTERACTIVE_FOOTER_MESSAGE || '',
      showOverrideSwitchesCSV: process.env.NEXT_PUBLIC_AGINTERACTIVE_SHOW_OVERRIDE_SWITCHES || '',
      alternateBackground: 'primary' as 'primary' | 'secondary',
      showSelectorsCSV: process.env.NEXT_PUBLIC_AGINTERACTIVE_SHOW_SELECTION,
      enableVoiceInput: process.env.NEXT_PUBLIC_AGINTERACTIVE_VOICE_INPUT_ENABLED === 'true',
      enableFileUpload: process.env.NEXT_PUBLIC_AGINTERACTIVE_FILE_UPLOAD_ENABLED === 'true',
      enableMessageDeletion: process.env.NEXT_PUBLIC_AGINTERACTIVE_ALLOW_MESSAGE_DELETION === 'true',
      enableMessageEditing: process.env.NEXT_PUBLIC_AGINTERACTIVE_ALLOW_MESSAGE_EDITING === 'true',
      ...uiConfig,
    }),
    [uiConfig],
  );
  log(
    [
      `AGInteractive initialized as ${stateful ? '' : 'not '}stateful. ${
        stateful
          ? 'AGInteractive will provide its own InteractiveConfigContext Provider and state.'
          : 'Assuming a InteractiveConfigContext Provider encloses this instance.'
      }`,
    ],
    { client: 3, server: 3 },
  );
  log(['Initializing user interface with options: ', uiConfigWithEnv], { client: 3, server: 3 });
  log(['Configuration Provided From Server: ', serverConfig, uiConfig], { client: 3, server: 3 });
  return stateful ? (
    <Stateful overrides={overrides} serverConfig={serverConfig} uiConfig={uiConfigWithEnv} agent={agent} />
  ) : (
    <Interactive {...uiConfigWithEnv} {...overrides} />
  );
};
export default AGInteractive;
