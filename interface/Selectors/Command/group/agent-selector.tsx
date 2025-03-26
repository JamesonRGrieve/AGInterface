'use client';

import { useTeam } from '@/auth/hooks/useTeam';
import { CommandGroup, CommandItem } from '@/components/ui/command';
import { useAgent, useAgents } from '@/interface/hooks/useAgent';
import { setCookie } from 'cookies-next';
import { Bot, Check } from 'lucide-react';
import { useCallback } from 'react';
import { useCommandMenu } from '../command-menu-context';

export function AgentSelectorGroup() {
  const { currentSubPage, setOpen } = useCommandMenu();
  const { data: activeAgent, mutate: mutateActiveAgent } = useAgent();
  const { mutate: mutateActiveCompany } = useTeam();
  const { data: agentsData } = useAgents();

  const onSelect = useCallback(
    (agentName: string) => {
      setCookie('aginterface-agent', agentName, {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      });
      mutateActiveCompany();
      mutateActiveAgent();
      setOpen(false);
    },
    [mutateActiveAgent, mutateActiveCompany, setOpen],
  );

  if (currentSubPage !== 'agents') return null;

  if (!agentsData || !agentsData.length) return null;

  return (
    <CommandGroup heading='Agents'>
      {agentsData.map((agent) => (
        <CommandItem key={agent.id} onSelect={() => onSelect(agent.name)} className='flex items-center justify-between py-3'>
          <div className='flex items-center gap-2'>
            <Bot className='w-4 h-4' />
            <div className='flex flex-col'>
              <span>{agent.name}</span>
              <span className='text-xs text-muted-foreground'>{agent.companyName}</span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>{agent.default ? 'Default' : ''}</span>
            {activeAgent?.agent?.id === agent.id && <Check className='w-4 h-4 ml-2' />}
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export const agentQuickAction = {
  label: 'Switch Agent',
  icon: Bot,
  description: 'Switch between available agents',
  keywords: ['agent', 'bot', 'switch', 'change'],
  subPage: 'agents',
};
