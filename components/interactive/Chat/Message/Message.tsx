'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipBasic, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/useToast';
import { formatTimeAgo } from '@/lib/time-ago';
import { cn } from '@/lib/utils';
import clipboardCopy from 'clipboard-copy';
import { getCookie } from 'cookies-next';
import { Loader2 } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import {
  LuCopy,
  LuDownload,
  LuPen as LuEdit,
  LuGitFork,
  LuThumbsDown,
  LuThumbsUp,
  LuTrash2,
  LuVolume2,
} from 'react-icons/lu';
import { mutate } from 'swr';
import AudioPlayer from './Audio';
import JRGDialog from './Dialog';
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

  const [vote, setVote] = useState(chatItem.rlhf ? (chatItem.rlhf.positive ? 1 : -1) : 0);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const isUserMsgJustText = checkUserMsgJustText(chatItem);

  const handleTTS = async () => {
    if (!state.overrides.conversation) return;

    setIsLoadingAudio(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URI}/v1/conversation/${state.overrides.conversation}/tts/${chatItem.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `${getCookie('jwt')}`,
          },
        },
      );
      if (!response.ok) throw new Error('Failed to fetch audio');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Play audio automatically when loaded
      if (audioRef.current) {
        audioRef.current.play();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate speech',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAudio(false);
    }
  };

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

        <div className={cn('flex gap-2', chatItem.role === 'USER' && 'justify-end items-center')}>
          {(audios?.message?.trim() || !audios) && (
            <>
              {chatItem.role !== 'USER' && process.env.NEXT_PUBLIC_AGINTERACTIVE_RLHF === 'true' && (
                <>
                  <TooltipBasic title='Provide Positive Feedback'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        setVote(1);
                        setOpen(true);
                      }}
                    >
                      <LuThumbsUp className={cn(vote === 1 && 'text-green-500')} />
                    </Button>
                  </TooltipBasic>
                  <TooltipBasic title='Provide Negative Feedback'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        setVote(-1);
                        setOpen(true);
                      }}
                    >
                      <LuThumbsDown className={cn(vote === -1 && 'text-red-500')} />
                    </Button>
                  </TooltipBasic>
                </>
              )}

              {chatItem.role !== 'USER' && !audios && (
                <>
                  {audioUrl ? (
                    <audio ref={audioRef} controls className='h-8 w-32'>
                      <source src={audioUrl} type='audio/wav' />
                    </audio>
                  ) : (
                    <TooltipBasic title='Speak Message'>
                      <Button variant='ghost' size='icon' onClick={handleTTS} disabled={isLoadingAudio}>
                        {isLoadingAudio ? <Loader2 className='h-4 w-4 animate-spin' /> : <LuVolume2 />}
                      </Button>
                    </TooltipBasic>
                  )}
                </>
              )}
              <TooltipBasic title='Fork Conversation'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={async () => {
                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/conversation/fork`, {
                        method: 'POST',
                        headers: {
                          Authorization: getCookie('jwt'),
                        },
                        body: JSON.stringify({
                          conversation_name: state.overrides?.conversation,
                          message_id: chatItem.id,
                        }),
                      });

                      if (!response.ok) throw new Error('Failed to fork conversation');

                      const data = await response.json();
                      toast({
                        title: 'Conversation Forked',
                        description: `New conversation created: ${data.message}`,
                      });
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: 'Failed to fork conversation',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <LuGitFork />
                </Button>
              </TooltipBasic>
              <TooltipBasic title='Copy Message'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    clipboardCopy(formattedMessage);
                    toast({
                      title: 'Message Copied',
                      description: 'Message has been copied to your clipboard.',
                    });
                  }}
                >
                  <LuCopy />
                </Button>
              </TooltipBasic>

              <TooltipBasic title='Download Message'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    const element = document.createElement('a');
                    const file = new Blob([formattedMessage], {
                      type: 'text/plain;charset=utf-8',
                    });
                    element.href = URL.createObjectURL(file);
                    element.download = `${chatItem.role}-${chatItem.timestamp}.md`;
                    document.body.appendChild(element);
                    element.click();
                  }}
                >
                  <LuDownload />
                </Button>
              </TooltipBasic>
              {enableMessageEditing && (
                <TooltipProvider>
                  <Tooltip>
                    <JRGDialog
                      ButtonComponent={Button}
                      ButtonProps={{
                        variant: 'ghost',
                        size: 'icon',
                        children: (
                          <TooltipBasic title='Edit Message'>
                            <LuEdit />
                          </TooltipBasic>
                        ),
                      }}
                      title='Edit Message'
                      onConfirm={async () => {
                        await state.sdk.updateConversationMessage(
                          state.overrides.conversation,
                          chatItem.message,
                          updatedMessage,
                        );
                        mutate('/conversation/' + state.overrides.conversation);
                      }}
                      content={
                        <Textarea
                          value={updatedMessage}
                          onChange={(event) => {
                            setUpdatedMessage(event.target.value);
                          }}
                        />
                      }
                      className='w-[70%] max-w-none'
                    />
                    <TooltipContent>Edit Message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {enableMessageDeletion && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <JRGDialog
                        ButtonComponent={Button}
                        ButtonProps={{ variant: 'ghost', size: 'icon', children: <LuTrash2 /> }}
                        title='Delete Message'
                        onConfirm={async () => {
                          await state.sdk.deleteConversationMessage(state.overrides.conversation, chatItem.message);
                          mutate('/conversation/' + state.overrides.conversation);
                        }}
                        content={`Are you sure you'd like to permanently delete this message from the conversation?`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Delete Message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {chatItem.rlhf && (
                <p className={cn('text-sm', chatItem.rlhf.positive ? 'text-green-500' : 'text-red-500')}>
                  {chatItem.rlhf.feedback}
                </p>
              )}

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Provide Feedback</DialogTitle>
                    <DialogDescription>Please provide some feedback regarding the message.</DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder='Your feedback here...'
                  />
                  <DialogFooter>
                    <Button variant='outline' onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setOpen(false);
                        if (vote === 1) {
                          state.sdk.addConversationFeedback(
                            true,
                            chatItem.role,
                            chatItem.message,
                            lastUserMessage,
                            feedback,
                            state.overrides.conversation,
                          );
                        } else {
                          state.sdk.addConversationFeedback(
                            false,
                            chatItem.role,
                            chatItem.message,
                            lastUserMessage,
                            feedback,
                            state.overrides.conversation,
                          );
                        }
                      }}
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
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
