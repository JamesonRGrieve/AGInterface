'use client';

import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LuCopy, LuDownload, LuPencil, LuPlus, LuTrash2, LuUpload } from 'react-icons/lu';
import { useAgent, useAgents } from '../../hooks/useAgent';
import { useTeam } from '@/auth/hooks/useTeam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import { useToast } from '@/hooks/useToast';
import { Label } from '@/components/ui/label';

export function AgentFunctions() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Agent Functions</SidebarGroupLabel>
      <SidebarMenu>
        <AgentCreate />
        <AgentRename />
        <AgentClone />
        <AgentImport />
        <AgentExport />
        <AgentDelete />
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AgentRename() {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const { data: agentData, mutate: mutateAgent } = useAgent();
  const { data: agents } = useAgents();
  const context = useInteractiveConfig();
  const { toast } = useToast();

  const handleConfirmRename = async () => {
    try {
      await context.sdk.renameAgent(agentData.agent.name, newName);
      setCookie('aginterface-agent', newName, {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      });
      mutateAgent();
      setIsRenameDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Agent renamed successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to rename agent',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            setNewName(agentData?.agent?.name || agentData?.name || '');
            setIsRenameDialogOpen(true);
          }}
          tooltip='Rename Agent'
          disabled={!agents || agents.length === 0}
        >
          <LuPencil className='w-4 h-4' />
          <span>Rename Agent</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Agent</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='Enter new name' />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AgentCreate() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const { mutate: mutateAgent } = useAgent();
  const { data: companyData, mutate: mutateCompany } = useTeam();
  const { toast } = useToast();

  const handleConfirmCreate = async () => {
    try {
      const newResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URI}/api/agent`,
        { agent_name: newName, settings: { company_id: companyData.id } },
        {
          headers: {
            Authorization: getCookie('jwt'),
            'Content-Type': 'application/json',
          },
        },
      );
      setCookie('aginterface-agent', newName, {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      });
      mutateCompany();
      mutateAgent();
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Agent created successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create agent',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            setNewName('');
            setIsCreateDialogOpen(true);
          }}
          tooltip='Create Agent'
        >
          <LuPlus className='w-4 h-4' />
          <span>Create Agent</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='Enter agent name' />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AgentDelete() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: agentData, mutate: mutateAgent } = useAgent();
  const { data: agents } = useAgents();
  const { mutate: mutateCompany } = useTeam();
  const context = useInteractiveConfig();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await context.sdk.deleteAgent(agentData.agent.name);
      mutateCompany();
      mutateAgent();
      router.push(pathname);
      toast({
        title: 'Success',
        description: 'Agent deleted successfully!',
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as any).response?.data?.detail || 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setIsDeleteDialogOpen(true)}
          tooltip='Delete Agent'
          disabled={!agents || agents.length === 0}
        >
          <LuTrash2 className='w-4 h-4' />
          <span>Delete Agent</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
          </DialogHeader>
          <DialogDescription>Are you sure you want to delete this agent? This action cannot be undone.</DialogDescription>
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

export function AgentExport() {
  const { data: agentData } = useAgent();
  const { data: agents } = useAgents();
  const context = useInteractiveConfig();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const agentConfig = await context.sdk.getAgentConfig(agentData.agent.name);
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(agentConfig)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `${agentData.agent.name}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast({
        title: 'Success',
        description: 'Agent configuration exported successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to export agent configuration',
        variant: 'destructive',
      });
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={handleExport} tooltip='Export Agent' disabled={!agents || agents.length === 0}>
        <LuDownload className='w-4 h-4' />
        <span>Export Agent</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AgentImport() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const context = useInteractiveConfig();
  const router = useRouter();
  const { toast } = useToast();

  const handleAgentImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    try {
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
      toast({
        title: 'Success',
        description: 'Agent imported successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as any).response?.data?.detail || 'Failed to import agent',
        variant: 'destructive',
      });
    }
    setIsImportDialogOpen(false);
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setIsImportDialogOpen(true)} tooltip='Import Agent'>
          <LuUpload className='w-4 h-4' />
          <span>Import Agent</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Agent Configuration</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4 py-4'>
            <Label htmlFor='import-agent' className='sr-only'>
              Import Agent File
            </Label>
            <Input id='import-agent' type='file' onChange={handleAgentImport} className='col-span-3' />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AgentClone() {
  // TODO: Implement Agent Clone
  const handleClone = async () => {};

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={handleClone} tooltip='Clone Agent' disabled={true}>
        <LuCopy className='w-4 h-4' />
        <span>Clone Agent</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
