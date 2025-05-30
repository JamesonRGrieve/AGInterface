'use client';

import { SidebarPage } from '@/appwrapper/SidebarPage';
import { ChainDialog } from '@/interface/Settings/chain/ChainDialog';
import ChainPanel from '@/interface/Settings/chain/ChainPanel';
import { useState } from 'react';
import { useChain } from '@/interface/hooks/useChain';
import { useSearchParams } from 'next/navigation';
import ChainSteps from '@/interface/Settings/chain/ChainSteps';
import { SidebarContent } from '@/components/appwrapper/src/SidebarContentManager';

export default function ChainPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const searchParams = useSearchParams();
  const { data: chainData, error } = useChain(searchParams.get('chain') ?? undefined);

  return (
    <SidebarPage title='Chains'>
      <SidebarContent title='Chains'>
        <ChainPanel showCreateDialog={showCreateDialog} setShowCreateDialog={setShowCreateDialog} />
        <ChainDialog open={showCreateDialog} setOpen={setShowCreateDialog} />
      </SidebarContent>
      {chainData && (
        <div className='mt-4'>
          <ChainSteps />
        </div>
      )}
    </SidebarPage>
  );
}
