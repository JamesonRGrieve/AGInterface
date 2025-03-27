import { useCallback } from 'react';
import { Moon, Sun, Monitor, Eye, Palette } from 'lucide-react';
import { CommandItemComponent, CommandMenuGroup } from '..';
import { useCommandMenu } from '../command-menu-context';
import { CommandGroup, CommandSeparator } from '@/components/ui/command';
import { useTheme } from '@/components/jrg/theme/useTheme';

export function ThemeGroup() {
  const { currentSubPage, setOpen } = useCommandMenu();
  const { setTheme } = useTheme();
  const onSelect = useCallback(
    (item: { label: string }) => {
      setTheme(item.label.toLowerCase().replace(' ', '-'));
      setOpen(false);
    },
    [setTheme, setOpen],
  );

  if (currentSubPage !== 'theme') return null;

  return (
    <>
      <CommandGroup heading={themeGroup.heading}>
        {themeGroup.items.map((item) => (
          <CommandItemComponent key={item.label} item={item} onSelect={() => onSelect(item)} />
        ))}
      </CommandGroup>
      <CommandSeparator />
    </>
  );
}

export const themeGroup: CommandMenuGroup = {
  heading: 'Theme',
  items: [
    {
      label: 'Dark',
      icon: Moon,
      description: 'Enable dark mode',
      keywords: ['theme', 'dark', 'mode', 'color'],
    },
    {
      label: 'Light',
      icon: Sun,
      description: 'Enable light mode',
      keywords: ['theme', 'light', 'mode', 'color'],
    },
    {
      label: 'System',
      icon: Monitor,
      description: 'Use system theme',
      keywords: ['theme', 'system', 'mode', 'color'],
    },
    {
      label: 'Colour Blind',
      icon: Eye,
      description: 'Enable colour blind mode',
      keywords: ['theme', 'colour', 'blind', 'mode', 'color'],
    },
    {
      label: 'Colour Blind Dark',
      icon: Eye,
      description: 'Enable colour blind dark mode',
      keywords: ['theme', 'colour', 'blind', 'mode', 'color'],
    },
  ],
};

export const themeQuickAction = {
  label: 'Theme',
  icon: Palette,
  description: 'Change the theme',
  keywords: ['theme', 'colour', 'blind', 'mode', 'color', 'dark', 'light', 'system', 'colourblind', 'colourblind-dark'],
  subPage: 'theme',
};
