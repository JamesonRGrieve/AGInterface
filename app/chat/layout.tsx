'use client';

import { SidebarMain, SidebarHeader, SidebarHeaderTitle } from '@/appwrapper/SidebarHeader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarInset } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { useConversation } from '@/interactive/hooks/useConversation';
import { ViewVerticalIcon } from '@radix-ui/react-icons';
import { useParams } from 'next/navigation';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <ChatHeader />
      <SidebarMain>{children}</SidebarMain>
    </SidebarInset>
  );
}

function ChatHeader() {
  const { toggleSidebar } = useSidebar('right');
  const { id } = useParams();
  const { data: conversation } = useConversation(id[0]);
  const title = conversation?.name || 'New Chat';

  return (
    <SidebarHeader>
      <SidebarHeaderTitle className='text-sm md:text-base max-w-[200px] truncate sm:max-w-none sm:text-clip sm:overflow-visible'>
        {title}
      </SidebarHeaderTitle>
      <div className='flex items-center h-full md:hidden'>
        <Separator orientation='vertical' className='h-4' />
        <Button variant='ghost' size='icon' onClick={toggleSidebar}>
          <ViewVerticalIcon />
          <span className='sr-only'>Toggle Sidebar</span>
        </Button>
      </div>
    </SidebarHeader>
  );
}
