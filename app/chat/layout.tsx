'use client';

import { useConversations } from '@/components/interactive/hooks/useConversation';
import { InteractiveConfigContext } from '@/components/interactive/InteractiveConfigContext';
import { SidebarMain } from '@/components/jrg/appwrapper/SidebarHeader';
import { Badge } from '@/components/ui/badge';
import { SidebarHeader, SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Paperclip } from 'lucide-react';
import { useContext } from 'react';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const state = useContext(InteractiveConfigContext);
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();

  // Find the current conversation
  const currentConversation = conversations?.find((conv) => conv.id === state.overrides?.conversation);

  return (
    <SidebarInset className='max-w-[100vw]'>
      <SidebarHeader>
        <div className='flex items-center w-full gap-2 md:pl-4'>
          <div className='flex items-center flex-1 gap-2 mx-auto'>
            {isLoadingConversations && <Skeleton className='w-32 h-4' />}

            {currentConversation && (
              <>
                <h2 className='text-sm font-medium truncate max-w-[calc(100vw-200px)]'>{currentConversation.name}</h2>
                {currentConversation.attachmentCount > 0 && (
                  <Badge variant='secondary' className='gap-1'>
                    <Paperclip className='w-3 h-3' />
                    {currentConversation.attachmentCount}
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarMain className='px-0'>{children}</SidebarMain>
    </SidebarInset>
  );
}
