'use client';

import { useAgent } from '../../hooks/useAgent';
import { useTeam } from '@/auth/hooks/useTeam';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { AgentFunctions } from './AgentFunctions';
import { AgentTeamSelection } from './AgentSelection';
import { ProviderRotation } from './ProviderRotation';

export default function AgentPanel() {
  return (
    <>
      <AgentInfo />
      <AgentTeamSelection />
      <ProviderRotation />
      <AgentFunctions />
    </>
  );
}

export function AgentInfo() {
  const { data: agentData } = useAgent();
  const { data: companyData } = useTeam();

  return (
    agentData && (
      <SidebarGroup>
        <SidebarGroupLabel>{agentData.name}</SidebarGroupLabel>
        <div className='space-y-2 px-2'>
          <div className='text-sm text-muted-foreground'>
            <span className='font-medium'>Company:</span> {companyData?.name}
          </div>
        </div>
      </SidebarGroup>
    )
  );
}
