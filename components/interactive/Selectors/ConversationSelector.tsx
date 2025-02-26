'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { setCookie } from 'cookies-next';
import React, { useContext, useEffect, useState } from 'react';
import { LuChevronDown, LuChevronUp, LuDownload, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import { mutate } from 'swr';
import { InteractiveConfigContext } from '../InteractiveConfigContext';
import { useConversations } from '../hooks/useConversation';

export default function ConversationSelector(): React.JSX.Element {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const state = useContext(InteractiveConfigContext);
  const { data: conversationData } = useConversations();
  // const { data: currentConversation } = useConversation();
  const [openRenameConversation, setOpenRenameConversation] = useState(false);
  const [changedConversation, setChangedConversation] = useState('-');
  const [openDeleteConversation, setOpenDeleteConversation] = useState(false);

  useEffect(() => {
    setChangedConversation(state.overrides.conversation);
    setCookie('aginteractive-conversation', state.overrides.conversation, {
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    });
  }, [state.overrides.conversation]);

  const handleAddConversation = async (): Promise<void> => {
    state.mutate((oldState) => ({
      ...oldState,
      overrides: { ...oldState.overrides, conversation: '-' },
    }));
  };

  const handleRenameConversation = async (magic = true): Promise<void> => {
    if (state.overrides.conversation) {
      const response = await state.sdk.renameConversation(
        state.agent,
        state.overrides.conversation,
        magic ? '-' : changedConversation,
      );
      await mutate('/conversation');
      if (!response.startsWith('Error')) {
        setOpenRenameConversation(false);
      }
    }
  };

  const handleDeleteConversation = async (): Promise<void> => {
    if (state.overrides.conversation) {
      await state.sdk.deleteConversation(state.overrides.conversation);
      await mutate('/conversation');
      state.mutate((oldState) => ({
        ...oldState,
        overrides: {
          ...oldState.overrides,
          conversation: '-',
        },
      }));
      setOpenDeleteConversation(false);
    }
  };

  const handleExportConversation = async (): Promise<void> => {
    if (state.overrides.conversation) {
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(currentConversation)], {
        type: 'application/json',
      });
      element.href = URL.createObjectURL(file);
      element.download = `${state.overrides.conversation}.json`;
      document.body.appendChild(element);
      element.click();
    }
  };

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className='flex items-center grow w-full'>
      <div className='relative w-full'>
        <Select
          open={dropDownOpen}
          onOpenChange={setDropDownOpen}
          disabled={conversationData?.length === 0}
          value={changedConversation}
          onValueChange={(value) =>
            state.mutate((oldState) => ({
              ...oldState,
              overrides: { ...oldState.overrides, conversation: value },
            }))
          }
        >
          <SelectTrigger className=''>
            <SelectValue placeholder='Select a Conversation' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='-'>- New Conversation -</SelectItem>
            {conversationData &&
              conversationData.map((conversation) => (
                <SelectItem key={conversation.id} value={conversation.id}>
                  {conversation.has_notifications ? '(-) ' : ''}
                  {conversation.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className='absolute top-0 bottom-0 right-0 flex items-center h-full pr-2 space-x-1'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='w-6 h-6' onClick={handleAddConversation}>
                  <LuPlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='w-6 h-6' onClick={() => setOpenRenameConversation(true)}>
                  <LuPencil />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rename Conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='w-6 h-6' onClick={handleExportConversation}>
                  <LuDownload />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='w-6 h-6' onClick={() => setOpenDeleteConversation(true)}>
                  <LuTrash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='w-6 h-6' onClick={() => setDropDownOpen((prev) => !prev)}>
                  {dropDownOpen ? <LuChevronUp /> : <LuChevronDown />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open Dropdown</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Dialog open={openDeleteConversation} onOpenChange={setOpenDeleteConversation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>Are you sure you want to delete this conversation?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpenDeleteConversation(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConversation}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openRenameConversation} onOpenChange={setOpenRenameConversation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
          </DialogHeader>
          <Input
            id='name'
            value={changedConversation}
            onChange={(e) => setChangedConversation(e.target.value)}
            placeholder='New Conversation Name'
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpenRenameConversation(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleRenameConversation(false)}>Rename</Button>
            <Button onClick={() => handleRenameConversation(true)}>Generate a Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
