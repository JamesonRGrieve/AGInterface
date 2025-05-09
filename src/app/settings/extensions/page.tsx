import { SidebarPage } from '@/appwrapper/SidebarPage';
import { Extensions } from '@/interface/Settings/extensions';

export default function ExtensionsPage() {
  return (
    <SidebarPage title='Extensions'>
      <Extensions />
    </SidebarPage>
  );
}
