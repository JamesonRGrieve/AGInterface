'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LuPlus, LuCheck, LuDownload, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useInteractiveConfig } from '@/components/interactive/InteractiveConfigContext';
import { mutate } from 'swr';
import { useActiveCompany, useAgent } from '../../hooks';
import { getCookie, setCookie } from 'cookies-next';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

export default function AgentPanel({ setShowCreateDialog }) {
  const [renaming, setRenaming] = useState(false);
  const [creating, setCreating] = useState(false);
  const { data: agentData } = useAgent();
  const [newName, setNewName] = useState('');
  const [newParent, setNewParent] = useState('');
  const context = useInteractiveConfig();
  const router = useRouter();
  const pathname = usePathname();
  const { data: activeCompany } = useActiveCompany();
  const handleConfirm = async () => {
    if (renaming) {
      try {
        await context.agixt.renameAgent(getCookie('agixt-agent').toString(), newName);
        setRenaming(false);
        setCookie('agixt-agent', newName, {
          domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        });
        mutate('/agents');
      } catch (error) {
        console.error('Failed to rename agent:', error);
      }
    } else if (creating) {
      try {
        const newResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_AGIXT_SERVER}/api/agent`,
          { agent_name: newName, settings: { company_id: activeCompany.id } },
          {
            headers: {
              Authorization: getCookie('jwt'),
              'Content-Type': 'application/json',
            },
          },
        );
        setCookie('agixt-agent', newName, {
          domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        });
        mutate('/agents');
        setCreating(false);
      } catch (error) {
        console.error('Failed to create agent:', error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await context.agixt.deleteAgent(getCookie('agixt-agent').toString());
      mutate('/agents');
      router.push(pathname);
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleExport = async () => {
    try {
      const agentConfig = await context.agixt.getAgentConfig(getCookie('agixt-agent').toString());
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(agentConfig)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `${getCookie('agixt-agent')}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Failed to export agent:', error);
    }
  };

  return (
    <div className='flex items-center space-x-2 mb-4'>
      {renaming || creating ? (
        <>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className='w-64'
            placeholder='Enter agent name'
          />
          @ {activeCompany.name}
        </>
      ) : (
        <h3>
          {getCookie('agixt-agent')?.toString()} @ {activeCompany.name}
        </h3>
      )}

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
        {creating ? <LuCheck className='h-4 w-4' /> : <LuPlus className='h-4 w-4' />}
      </Button>

      <Button
        onClick={() => {
          if (renaming) {
            handleConfirm();
          } else {
            setRenaming(true);
            setNewName(getCookie('agixt-agent')?.toString() || '');
          }
        }}
        disabled={creating}
        size='icon'
        variant='ghost'
      >
        {renaming ? <LuCheck className='h-4 w-4' /> : <LuPencil className='h-4 w-4' />}
      </Button>

      <Button onClick={handleExport} disabled={renaming || creating} size='icon' variant='ghost'>
        <LuDownload className='h-4 w-4' />
      </Button>

      <Button onClick={handleDelete} disabled={renaming || creating} size='icon' variant='ghost'>
        <LuTrash2 className='h-4 w-4' />
      </Button>
    </div>
  );
}
