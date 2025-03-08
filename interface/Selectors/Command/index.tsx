'use client';

import { DialogTitle } from '@radix-ui/react-dialog';

import { ChatHistoryGroup } from './group/chat-history';
import { NavigationGroup } from './group/navigation';
import { WalletCommands } from './group/wallet';
import { QuickActionsGroup } from './group/quick-actions';
import { useCommandMenu } from './command-menu-context';
import { ThemeGroup } from './group/theme';
import { AgentSelectorGroup } from './group/agent-selector';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

export type CommandMenuItem = {
  icon: any;
  label: string;
  description: string;
  url?: string;
  disabled?: boolean;
  keywords?: string[];
};

export type CommandMenuGroup = {
  heading: string;
  items: CommandMenuItem[];
};

export function CommandMenu() {
  const { open, setOpen, setSubPages, search, setSearch } = useCommandMenu();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command
        onKeyDown={(e) => {
          if (e.key === 'Escape' || (e.key === 'Backspace' && !search)) {
            e.preventDefault();
            setSubPages((pages) => pages.slice(0, -1));
          }
        }}
      >
        <DialogTitle className='sr-only'>Command Menu</DialogTitle>
        <CommandInput value={search} onValueChange={setSearch} placeholder='Type a command or search...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <QuickActionsGroup />
          <ChatHistoryGroup />
          <NavigationGroup />
          <WalletCommands />
          <AgentSelectorGroup />
          <CommandSeparator />
          <ThemeGroup />
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

interface CommandItemProps {
  item: {
    label: string;
    icon: React.ElementType;
    description?: string;
    disabled?: boolean;
    keywords?: string[];
  };
  onSelect: () => void;
}

export function CommandItemComponent({ item, onSelect }: CommandItemProps) {
  return (
    <CommandItem disabled={item.disabled} onSelect={onSelect} keywords={item.keywords}>
      <item.icon className='w-4 h-4 mr-2' />
      <div>
        <div>{item.label}</div>
      </div>
      {item.description && (
        <CommandShortcut className='text-xs font-light text-muted-foreground'>{item.description}</CommandShortcut>
      )}
    </CommandItem>
  );
}
