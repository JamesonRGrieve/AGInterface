'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className='p-8 text-center'>
      <div className='flex flex-col items-center justify-center mb-4'>
        <AlertTriangle className='w-12 h-12 text-red-500 mb-2' />
        <h2 className='text-2xl font-semibold'>Something went wrong.</h2>
      </div>
      <p className='text-gray-600 mb-6'>An unexpected error occurred. Please try again.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
