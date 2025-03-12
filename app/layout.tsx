import Head from '@/appwrapper/Head';
import { SidebarContentProvider } from '@/appwrapper/SidebarContentManager';
import { SidebarContext } from '@/appwrapper/SidebarContext';
import { SidebarMain } from '@/appwrapper/SidebarMain';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import InteractiveConfigContextWrapper from '@/interactive/ContextWrapper';
import { CommandMenu } from '@/interface/Selectors/Command';
import { CommandMenuProvider } from '@/interface/Selectors/Command/command-menu-context';
import { SolanaWalletProvider } from '@/jrg/wallet/wallet-provider';
import { cn } from '@/lib/utils';
import '@/zod2gql/zod2gql';
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
