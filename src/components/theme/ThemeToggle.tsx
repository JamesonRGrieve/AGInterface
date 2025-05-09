'use client';

import { LuEye as Eye, LuMoon as Moon, LuSun as Sun } from 'react-icons/lu';
import { useTheme } from './useTheme';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const icons = {
  dark: <Moon className='h-[1.2rem] w-[1.2rem]' />,
  colorblind: <Eye className='h-[1.2rem] w-[1.2rem]' />,
  light: <Sun className='h-[1.2rem] w-[1.2rem]' />,
};

export function ThemeToggle({ initialTheme }: { initialTheme?: string }) {
  const { currentTheme, themes, setTheme } = useTheme([], initialTheme);

  const Icon = icons[currentTheme.includes('colorblind') ? 'colorblind' : currentTheme.includes('dark') ? 'dark' : 'light'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' className='rounded-full'>
          {Icon}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {themes.map((theme) => (
          <DropdownMenuItem key={theme} onClick={() => setTheme(theme)} className='capitalize'>
            {theme}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
