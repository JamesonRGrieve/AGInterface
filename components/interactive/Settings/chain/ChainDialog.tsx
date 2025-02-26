'use client';

import { useInteractiveConfig } from '@/components/interactive/InteractiveConfigContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ChainDialog({ open, setOpen }) {
  const router = useRouter();
  const context = useInteractiveConfig();
  const [newChainName, setNewChainName] = useState('');

  const handleNewChain = async () => {
    await context.sdk.addChain(newChainName);
    router.push(`/settings/chains?chain=${newChainName}`);
    setOpen(false);
  };

  const handleChainImport = async (event) => {
    const files = Array.from(event.target.files);
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
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleNewChain}>Create Chain</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
