import { SidebarPage } from '@/appwrapper/SidebarPage';
import { Extensions } from '@/interactive/Settings/extensions';

export default function ExtensionsPage() {
  return (
    <SidebarPage title='Extensions'>
      <Extensions />
    </SidebarPage>
  );
}
