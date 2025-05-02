'use client';

import { useTeam } from '@/auth/hooks/useTeam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LuCheck, LuDownload, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import { useAgent } from '../../hooks/useAgent';
import { useToast } from '@/hooks/useToast';

export default function AgentPanel() {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const { data: agentData, mutate: mutateAgent } = useAgent();
  const { data: companyData, mutate: mutateCompany } = useTeam();
  const context = useInteractiveConfig();
  const router = useRouter();
  const pathname = usePathname();
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
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

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
    <SidebarContent title='Agent Management'>
      {agentData && (
        <SidebarGroup>
          <SidebarGroupLabel>{agentData.agent.name}</SidebarGroupLabel>
          <div className='space-y-2 px-2'>
            <div className='text-sm text-muted-foreground'>
              <span className='font-medium'>Company:</span> {companyData?.name}
            </div>
          </div>
        </SidebarGroup>
      )}
      <SidebarGroup>
        <SidebarGroupLabel>Agent Functions</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setNewName(agentData?.agent?.name || '');
                setIsRenameDialogOpen(true);
              }}
              tooltip='Rename Agent'
            >
              <LuPencil className='w-4 h-4' />
              <span>Rename Agent</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

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

          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleExport} tooltip='Export Configuration'>
              <LuDownload className='w-4 h-4' />
              <span>Export Configuration</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleDelete} tooltip='Delete Agent'>
              <LuTrash2 className='w-4 h-4' />
              <span>Delete Agent</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

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
    </SidebarContent>
  );
}
