'use client';

import { SidebarPage } from '@/appwrapper/SidebarPage';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import NewPromptDialog from '@/interface/Settings/prompt/PromptDialog';
import PromptPanel from '@/interface/Settings/prompt/PromptPanel';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function PromptPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const context = useInteractiveConfig();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarPage title='Prompts'>
      <PromptPanel
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
        context={context}
        searchParams={searchParams}
        pathname={pathname}
        router={router}
      />
      <NewPromptDialog open={showCreateDialog} setOpen={setShowCreateDialog} />
    </SidebarPage>
  );
}
