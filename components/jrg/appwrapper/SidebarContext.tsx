// components/jrg/appwrapper/SidebarContext.tsx
'use client';

import { ViewVerticalIcon } from '@radix-ui/react-icons';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSidebarContent } from './SidebarContentManager';

const visibleOnPaths = ['/chat', '/settings/prompts'];

export function SidebarContext({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar('right');
  const { content } = useSidebarContent();
  const pathname = usePathname();

  if (!visibleOnPaths.some((path) => pathname.startsWith(path))) return null;

  return (
    <Sidebar collapsible='icon' side='right' {...props}>
      <SidebarHeader>
        <h3 className='group-data-[collapsible=icon]:hidden'>Context Sidebar</h3>
      </SidebarHeader>
      <SidebarContent>{content}</SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton tooltip='Hide Sidebar' side='right' onClick={toggleSidebar}>
          <ViewVerticalIcon />
          <span className='sr-only'>Toggle Sidebar</span>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail side='right' />
    </Sidebar>
  );
}
