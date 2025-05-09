import { SidebarInset } from '@/components/ui/sidebar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <div className='p-4'>{children}</div>
    </SidebarInset>
  );
}
