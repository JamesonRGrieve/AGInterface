import Head from '@/appwrapper/Head';
import { SidebarContentProvider } from '@/appwrapper/SidebarContentManager';
import { SidebarContext } from '@/appwrapper/SidebarContext';
import { SidebarMain } from '@/appwrapper/SidebarMain';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import '@/zod2gql';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import './globals.css';
import { metadata, viewport } from './metadata';

// const inter = Inter({ subsets: ['latin'] });

export { metadata, viewport };

export default async function RootLayout({ children }: { children: ReactNode }): Promise<ReactNode> {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? process.env.NEXT_PUBLIC_THEME_DEFAULT_MODE;
  const appearance = cookieStore.get('appearance')?.value ?? '';
  if (process.env.LANDING_ONLY) {
    return (
      <html lang='en'>
        <Head />
        <body className={cn(/*inter.className,*/ theme, appearance)}>{children}</body>
      </html>
    );
  }
  return (
    <html lang='en'>
      <Head />
      <body className={cn(/*inter.className,*/ theme, appearance)}>
        <SidebarContentProvider>
          <SidebarProvider className='flex-1'>
            <SidebarMain side='left' />
            {children}
            <Toaster />
            {/* <ThemeSetter /> */}
            <SidebarContext side='right' />
          </SidebarProvider>
        </SidebarContentProvider>
      </body>
    </html>
  );
}
