'use client';

import React, { ReactNode } from 'react';
import { useTheme } from './useTheme';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { Switch } from '@/components/ui/switch';

export default function SwitchDark(): ReactNode {
  const { currentTheme, setTheme } = useTheme();
  const isColorBlind = currentTheme.includes('colorblind');
  const isDark = currentTheme.includes('dark');

  const switchTheme = () => {
    if (!isColorBlind) {
      return setTheme(isDark ? 'default' : 'dark');
    }
    setTheme(isDark ? 'colorblind' : 'colorblind-dark');
  };

  // TODO: implement switching logic. This is to get rid of MUI
  return <div className='hidden' />;

  return (
    <Tooltip>
      <TooltipTrigger>
        <Switch checked={!currentTheme.includes('dark')} onClick={switchTheme} />
      </TooltipTrigger>
      <TooltipContent>
        <p>{currentTheme.includes('dark') ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
