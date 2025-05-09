import { TbMessageCirclePlus } from 'react-icons/tb';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SubPage, useCommandMenu } from '../command-menu-context';
import { CommandItemComponent } from '../index';
import { agentQuickAction } from './agent-selector';
import { themeQuickAction } from './theme';
import { navigationQuickAction } from './navigation';
import { walletQuickAction } from './wallet';
import { chatHistoryQuickAction } from './chat-history';
import { CommandGroup, CommandSeparator } from '@/components/ui/command';

export type QuickAction = {
  label: string;
  icon: React.ElementType;
  shortcut: string[];
  subPage?: string;
};

export const subPageQuickActions = [
  chatHistoryQuickAction,
  agentQuickAction,
  walletQuickAction,
  navigationQuickAction,
  themeQuickAction,
];

export function QuickActionsGroup() {
  const { openSubPage, currentSubPage, setOpen } = useCommandMenu();
  const router = useRouter();

  const onSelect = useCallback(
    (item: { subPage?: string }) => {
      if (item.subPage) {
        openSubPage(item.subPage as SubPage);
      }
    },
    [openSubPage],
  );

  if (currentSubPage !== null) return null;

  const handleNewChat = () => {
    router.push('/chat');
    setOpen(false);
  };

  return (
    <>
      <CommandGroup heading='Quick Actions'>
        <CommandItemComponent
          item={{ label: 'New Chat', icon: TbMessageCirclePlus, description: 'Create a new chat' }}
          onSelect={handleNewChat}
        />
        {subPageQuickActions.map((item) => (
          <CommandItemComponent key={item.label} item={item} onSelect={() => onSelect(item)} />
        ))}
      </CommandGroup>
      <CommandSeparator />
    </>
  );
}
