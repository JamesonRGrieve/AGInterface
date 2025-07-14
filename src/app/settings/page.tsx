import { SidebarPage } from '@/appwrapper/SidebarPage';
import { SidebarContent } from '@/components/appwrapper/src/SidebarContentManager';
import { Providers } from '@/components/settings/providers';
import AgentPanel from '@/interface/Settings/agent/AgentPanel';

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
