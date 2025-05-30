import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';

import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
  if (cookies().has('jwt')) {
    redirect('/chat');
  }

  return (
    <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} className='w-full'>
      <header
        className='sticky top-0 flex items-center justify-between gap-4 px-4 border-b md:px-6 bg-muted min-h-16'
        style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        <div className='flex items-center'>
          <Link href='/' className='flex items-center gap-2 text-lg font-semibold md:text-lg text-foreground'>
            <span className=''>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeToggle initialTheme={cookies().get('theme')?.value} />
          <Link href={process.env.NEXT_PUBLIC_AUTH_URI || '/user'}>
            <Button size='lg' className='px-4 rounded-full'>
              Login or Register
            </Button>
          </Link>
        </div>
      </header>
      <main></main>
    </div>
  );
}
