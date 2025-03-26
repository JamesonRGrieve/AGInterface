'use client';

import { useTeam } from '@/auth/hooks/useTeam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LuCheck, LuDownload, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import { useAgent } from '../../hooks/useAgent';
import { SidebarContent } from '@/appwrapper/SidebarContentManager';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ArrowBigLeft, Check, Download, Pencil, Plus, Save, Trash2, Upload } from 'lucide-react';
import AgentSelectorBasic from '@/interface/Selectors/AgentSelectorBasic';
import AgentRotationSelector from '@/interface/Selectors/AgentRotationSelector';
import TeamSelector from '@/auth/Selectors/TeamSelector';

export default function AgentPanel({ setShowCreateDialog }) {
  const [renaming, setRenaming] = useState(false);
  const [creating, setCreating] = useState(false);
  const { data: agentData, mutate: mutateAgent } = useAgent();
  const [newName, setNewName] = useState('');

  const context = useInteractiveConfig();
  const router = useRouter();
  const pathname = usePathname();
  const { data: companyData, mutate: mutateCompany } = useTeam();
  const handleConfirm = async () => {
    if (renaming) {
      try {
        await context.sdk.renameAgent(agentData.agent.name, newName);
        setRenaming(false);
        setCookie('aginteractive-agent', newName, {
          domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        });
        mutateAgent();
      } catch (error) {
        console.error('Failed to rename agent:', error);
      }
    } else if (creating) {
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
        setCookie('aginteractive-agent', newName, {
          domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        });

        mutateCompany();
        mutateAgent();
        setCreating(false);
      } catch (error) {
        console.error('Failed to create agent:', error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await context.sdk.deleteAgent(agentData.agent.name);
      mutateCompany();
      mutateAgent();
      router.push(pathname);
    } catch (error) {
      console.error('Failed to delete agent:', error);
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
    } catch (error) {
      console.error('Failed to export agent:', error);
    }
  };
  return (
    <div className='flex flex-col items-center justify-between mb-4 space-x-2 md:flex-row'>
      <SidebarContent title='Agent Management'>
        <SidebarGroup>
          <SelectTeam />
          <SelectAgent />
          <AgentProvider />
          <AgentFunctions />
        </SidebarGroup>
      </SidebarContent>
      <div className='flex items-center space-x-2'>
        {renaming || creating ? (
          <>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className='w-64'
              placeholder='Enter agent name'
            />
            @ {companyData?.name}
          </>
        ) : (
          <h3>
            {agentData?.agent?.name} @ {companyData?.name}
          </h3>
        )}
      </div>
      <div>
        <Button
          onClick={() => {
            if (creating) {
              handleConfirm();
            } else {
              setCreating(true);
              setNewName('');
            }
          }}
          disabled={renaming}
          size='icon'
          variant='ghost'
        >
          {creating ? <LuCheck className='w-4 h-4' /> : <LuPlus className='w-4 h-4' />}
        </Button>

        <Button
          onClick={() => {
            if (renaming) {
              handleConfirm();
            } else {
              setRenaming(true);
              setNewName(getCookie('aginteractive-agent')?.toString() || '');
            }
          }}
          disabled={creating}
          size='icon'
          variant='ghost'
        >
          {renaming ? <LuCheck className='w-4 h-4' /> : <LuPencil className='w-4 h-4' />}
        </Button>

        <Button onClick={handleExport} disabled={renaming || creating} size='icon' variant='ghost'>
          <LuDownload className='w-4 h-4' />
        </Button>

        <Button onClick={handleDelete} disabled={renaming || creating} size='icon' variant='ghost'>
          <LuTrash2 className='w-4 h-4' />
        </Button>
      </div>
    </div>
  );

  // Compmonent for Select Team section
  function SelectTeam() {
    return (
      <>
        <SidebarGroupLabel>Select Team</SidebarGroupLabel>
        <SidebarMenuButton className='group-data-[state=expanded]:hidden'>
          <ArrowBigLeft />
        </SidebarMenuButton>
        <div className='w-full group-data-[collapsible=icon]:hidden'>
          {renaming ? (
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className='w-full' />
          ) : (
            <TeamSelector />
          )}
        </div>
      </>
    );
  }

  // Component for Select
  function SelectAgent() {
    return (
      <>
        <SidebarGroupLabel>Select Agent</SidebarGroupLabel>
        <div className='w-full group-data-[collapsible=icon]:hidden'>
          {renaming ? (
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className='w-full' />
          ) : (
            <AgentSelectorBasic />
          )}
        </div>
      </>
    );
  }

  // Component for Agent Provider
  function AgentProvider() {
    return (
      <>
        <SidebarGroupLabel>Agent Provider</SidebarGroupLabel>
        <div className='w-full group-data-[collapsible=icon]:hidden'>
          {renaming ? (
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className='w-full' />
          ) : (
            <AgentRotationSelector />
          )}
        </div>
      </>
    );
  }

  // Component for Agent Functions
  function AgentFunctions() {
    return (
      <>
        <SidebarGroupLabel>Agent Functions</SidebarGroupLabel>
        <SidebarMenu>
          {[
            {
              title: 'Create Agent',
              icon: Plus,
              disabled: renaming,
            },
            {
              title: renaming ? 'Save Name' : 'Rename Agent',
              icon: renaming ? Check : Pencil,
              func: renaming
                ? () => {
                    setRenaming(false);
                  }
                : () => setRenaming(true),
              disabled: false,
            },
            {
              title: 'Import Agent',
              icon: Upload,
              disabled: renaming,
            },
            {
              title: 'Export Agent',
              icon: Download,
              disabled: renaming,
            },
            {
              title: 'Delete Agent',
              icon: Trash2,
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
      </>
    );
  }
}