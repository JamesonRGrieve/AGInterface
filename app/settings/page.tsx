import { SidebarPage } from '@/appwrapper/SidebarPage';
import AgentPanel from '@/interactive/Settings/agent/AgentPanel';
import { Providers } from '@/interactive/Settings/providers';

export default function ProvidersPage() {
  return (
    <SidebarPage title='Settings'>
      <AgentPanel />
      <Providers />
    </SidebarPage>
  );
}
