import { SidebarPage } from '@/appwrapper/SidebarPage';
import { SidebarContent } from '@/components/appwrapper/src/SidebarContentManager';
import ProviderSidebar from './[id]/providerSideBar';
import ProviderInstances from './[id]/providers';

export default function TeamPage() {
  return (
    <SidebarPage title='Provider Management'>
      <div className='overflow-x-auto px-4'>
        <ProviderInstances/>
      </div>
      <SidebarContent title='Provider Instance Details'>
        <ProviderSidebar/>
      </SidebarContent>
    </SidebarPage>
  );
}
