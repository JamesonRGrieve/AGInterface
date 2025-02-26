import InteractiveConfigContextWrapper from '@/components/interactive/ContextWrapper';
import { CommandMenu } from '@/components/interactive/Selectors/Command';
import { CommandMenuProvider } from '@/components/interactive/Selectors/Command/command-menu-context';
import Head from '@/components/jrg/appwrapper/Head';
import { SidebarContentProvider } from '@/components/jrg/appwrapper/SidebarContentManager';
import { SidebarContext } from '@/components/jrg/appwrapper/SidebarContext';
import { SidebarMain } from '@/components/jrg/appwrapper/SidebarMain';
import { SolanaWalletProvider } from '@/components/jrg/wallet/wallet-provider';
import '@/components/jrg/zod2gql/zod2gql';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import './globals.css';
import { metadata, viewport } from './metadata';

// const inter = Inter({ subsets: ['latin'] });

export { metadata, viewport };

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  const cookieStore = cookies();
  const theme = cookieStore.get('theme')?.value ?? process.env.NEXT_PUBLIC_THEME_DEFAULT_MODE;
  const appearance = cookieStore.get('appearance')?.value ?? '';

  return (
    <html lang='en'>
      <Head />
      <body className={cn(/*inter.className,*/ theme, appearance)}>
        <InteractiveConfigContextWrapper>
          <SolanaWalletProvider>
            <CommandMenuProvider>
              <SidebarContentProvider>
                <SidebarProvider className='flex-1'>
                  <SidebarMain side='left' />
                  {children}
                  <Toaster />
                  {/* <ThemeSetter /> */}
                  <CommandMenu />
                  <SidebarContext side='right' />
                </SidebarProvider>
              </SidebarContentProvider>
            </CommandMenuProvider>
          </SolanaWalletProvider>
        </InteractiveConfigContextWrapper>
      </body>
    </html>
  );
}
