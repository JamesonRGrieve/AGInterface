'use client';

import { useAgent } from '../../hooks/useAgent';
import { useTeam } from '@/auth/hooks/useTeam';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { AgentFunctions } from './AgentFunctions';

export default function AgentPanel() {
  const { data: agentData, mutate: mutateAgent } = useAgent();
  const { data: companyData } = useTeam();

  return (
    <>
      {agentData && (
        <SidebarGroup>
          <SidebarGroupLabel>{agentData.agent?.name || agentData.name}</SidebarGroupLabel>
          <div className='space-y-2 px-2'>
            <div className='text-sm text-muted-foreground'>
              <span className='font-medium'>Company:</span> {companyData?.name}
            </div>
          </div>
        </SidebarGroup>
      )}
      <AgentFunctions />
    </>
  );
}
