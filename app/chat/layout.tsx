'use client';

import { SidebarMain } from '@/components/jrg/appwrapper/SidebarHeader';
import { SidebarInset } from '@/components/ui/sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <SidebarMain>{children}</SidebarMain>
    </SidebarInset>
  );
}
