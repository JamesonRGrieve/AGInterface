'use client';

import { useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';

const defaultThemes = ['icons', 'labels'];

export const useAppearance = (customAppearances?: string[], initialAppearance?: string) => {
  const [appearances] = useState(() => {
    return Array.from(new Set([...defaultThemes, ...(customAppearances ?? [])]));
  });

  const [appearance, setAppearance] = useState(() => {
    const cookieValue = getCookie('appearance');
    return cookieValue?.toString() ?? initialAppearance ?? 'labels';
  });

  useEffect(() => {
    document.body.classList.remove(...appearances);
    setCookie('appearance', appearance, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    });
    document.body.classList.add(appearance);
  }, [appearance, appearances]);

  return {
    appearances,
    appearance,
    setAppearance,
  };
};
