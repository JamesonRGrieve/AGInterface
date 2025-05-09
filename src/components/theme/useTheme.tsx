'use client';

import { useState } from 'react';
import { setCookie } from 'cookies-next';

const defaultThemes = ['default', 'dark', 'colorblind', 'colorblind-dark'];

export const useTheme = (customThemes?: string[], initialTheme?: string) => {
  const [themes, setThemes] = useState(() => {
    return Array.from(new Set([...defaultThemes, ...(customThemes ?? [])]));
  });
  const [currentTheme, setCurrentTheme] = useState(() => initialTheme ?? 'default');

  const setTheme = (newTheme: string) => {
    const classList = document.body.classList;
    classList.remove(...themes);
    classList.add(newTheme);

    setCookie('theme', newTheme, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    });

    setCurrentTheme(newTheme);
  };

  return {
    themes,
    currentTheme,
    setThemes,
    setTheme,
  };
};
