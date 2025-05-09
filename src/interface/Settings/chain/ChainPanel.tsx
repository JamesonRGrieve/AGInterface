'use client';

import { ArrowBigLeft, Check, Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChainSelector } from '../../Selectors/ChainSelector';
import { useChain } from '../../hooks/useChain';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';

export default function ChainPanel({
  showCreateDialog,
  setShowCreateDialog,
}: {
  showCreateDialog: boolean;
  setShowCreateDialog: (show: boolean) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const context = useInteractiveConfig();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: chainData, error } = useChain(searchParams.get('chain') ?? undefined);

  useEffect(() => {
    if (renaming) {
      setNewName(searchParams.get('chain') ?? '');
    }
  }, [renaming]);

  const handleDelete = async () => {
    await context.sdk.deleteChain(searchParams.get('chain') ?? '');
    router.push(pathname);
  };

  const handleRename = async () => {
    if ((newName && newName !== searchParams.get('chain')) ?? '') {
      await context.sdk.renameChain(searchParams.get('chain') ?? '', newName);
      setRenaming(false);
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('chain', newName);
      router.push(`${pathname}?${current.toString()}`);
    }
  };

  const handleExportChain = async () => {
    const chainData = await context.sdk.getChain(searchParams.get('chain') ?? '');
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(chainData.steps)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${searchParams.get('chain') ?? ''}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className='space-y-4'>
      <SidebarGroup>
        <SidebarGroupLabel>Select Chain</SidebarGroupLabel>
        <SidebarMenuButton className='group-data-[state=expanded]:hidden'>
          <ArrowBigLeft />
        </SidebarMenuButton>
        <div className='w-full group-data-[collapsible=icon]:hidden'>
          {renaming ? (
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className='w-full' />
          ) : (
            <ChainSelector />
          )}
        </div>
        <SidebarGroupLabel>Chain Functions</SidebarGroupLabel>
        <SidebarMenu>
          {[
            {
              title: 'Create Chain',
              icon: Plus,
              func: () => setShowCreateDialog(true),
              disabled: renaming || showCreateDialog,
            },
            {
              title: renaming ? 'Save Name' : 'Rename Chain',
              icon: renaming ? Check : Pencil,
              func: renaming ? handleRename : () => setRenaming(true),
              disabled: !chainData || (renaming && (!newName || newName === searchParams.get('chain'))),
            },
            {
              title: 'Export Chain',
              icon: Download,
              func: handleExportChain,
              disabled: !chainData || renaming,
            },
            {
              title: 'Delete Chain',
              icon: Trash2,
              func: handleDelete,
              disabled: !chainData || renaming,
            },
          ].map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton side='left' tooltip={item.title} onClick={item.func} disabled={item.disabled}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  );
}
