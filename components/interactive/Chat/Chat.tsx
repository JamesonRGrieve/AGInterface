'use client';

import { SidebarContent } from '@/components/jrg/appwrapper/SidebarContentManager';
import { useCompany } from '@/components/jrg/auth/hooks/useUser';
import log from '@/components/jrg/next-log/log';
import { toast } from '@/hooks/useToast';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { UIProps } from '../AGInteractive';
import { InteractiveConfigContext, Overrides } from '../InteractiveConfigContext';
import { useConversations } from '../hooks/useConversation';
import ChatBar from './ChatInput';
import ChatLog from './ChatLog';

export async function getAndFormatConversastion(state): Promise<any[]> {
  const rawConversation = await state.sdk.getConversation('', state.overrides.conversation, 100, 1);
  log(['Raw conversation: ', rawConversation], { client: 3 });
  return rawConversation.reduce((accumulator, currentMessage: { id: string; message: string }) => {
    const messageType = currentMessage.message.split(' ')[0];
    if (messageType.startsWith('[SUBACTIVITY]')) {
      let target;
      const parent = messageType.split('[')[2].split(']')[0];

      const parentIndex = accumulator.findIndex((message) => {
        return message.id === parent || message.children.some((child) => child.id === parent);
      });
      if (parentIndex !== -1) {
        if (accumulator[parentIndex].id === parent) {
          target = accumulator[parentIndex];
        } else {
          target = accumulator[parentIndex].children.find((child) => child.id === parent);
        }
        target.children.push({ ...currentMessage, children: [] });
      } else {
        throw new Error(
          `Parent message not found for subactivity ${currentMessage.id} - ${currentMessage.message}, parent ID: ${parent}`,
        );
      }
    } else {
      accumulator.push({ ...currentMessage, children: [] });
    }
    return accumulator;
  }, []);
}

const conversationSWRPath = '/conversation/';
export default function Chat({
  showChatThemeToggles,
  alternateBackground,
  enableFileUpload,
  enableVoiceInput,
  showOverrideSwitchesCSV,
}: Overrides & UIProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const state = useContext(InteractiveConfigContext);
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();

  // Find the current conversation
  const currentConversation = conversations?.find((conv) => conv.id === state.overrides.conversation);
  const conversation = useSWR(
    conversationSWRPath + state.overrides.conversation,
    async () => {
      return await getAndFormatConversastion(state);
    },
    {
      fallbackData: [],
      refreshInterval: loading ? 1000 : 0,
    },
  );
  const { data: activeCompany } = useCompany();
  useEffect(() => {
    if (Array.isArray(state.overrides.conversation)) {
      state.mutate((oldState) => ({
        ...oldState,
        overrides: { ...oldState.overrides, conversation: oldState.overrides.conversation[0] },
      }));
    }
  }, [state.overrides.conversation]);
  async function chat(messageTextBody, messageAttachedFiles): Promise<string> {
    const messages = [];

    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: messageTextBody },
        ...Object.entries(messageAttachedFiles).map(([fileName, fileContent]: [string, string]) => ({
          type: `${fileContent.split(':')[1].split('/')[0]}_url`,
          file_name: fileName,
          [`${fileContent.split(':')[1].split('/')[0]}_url`]: {
            url: fileContent,
          },
        })), // Spread operator to include all file contents
      ],
      ...(activeCompany?.id ? { company_id: activeCompany?.id } : {}),
      ...(getCookie('aginteractive-create-image') ? { create_image: getCookie('aginteractive-create-image') } : {}),
      ...(getCookie('aginteractive-tts') ? { tts: getCookie('aginteractive-tts') } : {}),
      ...(getCookie('aginteractive-websearch') ? { websearch: getCookie('aginteractive-websearch') } : {}),
      ...(getCookie('aginteractive-analyze-user-input')
        ? { analyze_user_input: getCookie('aginteractive-analyze-user-input') }
        : {}),
    });

    const toOpenAI = {
      messages: messages,
      model: getCookie('aginteractive-agent'),
      user: state.overrides.conversation,
    };
    setLoading(true);
    log(['Sending: ', state.openai, toOpenAI], { client: 1 });
    // const req = state.openai.chat.completions.create(toOpenAI);
    await new Promise((resolve) => setTimeout(resolve, 100));
    mutate(conversationSWRPath + state.overrides.conversation);
    try {
      const completionResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_AGINTERACTIVE_SERVER}/v1/chat/completions`,
        {
          ...toOpenAI,
        },
        {
          headers: {
            Authorization: getCookie('jwt'),
          },
        },
      );
      if (completionResponse.status === 200) {
        const chatCompletion = completionResponse.data;
        log(['RESPONSE: ', chatCompletion], { client: 1 });
        state.mutate((oldState) => ({
          ...oldState,
          overrides: {
            ...oldState.overrides,
            conversation: chatCompletion.id,
          },
        }));
        router.push(`/chat/${chatCompletion.id}`);
        // let response;
        // if (state.overrides.conversation === '-') {
        //   response = await state.sdk.renameConversation(state.agent, state.overrides.conversation);
        //   // response = await axios.put(
        //   //   `${process.env.NEXT_PUBLIC_AGINTERACTIVE_SERVER}/api/conversation`,
        //   //   {
        //   //     agent_name: state.agent,
        //   //     conversation_name: state.overrides?.conversation,
        //   //     new_name: '-',
        //   //   },
        //   //   {
        //   //     headers: {
        //   //       Authorization: getCookie('jwt'),
        //   //     },
        //   //   },
        //   // );
        //   await mutate('/conversation');
        //   log([response], { client: 1 });
        // }
        setLoading(false);
        mutate(conversationSWRPath + response);
        mutate('/user');

        if (chatCompletion?.choices[0]?.message.content.length > 0) {
          return chatCompletion.choices[0].message.content;
        } else {
          throw 'Failed to get response from the agent';
        }
      } else {
        throw 'Failed to get response from the agent';
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to get response from the agent',
        duration: 5000,
      });
    }
  }
  const handleDeleteConversation = async (): Promise<void> => {
    await state.sdk.deleteConversation(currentConversation?.id || '-');
    await mutate();
    state.mutate((oldState) => ({
      ...oldState,
      overrides: { ...oldState.overrides, conversation: '-' },
    }));
  };

  const handleExportConversation = async (): Promise<void> => {
    // Get the full conversation content
    const conversationContent = await state.sdk.getConversation('', currentConversation?.id || '-');

    // Format the conversation for export
    const exportData = {
      name: currentConversation?.name || 'New',
      id: currentConversation?.id || '-',
      created_at: currentConversation?.created_at || new Date().toISOString(),
      messages: conversationContent.map((msg) => ({
        role: msg.role,
        content: msg.message,
        timestamp: msg.timestamp,
      })),
    };

    // Create and trigger download
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${currentConversation?.name || 'New'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const [newName, setNewName] = useState('');
  const router = useRouter();

  useEffect(() => {
    mutate(conversationSWRPath + state.overrides.conversation);
  }, [state.overrides.conversation]);
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        mutate(conversationSWRPath + state.overrides.conversation);
      }, 1000);
    }
  }, [loading, state.overrides.conversation]);
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);
  return (
    <>
      <SidebarContent title='Conversation Management'>
        <SidebarGroup>
          {
            <div className='w-full group-data-[collapsible=icon]:hidden'>
              {renaming ? (
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className='w-full' />
              ) : (
                <h4>{currentConversation?.name}</h4>
              )}
              {currentConversation && currentConversation.attachment_count > 0 && (
                <Badge className='gap-1'>
                  <Paperclip className='w-3 h-3' />
                  {currentConversation.attachment_count}
                </Badge>
              )}
            </div>
          }
          <SidebarGroupLabel>Conversation Functions</SidebarGroupLabel>
          <SidebarMenu>
            {[
              {
                title: 'New Conversation',
                icon: Plus,
                func: () => {
                  router.push('/chat');
                },
                disabled: renaming,
              },
              {
                title: renaming ? 'Save Name' : 'Rename Conversation',
                icon: renaming ? Check : Pencil,
                func: renaming
                  ? () => {
                      state.sdk.renameConversation(state.agent, currentConversation.id, newName);
                      setRenaming(false);
                    }
                  : () => setRenaming(true),
                disabled: false,
              },
              {
                title: 'Import Conversation',
                icon: Upload,
                func: () => {
                  // setImportMode(true);
                  // setIsDialogOpen(true);
                },
                disabled: true,
              },
              {
                title: 'Export Conversation',
                icon: Download,
                func: () => handleExportConversation(),
                disabled: renaming,
              },
              {
                title: 'Delete Conversation',
                icon: Trash2,
                func: () => {
                  console.log('DELETE');
                  handleDeleteConversation();
                },
                disabled: renaming,
              },
            ].map(
              (item) =>
                item.visible !== false && (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton side='left' tooltip={item.title} onClick={item.func} disabled={item.disabled}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <ChatLog
        conversation={conversation.data}
        alternateBackground={alternateBackground}
        setLoading={setLoading}
        loading={loading}
      />
      <ChatBar
        onSend={chat}
        disabled={loading}
        showChatThemeToggles={showChatThemeToggles}
        enableFileUpload={enableFileUpload}
        enableVoiceInput={enableVoiceInput}
        loading={loading}
        setLoading={setLoading}
        showOverrideSwitchesCSV={showOverrideSwitchesCSV}
        showResetConversation={
          process.env.NEXT_PUBLIC_AGINTERACTIVE_SHOW_CONVERSATION_BAR !== 'true' &&
          process.env.NEXT_PUBLIC_AGINTERACTIVE_CONVERSATION_MODE === 'uuid'
        }
      />
    </>
  );
}
