'use client';

import { useTeam } from '@/auth/hooks/useTeam';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { setCookie } from 'cookies-next';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaRobot } from 'react-icons/fa';
import { useAgent, useAgents } from '../hooks/useAgent';
import { Agent } from '../hooks/z';

export function AgentSelector() {
  const { isMobile } = useSidebar('left');
  const { data: activeAgent, mutate: mutateActiveAgent, isLoading: isLoadingActiveAgent, error: agentError } = useAgent();
  const { data: activeTeam, mutate: mutateActiveTeam, isLoading: isLoadingActiveTeam, error: teamError } = useTeam();
  const { data: agentsData } = useAgents();
  const router = useRouter();
  console.error({ agentError, teamError });

  const switchAgents = (agent: Agent) => {
    // setActiveAgent(agent);
    setCookie('aginterface-agent', agent.id, {
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    });
    mutateActiveTeam();
    mutateActiveAgent();
  };

  const agentName = isLoadingActiveAgent ? null : activeAgent?.name;
  const teamName = isLoadingActiveTeam ? null : activeTeam?.name;

  const isDropdownDisabled = !activeTeam || isLoadingActiveTeam || isLoadingActiveAgent;
  const hasNoAgents = !isLoadingActiveAgent && !isLoadingActiveTeam && (!activeAgent || !activeTeam);
  const displayName = hasNoAgents ? process.env.NEXT_PUBLIC_APP_NAME : agentName;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              side='left'
              size='lg'
              disabled={isDropdownDisabled}
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground disabled:opacity-100'
            >
              <div className='flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground'>
                <FaRobot className='size-4' />
              </div>
              <div className='grid flex-1 text-sm leading-tight text-left'>
                <span className='font-semibold truncate'>{displayName}</span>
                <span className='text-xs truncate'>{teamName}</span>
              </div>
              {!isDropdownDisabled && <ChevronsUpDown className='ml-auto' />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg px-2'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>Agents</DropdownMenuLabel>
            {agentsData &&
              agentsData.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => switchAgents(agent)}
                  className='flex items-center justify-between p-2 cursor-pointer'
                >
                  <div className='flex flex-col'>
                    <span>{agent.name}</span>
                    <span className='text-xs text-muted-foreground'>-</span>
                  </div>
                  {activeAgent?.id === agent.id && <Check className='w-4 h-4 ml-2' />}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='gap-2 p-2 cursor-pointer'
              onClick={() => {
                router.push('/settings');
              }}
            >
              <div className='flex items-center justify-center border rounded-md size-6 bg-background'>
                <Plus className='size-4' />
              </div>
              <div className='font-medium text-muted-foreground'>Add Agent</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
