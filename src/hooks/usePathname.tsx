'use client';

import { usePathname as useNextPathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function usePathname() {
  const pathname = useNextPathname();
  const [currentPathname, setCurrentPathname] = useState(pathname);

  useEffect(() => {
    setCurrentPathname(pathname);
  }, [pathname]);

  return currentPathname;
}
