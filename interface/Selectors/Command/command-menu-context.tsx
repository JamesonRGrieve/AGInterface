'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type CommandMenuContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  subPages: SubPage[];
  setSubPages: (setter: SubPage[] | ((prev: SubPage[]) => SubPage[])) => void;
  currentSubPage: SubPage;
  search: string;
  setSearch: (search: string) => void;
  openSubPage: (subPage: SubPage) => void;
  closeSubPage: () => void;
};

const CommandMenuContext = createContext<CommandMenuContextType | undefined>(undefined);

type CommandMenuProviderProps = {
  children: ReactNode;
};

export type SubPage = 'chat-history' | 'navigation' | 'wallet-list' | 'wallet-connected' | 'theme' | 'agents' | null;

export function CommandMenuProvider({ children }: CommandMenuProviderProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [subPages, setSubPages] = useState<SubPage[]>([]);
  const currentSubPage = subPages[subPages.length - 1] ?? null;

  const toggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearch('');
        toggle();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!open) {
      setSubPages([]);
    }
  }, [open]);

  const openSubPage = (subPage: SubPage) => {
    setSubPages((pages) => [...pages, subPage]);
    setSearch('');
  };

  const closeSubPage = () => {
    setSubPages((pages) => pages.slice(0, -1));
  };

  return (
    <CommandMenuContext.Provider
      value={{
        open,
        setOpen,
        toggle,
        subPages,
        setSubPages,
        currentSubPage,
        search,
        setSearch,
        openSubPage,
        closeSubPage,
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenu() {
  const context = useContext(CommandMenuContext);

  if (context === undefined) {
    throw new Error('useCommandMenu must be used within a CommandMenuProvider');
  }

  return context;
}
