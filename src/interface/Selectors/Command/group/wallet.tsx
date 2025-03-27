'use client';

import { useWallet, type Wallet } from '@solana/wallet-adapter-react';
import { Wallet as WalletIcon, Copy, SwitchCamera, LogOut } from 'lucide-react';
import { CommandItemComponent } from '../index';
import { useCommandMenu } from '../command-menu-context';
import { CommandGroup } from '@/components/ui/command';
import { useToast } from '@/hooks/useToast';

const walletSubPages = ['wallet-list', 'wallet-connected'];

export function WalletCommands() {
  const { connected } = useWallet();

  const { currentSubPage } = useCommandMenu();

  if (!walletSubPages.includes(currentSubPage ?? '')) return null;

  return (
    <CommandGroup heading='Wallet'>
      {currentSubPage === walletSubPages[0] && <WalletList />}
      {currentSubPage === walletSubPages[1] && connected && <WalletConnected />}
    </CommandGroup>
  );
}

function WalletList() {
  const { wallets, select, connect } = useWallet();
  const { openSubPage } = useCommandMenu();

  const handleSelectWallet = async (selectedWallet: Wallet) => {
    try {
      await select(selectedWallet.adapter.name);
      await connect();
      openSubPage('wallet-connected');
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <>
      {wallets.map((wallet) => (
        <CommandItemComponent
          key={wallet.adapter.name}
          item={{
            icon: WalletIcon,
            label: wallet.adapter.name,
            description: 'Select this wallet',
            keywords: ['wallet', 'select', 'connect', wallet.adapter.name],
          }}
          onSelect={() => handleSelectWallet(wallet)}
        />
      ))}
    </>
  );
}

function WalletConnected() {
  const { publicKey, disconnect } = useWallet();
  const { toast } = useToast();
  const { setOpen, openSubPage } = useCommandMenu();

  const handleCopyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
        duration: 3000,
      });
    }
  };

  return (
    <>
      <CommandItemComponent
        item={{
          icon: Copy,
          label: 'Copy Address',
          description: 'Copy wallet address to clipboard',
          keywords: ['wallet', 'copy', 'address'],
        }}
        onSelect={handleCopyAddress}
      />
      <CommandItemComponent
        item={{
          icon: SwitchCamera,
          label: 'Change Wallet',
          description: 'Switch to a different wallet',
          keywords: ['wallet', 'change', 'switch'],
        }}
        onSelect={() => openSubPage('wallet-list')}
      />
      <CommandItemComponent
        item={{
          icon: LogOut,
          label: 'Disconnect',
          description: 'Disconnect current wallet',
          keywords: ['wallet', 'disconnect', 'logout'],
        }}
        onSelect={() => {
          disconnect();
          setOpen(false);
        }}
      />
    </>
  );
}

export const walletQuickAction = {
  label: 'Wallet',
  icon: WalletIcon,
  description: 'View your wallet',
  keywords: ['wallet', 'balance', 'transactions', 'payments', 'crypto', 'solana', 'sol', 'connect wallet'],
  subPage: 'wallet-list',
};
