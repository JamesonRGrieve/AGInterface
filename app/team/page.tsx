import { SidebarPage } from '@/appwrapper/SidebarPage';
import Team from '@/auth/management/Team';
import TeamUsers from '@/auth/management/TeamUsers';

export default function TeamPage() {
  return (
    <SidebarPage title='Team Management'>
      <div className='overflow-x-auto px-4'>
        <Team />
        <TeamUsers />
      </div>
    </SidebarPage>
  );
}
