'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipBasic, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import clipboardCopy from 'clipboard-copy';
import { getCookie } from 'cookies-next';
import { Loader2, Plus, Volume2, X } from 'lucide-react';
import { useContext, useRef, useState } from 'react';
import { LuCopy, LuDownload, LuPen as LuEdit, LuGitFork, LuThumbsDown, LuThumbsUp, LuTrash2 } from 'react-icons/lu';
import { mutate } from 'swr';
import { InteractiveConfigContext } from '../../InteractiveConfigContext';
import { useConversations } from '../../hooks/useConversation';
import JRGDialog from './Dialog';
import { ChatItem } from './Message';

export type MessageProps = {
  chatItem: { role: string; message: string; timestamp: string; rlhf?: { positive: boolean; feedback: string } };
  lastUserMessage: string;
  alternateBackground?: string;
  setLoading: (loading: boolean) => void;
};

export function MessageActions({
  chatItem,
  audios,
  formattedMessage,
  lastUserMessage,
  updatedMessage,
  setUpdatedMessage,
}: {
  chatItem: ChatItem;
  audios: { message: string; sources: string[] } | null;
  formattedMessage: string;
  lastUserMessage: string;
  updatedMessage: string;
  setUpdatedMessage: (value: string) => void;
}) {
  const [feedbackPoints, setFeedbackPoints] = useState([]);
  const state = useContext(InteractiveConfigContext);
  const { data: convData } = useConversations();
  const { toast } = useToast();
  const [vote, setVote] = useState(chatItem.rlhf ? (chatItem.rlhf.positive ? 1 : -1) : 0);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const enableMessageEditing = process.env.NEXT_PUBLIC_AGINTERACTIVE_ALLOW_MESSAGE_EDITING === 'true';
  const enableMessageDeletion = process.env.NEXT_PUBLIC_AGINTERACTIVE_ALLOW_MESSAGE_DELETION === 'true';
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTTS = async () => {
    if (!state.overrides.conversation) return;

    setIsLoadingAudio(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AGINFRASTRUCTURE_SERVER}/v1/conversation/${state.overrides.conversation}/tts/${chatItem.id}`,
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
    <div className={cn('flex', chatItem.role === 'USER' && 'justify-end items-center')}>
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
                    {isLoadingAudio ? <Loader2 className='h-4 w-4 animate-spin' /> : <Volume2 className='h-4 w-4' />}
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
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_AGINFRASTRUCTURE_SERVER}/v1/conversation/fork/${state.overrides?.conversation}/${chatItem.id}`,
                    {
                      method: 'POST',
                      headers: {
                        Authorization: getCookie('jwt'),
                      },
                    },
                  );

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
                {/* TODO: Replace this with new dialog */}
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
                      convData?.find((item) => item.id === state.overrides.conversation).name,
                      chatItem.id,
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
                  {/* TODO: Replace this with new dialog */}
                  <JRGDialog
                    ButtonComponent={Button}
                    ButtonProps={{ variant: 'ghost', size: 'icon', children: <LuTrash2 /> }}
                    title='Delete Message'
                    onConfirm={async () => {
                      await state.sdk.deleteConversationMessage(
                        convData?.find((item) => item.id === state.overrides.conversation).name,
                        chatItem.id,
                      );
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
              <div className='flex items-center space-x-2'>
                <p className='text-sm text-muted-foreground'>Specific Feedback</p>
                <Button
                  onClick={() => {
                    setFeedbackPoints((old) => [...old, '']);
                  }}
                  size='icon'
                  variant='ghost'
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
              {feedbackPoints && (
                <ul className='flex flex-col gap-2'>
                  {feedbackPoints.map((point, index) => (
                    <li key={index} className='flex items-center space-x-2'>
                      <Input
                        value={point}
                        onChange={(e) => {
                          const newFeedbackPoints = [...feedbackPoints];
                          newFeedbackPoints[index] = e.target.value;
                          setFeedbackPoints(newFeedbackPoints);
                        }}
                        placeholder='Feedback Point'
                      />
                      <Button
                        onClick={() => {
                          const newFeedbackPoints = [...feedbackPoints];
                          newFeedbackPoints.splice(index, 1);
                          setFeedbackPoints(newFeedbackPoints);
                        }}
                        size='icon'
                        variant='ghost'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <p className='text-sm text-muted-foreground'>General Feedback</p>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder='Your feedback here...' />
              <DialogFooter>
                <Button variant='outline' onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setOpen(false);
                    const refinedFeedback = `General Feedback: ${feedback}\n\nSpecific Feedback: ${feedbackPoints.join('\n')}`;
                    if (vote === 1) {
                      state.sdk.addConversationFeedback(
                        true,
                        chatItem.role,
                        chatItem.id,
                        lastUserMessage,
                        refinedFeedback,
                        state.overrides.conversation,
                      );
                    } else {
                      state.sdk.addConversationFeedback(
                        false,
                        chatItem.role,
                        chatItem.id,
                        lastUserMessage,
                        refinedFeedback,
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
  );
}
