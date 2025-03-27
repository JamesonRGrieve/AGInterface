'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProviders } from '../../hooks/useProvider';

export function AgentDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const router = useRouter();
  const context = useInteractiveConfig();
  const { data: providersData, isLoading } = useProviders();

  const [newAgentName, setNewAgentName] = useState('');
  const [provider, setProvider] = useState('local');

  const handleNewAgent = async () => {
    await context.sdk.addAgent(newAgentName, { provider: provider });
    setOpen(false);
    router.push(`/agent?agent=${newAgentName}`);
  };

  const handleAgentImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      const fileContent = await file.text();
      if (newAgentName === '') {
        const fileName = file.name.replace('.json', '');
        setNewAgentName(fileName);
      }
      const settings = JSON.parse(fileContent);
      await context.sdk.addAgent(newAgentName, settings);
      router.push(`/agent?agent=${newAgentName}`);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='agent-name' className='text-right'>
              New Agent Name
            </Label>
            <Input
              id='agent-name'
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='provider' className='text-right'>
              Select a Provider
            </Label>
            <Select disabled={isLoading} value={provider} onValueChange={setProvider}>
              <SelectTrigger id='provider' className='col-span-3'>
                <SelectValue placeholder='Select a provider' />
              </SelectTrigger>
              <SelectContent>
                {providersData &&
                  providersData.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='import-agent' className='text-right'>
              Import an Agent
            </Label>
            <Input id='import-agent' type='file' onChange={handleAgentImport} className='col-span-3' />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleNewAgent}>Create Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
