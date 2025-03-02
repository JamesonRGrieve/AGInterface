'use client';

import log from '@/components/jrg/next-log/log';
import React, { useEffect, useRef } from 'react';
import { Activity as ChatActivity } from './Activity';
import Message from './Message/Message';

export default function ChatLog({
  conversation,
  alternateBackground,
  loading,
  setLoading,
}: {
  conversation: { role: string; message: string; timestamp: string; children: any[] }[];
  setLoading: (loading: boolean) => void;
  loading: boolean;
  alternateBackground?: string;
}): React.JSX.Element {
  let lastUserMessage = ''; // track the last user message
  const messagesEndRef = useRef(null);

  useEffect(() => {
    log(['Conversation mutated, scrolling to bottom.', conversation], { client: 3 });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  console.log('CONVERSATION VALID', conversation.length > 0 && conversation.map, conversation);

  return (
    <div className='flex flex-col-reverse flex-grow overflow-y-auto bg-background pb-28' style={{ flexBasis: '0px' }}>
      <div className='flex flex-col h-min max-w-100vw'>
        {conversation.length > 0 && conversation.map ? (
          conversation.map((chatItem, index: number) => {
            if (chatItem.role === 'USER') {
              lastUserMessage = chatItem.message;
            }
            const validTypes = [
              '[ACTIVITY]',
              '[ACTIVITY][ERROR]',
              '[ACTIVITY][WARN]',
              '[ACTIVITY][INFO]',
              '[SUBACTIVITY]',
              '[SUBACTIVITY][THOUGHT]',
              '[SUBACTIVITY][REFLECTION]',
              '[SUBACTIVITY][EXECUTION]',
              '[SUBACTIVITY][ERROR]',
              '[SUBACTIVITY][WARN]',
              '[SUBACTIVITY][INFO]',
            ];
            const messageType = chatItem.message.split(' ')[0];
            const messageBody = validTypes.some((x) => messageType.includes(x))
              ? chatItem.message.substring(chatItem.message.indexOf(' '))
              : chatItem.message;
            // To-Do Fix this so the timestamp works. It's not granular enough rn and we get duplicates.
            return validTypes.includes(messageType) ? (
              <ChatActivity
                key={chatItem.timestamp + '-' + messageBody}
                activityType={
                  messageType === '[ACTIVITY]'
                    ? 'success'
                    : (messageType.split('[')[2].split(']')[0].toLowerCase() as
                        | 'error'
                        | 'info'
                        | 'success'
                        | 'warn'
                        | 'thought'
                        | 'reflection'
                        | 'execution'
                        | 'diagram')
                }
                nextTimestamp={conversation[index + 1]?.timestamp}
                message={messageBody}
                timestamp={chatItem.timestamp}
                alternateBackground={alternateBackground}
                children={chatItem.children}
              />
            ) : (
              <Message
                key={chatItem.timestamp + '-' + messageBody}
                chatItem={chatItem}
                lastUserMessage={lastUserMessage}
                setLoading={setLoading}
              />
            );
          })
        ) : (
          <div className='max-w-4xl px-2 mx-auto space-y-2 text-center'>
            <div>
              <h1 className='text-4xl md:text-6xl'>
                Welcome {process.env.NEXT_PUBLIC_APP_NAME && `to ${process.env.NEXT_PUBLIC_APP_NAME}`}
              </h1>
              {process.env.NEXT_PUBLIC_APP_DESCRIPTION && (
                <p className='text-sm'>{process.env.NEXT_PUBLIC_APP_DESCRIPTION}</p>
              )}
            </div>
            <p className='text-xs text-muted-foreground'>
              {process.env.NEXT_PUBLIC_APP_NAME || 'This software'} may provide inaccurate or inappropriate responses, may
              break character and comes with no warranty of any kind. By using this software you agree to hold harmless the
              developers of {process.env.NEXT_PUBLIC_APP_NAME || 'this software'} for any damages caused by the use of this
              software.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
