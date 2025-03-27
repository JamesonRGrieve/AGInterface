'use client';

import { SidebarPage } from '@/appwrapper/SidebarPage';
import { ChainDialog } from '@/interface/Settings/chain/ChainDialog';
import ChainPanel from '@/interface/Settings/chain/ChainPanel';
import { useState } from 'react';

export default function ChainPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <SidebarPage title='Chains'>
      <ChainPanel showCreateDialog={showCreateDialog} setShowCreateDialog={setShowCreateDialog} />
      <ChainDialog open={showCreateDialog} setOpen={setShowCreateDialog} />
    </SidebarPage>
  );
}
