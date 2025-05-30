import { SidebarPage } from '@/appwrapper/SidebarPage';
import { SidebarContent } from '@/components/appwrapper/src/SidebarContentManager';
import { Providers } from '@/components/settings/providers';

export default function ProvidersPage() {
  return (
    <SidebarPage title='Settings'>
      <SidebarContent title='Settings'>
        <div></div>
      </SidebarContent>
      <Providers />
    </SidebarPage>
  );
}
