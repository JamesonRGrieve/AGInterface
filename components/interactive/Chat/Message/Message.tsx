'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/useToast';
import { formatTimeAgo } from '@/lib/time-ago';
import { cn } from '@/lib/utils';
import React, { useMemo, useRef, useState } from 'react';
import { MessageActions } from './Actions';
import AudioPlayer from './Audio';
import MarkdownBlock from './MarkdownBlock';
import formatDate from './formatDate';

export type ChatItem = {
  id: string;
  role: string;
  message: string;
  timestamp: string;
  rlhf?: {
    positive: boolean;
    feedback: string;
  };
};
export type MessageProps = {
  lastUserMessage: string;
  alternateBackground?: string;
  setLoading: (loading: boolean) => void;
};

const checkUserMsgJustText = (chatItem: { role: string; message: string }) => {
  if (chatItem.role !== 'USER') return false;

  const message = chatItem.message;
  const hasMarkdownTable = /\n\|.*\|\n(\|-+\|.*\n)?/.test(message);
  return !(
    message.includes('```') ||
    message.includes('`') ||
    message.includes('![') ||
    (message.includes('[') && message.includes('](')) ||
    hasMarkdownTable
  );
};

export default function Message({ chatItem, lastUserMessage, setLoading }: MessageProps): React.JSX.Element {
  const [updatedMessage, setUpdatedMessage] = useState(chatItem.message);
  const { toast } = useToast();
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formattedMessage = useMemo(() => {
    let formatted = chatItem.message;
    try {
      const parsed = JSON.parse(chatItem.message);
      formatted = (parsed.text || chatItem.message).replace('\\n', '\n');
    } catch (e) {
      // If parsing fails, use original message
    }
    return formatted;
  }, [chatItem]);

  const audios = useMemo(() => {
    if (
      !chatItem?.message ||
      typeof chatItem.message !== 'string' ||
      !chatItem.message.includes('<audio controls><source src=')
    ) {
      return null;
    }

    const matches = [...chatItem.message.matchAll(/<audio controls><source src="([^"]+)" type="audio\/wav"><\/audio>/g)];
    const audioSources = matches.map((match) => match[1]);
    return {
      message: chatItem.message.replaceAll(/<audio controls><source src="[^"]+" type="audio\/wav"><\/audio>/g, ''),
      sources: audioSources,
    };
  }, [chatItem]);
  const isUserMsgJustText = checkUserMsgJustText(chatItem);

  return (
    <div className={cn('m-3 overflow-hidden flex flex-col gap-2 min-w-48', isUserMsgJustText && 'max-w-[60%] self-end')}>
      {audios && audios.sources.length > 0 ? (
        <>
          {audios.message?.trim() && (
            <MarkdownBlock
              content={audios.message}
              chatItem={{ ...chatItem, message: audios.message }}
              setLoading={setLoading}
            />
          )}
          {audios.sources.map((src) => (
            <AudioPlayer key={src} src={src} />
          ))}
        </>
      ) : (
        <div
          className={
            chatItem.role === 'USER'
              ? 'chat-log-message-user bg-primary rounded-3xl py-1 rounded-br-none px-5 text-primary-foreground'
              : 'chat-log-message-ai p-0 pt-2 text-foreground'
          }
        >
          <MarkdownBlock content={formattedMessage} chatItem={chatItem} setLoading={setLoading} />
        </div>
      )}

      <div className={cn('flex items-center flex-wrap', chatItem.role === 'USER' && 'flex-row-reverse')}>
        <TimeStamp chatItem={chatItem} />

        <MessageActions
          chatItem={chatItem}
          audios={audios}
          formattedMessage={formattedMessage}
          lastUserMessage={lastUserMessage}
          updatedMessage={updatedMessage}
          setUpdatedMessage={setUpdatedMessage}
        />
      </div>
    </div>
  );
}

export function TimeStamp({ chatItem }: { chatItem: { role: string; timestamp: string } }) {
  const [open, setOpen] = useState(false);

  if (chatItem.timestamp === '') return null;
  const roleLabel = chatItem.role === 'USER' ? 'You' : chatItem.role;
  const timeAgo = formatTimeAgo(chatItem.timestamp);
  const date = formatDate(chatItem.timestamp, false);

  return (
    <p className='flex gap-1 text-sm text-muted-foreground whitespace-nowrap'>
      <span className='inline font-bold text-muted-foreground'>{roleLabel}</span>•
      <TooltipProvider>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <button
              type='button'
              onClick={() => setOpen(true)}
              className='text-left cursor-pointer'
              aria-label='Show full timestamp'
            >
              {timeAgo}
            </button>
          </TooltipTrigger>
          <TooltipContent>{date}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </p>
  );
}
