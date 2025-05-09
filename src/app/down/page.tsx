'use client';

import { SidebarPage } from '@/appwrapper/SidebarPage';
import { SidebarInset } from '@/components/ui/sidebar';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function BadGateway({}: {}) {
  const [link, setLink] = useState('/');
  useEffect(() => {
    // setLink(getCookie('href')?.toString() ?? '/');
  }, [getCookie('href')]);
  return (
    <SidebarInset>
      <SidebarPage title=''>
        <h2>Server unavailable!</h2>
        <p>It appears your internet connection may have been disrupted, or our server is under maintenance.</p>
        <Link href={link}>Try Again</Link>
      </SidebarPage>
    </SidebarInset>
  );
}
