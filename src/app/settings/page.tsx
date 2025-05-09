import { SidebarPage } from '@/appwrapper/SidebarPage';
import AgentPanel from '@/interface/Settings/agent/AgentPanel';
import { Providers } from '@/interface/Settings/providers';
import { SidebarContent } from '@/components/appwrapper/src/SidebarContentManager';

export default function ProvidersPage() {
  return (
    <SidebarPage title='Settings'>
      <SidebarContent title='Agent Settings'>
        <AgentPanel />
      </SidebarContent>
      <Providers />
    </SidebarPage>
  );
}
