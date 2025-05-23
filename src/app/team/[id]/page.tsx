import { SidebarPage } from '@/appwrapper/SidebarPage';
import { SidebarContent } from '@/components/appwrapper/src/SidebarContentManager';
import Team from '@/auth/management/Team';
import TeamUsers from '@/auth/management/TeamUsers';

export default function TeamPage() {
  return (
    <SidebarPage title='Team Management'>
      <div className='overflow-x-auto px-4'>
        <TeamUsers />
      </div>
      <SidebarContent title='Team Details'>
        <Team />
      </SidebarContent>
    </SidebarPage>
  );
}
