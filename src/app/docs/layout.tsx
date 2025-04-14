import { SidebarInset } from '@/components/ui/sidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <div className='p-4'>{children}</div>
    </SidebarInset>
  );
}
