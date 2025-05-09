'use client';
import { SidebarPage } from '@/appwrapper/SidebarPage';
import { SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function UserLayout({ children }: { children: ReactNode }): ReactNode {
  const pathname = usePathname();

  if (pathname === '/user/manage') return <ManagePageWrapper>{children}</ManagePageWrapper>;

  return (
    <SidebarInset className='flex flex-col w-full h-full'>
      <header
        className='sticky top-0 flex items-center justify-between gap-4 px-4 border-b md:px-6 bg-muted min-h-16'
        style={{ paddingTop: 'env(safe-area-inset-top', height: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        <Logo />
      </header>
      <div className='flex flex-col items-center justify-center flex-1 w-full'>{children}</div>
    </SidebarInset>
  );
}

function ManagePageWrapper({ children }: { children: ReactNode }) {
  return (
    <SidebarInset>
      <SidebarPage title='Account Management'>{children}</SidebarPage>
    </SidebarInset>
  );
}

export const Logo = () => {
  return (
    <div className='flex items-center'>
      <Link href='/' className='flex items-center gap-2 text-lg font-semibold md:text-lg text-foreground'>
        <span className=''>{process.env.NEXT_PUBLIC_APP_NAME}</span>
      </Link>
    </div>
  );
};
