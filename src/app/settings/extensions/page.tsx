import { SidebarPage } from '@/appwrapper/SidebarPage';
import { Extensions } from '@/components/settings/extensions';

export default function ExtensionsPage() {
  return (
    <SidebarPage title='Extensions'>
      <Extensions />
    </SidebarPage>
  );
}
