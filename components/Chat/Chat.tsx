import { useContext, useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { ChatProps, UIProps } from '../InteractiveAGiXT';
import { ChatContext } from '../../types/ChatContext';
import ConversationHistory from './ChatLog';
import ConversationBar from './ChatBar';
import OpenAI from 'openai';
import { getCookie } from 'cookies-next';

const conversationSWRPath = /conversation/;
export default function Chat({ mode, showChatThemeToggles, alternateBackground }: ChatProps & UIProps): React.JSX.Element {
  // console.log('Chat Themes: ', showChatThemeToggles);
  const [loading, setLoading] = useState(false);
  const [latestMessage, setLatestMessage] = useState('');
  const state = useContext(ChatContext);

  const conversation = useSWR(
    conversationSWRPath + state.chatSettings.conversationName,
    async () => await state.sdk.getConversation('', state.chatSettings.conversationName, 100, 1),
    {
      fallbackData: [],
    },
  );

  async function chat(message, files): Promise<string> {
    const openai: OpenAI = new OpenAI({
      apiKey: getCookie('jwt'),
      baseURL: process.env.NEXT_PUBLIC_AGIXT_SERVER + '/v1',
      dangerouslyAllowBrowser: true,
    });
    const messages = [];
    // console.log(message);
    if (typeof message === 'object' && message.type === 'audio_url') {
      messages.push({
        role: 'user',
        content: [message],
      });
    } else {
      if (files?.length > 0) {
        const fileContents = await Promise.all(
          files.map((file) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = function (event): any {
                const base64Content = Buffer.from(event.target.result as string, 'binary').toString('base64');
                resolve({
                  type: `${file.type.split('/')[0]}_url`,
                  [`${file.type.split('/')[0]}_url`]: {
                    url: `data:${file.type};base64,${base64Content}`,
                  },
                });
              };
              reader.onerror = reject;
              reader.readAsBinaryString(file);
            });
          }),
        );
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: message },
            ...fileContents, // Spread operator to include all file contents
          ],
        });
      } else {
        messages.push({ role: 'user', content: message });
      }
    }

    const toOpenAI = {
      messages: messages,
      model: state.chatSettings.selectedAgent,
      user: state.chatSettings.conversationName,
    };
    setLoading(true);
    setLatestMessage(message);
    // console.log('Sending: ', toOpenAI);
    const chatCompletion = await openai.chat.completions.create(toOpenAI);
    mutate(conversationSWRPath + state.chatSettings.conversationName);
    setLoading(false);
    setLatestMessage('');
    if (chatCompletion?.choices[0]?.message.content.length > 0) {
      return chatCompletion.choices[0].message.content;
    } else {
      return 'Unable to get response from the agent';
    }
  }
  useEffect(() => {
    // console.log("Conversation changed, fetching new conversation's messages.", state.chatSettings.conversationName);
    mutate(conversationSWRPath + state.chatSettings.conversationName);
  }, [state.chatSettings.conversationName]);
  return (
    <>
      <ConversationHistory
        conversation={conversation.data}
        latestMessage={latestMessage}
        alternateBackground={alternateBackground}
      />
      <ConversationBar
        onSend={(message, files) => chat(message, files)}
        disabled={loading}
        mode={mode}
        showChatThemeToggles={showChatThemeToggles}
      />
    </>
  );
}
