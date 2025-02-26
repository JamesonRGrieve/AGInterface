'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { ViewVerticalIcon } from '@radix-ui/react-icons';
import { usePathname } from 'next/navigation';
import { useSidebarContent } from './SidebarContentManager';

const visibleOnPaths = ['/chat', '/settings/prompts'];

export function SidebarContext({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar('right');
  const { content, title } = useSidebarContent();
  const pathname = usePathname();

  useEffect(() => {
    if (getCookie('aginteractive-has-started') === 'true') {
      setHasStarted(true);
    }
  }, [getCookie('aginteractive-has-started')]);

  return (
    <Sidebar collapsible='icon' side='right' {...props}>
      <SidebarHeader>
        <h3 className='group-data-[collapsible=icon]:hidden'>{title}</h3>
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
