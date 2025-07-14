'use client';

import { ArrowBigLeft, Check, Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChainSelector } from '../../Selectors/ChainSelector';
import { useChain } from '../../hooks/useChain';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LuDownload } from 'react-icons/lu';
import { Label } from '@/components/ui/label';

export default function ChainPanel() {
  return (
    <div>
      <SidebarGroup>
        <SidebarGroupLabel>Select Chain</SidebarGroupLabel>
        <SidebarMenuButton className='group-data-[state=expanded]:hidden'>
          <ArrowBigLeft />
        </SidebarMenuButton>
        <div className='w-full group-data-[collapsible=icon]:hidden'>
          <ChainSelector />
        </div>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Chain Functions</SidebarGroupLabel>
        <SidebarMenu>
          <ChainCreate />
          <ChainRename />
          <ChainExport />
          <ChainDelete />
        </SidebarMenu>
      </SidebarGroup>
    </div>
  );
}

export function ChainCreate() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const context = useInteractiveConfig();
  const router = useRouter();
  const [newChainName, setNewChainName] = useState('');

  const handleNewChain = async () => {
    await context.sdk.addChain(newChainName);
    router.push(`/settings/chains?chain=${newChainName}`);
    setShowCreateDialog(false);
  };

  const handleChainImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    for (const file of files) {
      const fileContent = await file.text();
      if (newChainName === '') {
        const filename = file.name.replace('.json', '');
        setNewChainName(filename);
      }
      const steps = JSON.parse(fileContent);
      await context.sdk.addChain(newChainName);
      await context.sdk.importChain(newChainName, steps);
      router.push(`/chains?chain=${newChainName}`);
    }
    setShowCreateDialog(false);
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton side='left' tooltip='Create Chain' onClick={() => setShowCreateDialog(true)}>
          <Plus />
          <span>Create Chain</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chain</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='chain-name' className='text-right'>
                Chain Name
              </Label>
              <Input
                id='chain-name'
                value={newChainName}
                onChange={(e) => setNewChainName(e.target.value)}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='import-chain' className='text-right'>
                Import Chain
              </Label>
              <Input id='import-chain' type='file' onChange={handleChainImport} className='col-span-3' />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewChain}>Create Chain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ChainRename() {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const context = useInteractiveConfig();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: chainData } = useChain(searchParams.get('chain') ?? undefined);

  useEffect(() => {
    if (renaming) {
      setNewName(searchParams.get('chain') ?? '');
    }
  }, [renaming]);

  const handleRename = async () => {
    if ((newName && newName !== searchParams.get('chain')) ?? '') {
      await context.sdk.renameChain(searchParams.get('chain') ?? '', newName);
      setRenaming(false);
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('chain', newName);
      router.push(`${pathname}?${current.toString()}`);
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          side='left'
          tooltip='Rename Chain'
          onClick={() => setIsRenameDialogOpen(true)}
          disabled={!chainData}
        >
          <Pencil className='size-4' />
          <span>Rename Chain</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chain</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='Enter new name' />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ChainExport() {
  const context = useInteractiveConfig();
  const searchParams = useSearchParams();

  const { data: chainData } = useChain(searchParams.get('chain') ?? undefined);

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
    <SidebarMenuItem>
      <SidebarMenuButton side='left' tooltip='Export Chain' onClick={handleExportChain} disabled={!chainData}>
        <LuDownload className='size-4' />
        <span>Export Chain</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function ChainDelete() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const context = useInteractiveConfig();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: chainData } = useChain(searchParams.get('chain') ?? undefined);

  const handleDelete = async () => {
    await context.sdk.deleteChain(searchParams.get('chain') ?? '');
    router.push(pathname);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          side='left'
          tooltip='Delete Chain'
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={!chainData}
        >
          <Trash2 />
          <span>Delete Chain</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chain</DialogTitle>
          </DialogHeader>
          <DialogDescription>Are you sure you want to delete this chain? This action cannot be undone.</DialogDescription>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
