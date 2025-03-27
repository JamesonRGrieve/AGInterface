'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { WalletReadyState, type WalletName } from '@solana/wallet-adapter-base';
import { useWallet, type Wallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ChevronDown, Wallet as WalletIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

export function WalletModal() {
  const { wallets, select } = useWallet();
  const { visible, setVisible } = useWalletModal();

  const [listedWallets, collapsedWallets] = useMemo(() => {
    const installed: Wallet[] = [];
    const notInstalled: Wallet[] = [];

    for (const wallet of wallets) {
      if (wallet.readyState === WalletReadyState.Installed) {
        installed.push(wallet);
      } else {
        notInstalled.push(wallet);
      }
    }

    return installed.length ? [installed, notInstalled] : [notInstalled, []];
  }, [wallets]);

  function handleWalletClick(walletName: WalletName) {
    select(walletName);
    setVisible(false);
  }

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {listedWallets.length ? 'Connect a wallet on Solana to continue' : "You'll need a wallet on Solana to continue"}
          </DialogTitle>
        </DialogHeader>

        {listedWallets.length ? (
          <InstalledWalletsList
            listedWallets={listedWallets}
            collapsedWallets={collapsedWallets}
            handleWalletClick={handleWalletClick}
          />
        ) : (
          <NoWalletsView collapsedWallets={collapsedWallets} handleWalletClick={handleWalletClick} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function InstalledWalletsList({
  listedWallets,
  collapsedWallets,
  handleWalletClick,
}: {
  listedWallets: Wallet[];
  collapsedWallets: Wallet[];
  handleWalletClick: (walletName: WalletName) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function handleExpandClick() {
    setExpanded(!expanded);
  }

  return (
    <div className='grid gap-4'>
      <div className='grid gap-2'>
        {listedWallets.map((wallet) => (
          <WalletListItem key={wallet.adapter.name} wallet={wallet} onClick={() => handleWalletClick(wallet.adapter.name)} />
        ))}
      </div>

      {collapsedWallets.length > 0 && (
        <>
          <Button onClick={handleExpandClick} variant='outline' className='justify-between w-full'>
            <span>{expanded ? 'Less' : 'More'} options</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>

          {expanded && (
            <div className='grid gap-2'>
              {collapsedWallets.map((wallet) => (
                <WalletListItem
                  key={wallet.adapter.name}
                  wallet={wallet}
                  onClick={() => handleWalletClick(wallet.adapter.name)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NoWalletsView({
  collapsedWallets,
  handleWalletClick,
}: {
  collapsedWallets: Wallet[];
  handleWalletClick: (walletName: WalletName) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function handleExpandClick() {
    setExpanded(!expanded);
  }

  return (
    <div className='flex flex-col items-center justify-center gap-4 py-8'>
      <WalletIcon className='w-16 h-16 text-muted-foreground' />
      {collapsedWallets.length > 0 && (
        <>
          <Button onClick={handleExpandClick} variant='ghost' className='gap-2'>
            <span>{expanded ? 'Hide' : 'Already have a wallet? View'} options</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>

          {expanded && (
            <div className='grid w-full gap-2'>
              {collapsedWallets.map((wallet) => (
                <WalletListItem
                  key={wallet.adapter.name}
                  wallet={wallet}
                  onClick={() => handleWalletClick(wallet.adapter.name)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WalletListItem({ wallet, onClick }: { wallet: Wallet; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant='outline'
      className={cn(
        'w-full justify-between h-auto p-3',
        wallet.readyState === WalletReadyState.Installed && 'border-green-500',
      )}
    >
      <div className='flex items-center gap-3'>
        <div className='w-6 h-6'>
          {wallet.adapter.icon && (
            <img src={wallet.adapter.icon} alt={`${wallet.adapter.name} icon`} className='w-full h-full' />
          )}
        </div>
        <span>{wallet.adapter.name}</span>
      </div>
      {wallet.readyState === WalletReadyState.Installed && <span className='text-xs text-green-500'>Detected</span>}
    </Button>
  );
}
