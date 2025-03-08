'use client';

import { SidebarContent } from '@/appwrapper/SidebarContentManager';
import IconButton from '@/components/jrg/theme/IconButton';
import { Input } from '@/components/ui/input';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ArrowBigLeft, Check, Download, Pencil, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePrompt } from '../../../../interface/hooks/usePrompt';
import PromptSelector from '../../../../interface/Selectors/PromptSelector';
import { AutoResizeTextarea } from '../training';
import NewPromptDialog from './PromptDialog';
import PromptTest from './PromptTest';

export default function PromptPanel() {
  const searchParams = useSearchParams();
  const prompt = usePrompt(searchParams.get('prompt') ?? '');
  const [promptBody, setPromptBody] = useState(prompt.data?.content || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [importMode, setImportMode] = useState(false);
  console.log(prompt);
  useEffect(() => {
    if (prompt.data?.content) {
      setPromptBody(prompt.data.content);
      setHasChanges(false);
    }
  }, [prompt.data?.content]);

  useEffect(() => {
    if (renaming) {
      setNewName(searchParams.get('prompt') ?? '');
    }
  }, [renaming, searchParams.get('prompt')]);

  return (
    <div className='space-y-4'>
      <SidebarContent title='Prompt Management'>
        <SidebarGroup>
          <SidebarGroupLabel>Select Prompt</SidebarGroupLabel>
          <SidebarMenuButton className='group-data-[state=expanded]:hidden'>
            <ArrowBigLeft />
          </SidebarMenuButton>
          <div className='w-full group-data-[collapsible=icon]:hidden'>
            {renaming ? (
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} className='w-full' />
            ) : (
              <PromptSelector />
            )}
          </div>
          <SidebarGroupLabel>Prompt Functions</SidebarGroupLabel>
          <SidebarMenu>
            {[
              {
                title: 'Create Prompt',
                icon: Plus,
                func: () => {
                  setImportMode(false);
                  setIsDialogOpen(true);
                },
                disabled: renaming,
              },
              {
                title: renaming ? 'Save Name' : 'Rename Prompt',
                icon: renaming ? Check : Pencil,
                func: renaming
                  ? () => {
                      prompt.rename(newName);
                      setRenaming(false);
                    }
                  : () => setRenaming(true),
                disabled: false,
              },
              {
                title: 'Import Prompt',
                icon: Upload,
                func: () => {
                  setImportMode(true);
                  setIsDialogOpen(true);
                },
                disabled: renaming,
              },
              {
                title: 'Export Prompt',
                icon: Download,
                func: () => {
                  prompt.export();
                },
                disabled: renaming,
              },
              {
                title: 'Delete Prompt',
                icon: Trash2,
                func: () => {
                  prompt.delete();
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

      {promptBody && (
        <>
          <div className='space-y-2'>
            <AutoResizeTextarea
              value={promptBody}
              onChange={(e) => {
                setPromptBody(e.target.value);
                setHasChanges(e.target.value !== prompt.data?.content);
              }}
              placeholder=''
            />
          </div>
          <div className='flex space-x-2'>
            <IconButton
              Icon={Save}
              label='Save'
              description={hasChanges ? 'Save changes to prompt.' : 'No changes to save.'}
              onClick={() => {
                prompt.update(promptBody);
                setHasChanges(false);
              }}
              disabled={!hasChanges || renaming}
            />
          </div>
          <PromptTest promptName={prompt.data?.name} promptContent={promptBody} saved={!hasChanges} />
        </>
      )}

      <NewPromptDialog open={isDialogOpen} setOpen={setIsDialogOpen} importMode={importMode} />
    </div>
  );
}
