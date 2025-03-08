import { SidebarPage } from '@/appwrapper/SidebarPage';
import AgentPanel from '@/interface/Settings/agent/AgentPanel';
import { Providers } from '@/interface/Settings/providers';

export default function ProvidersPage() {
  return (
    <SidebarPage title='Settings'>
      <AgentPanel />
      <Providers />
    </SidebarPage>
  );
}
