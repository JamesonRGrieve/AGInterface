'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CallToAction() {
  return (
    <section className='py-20 text-foreground bg-primary-800'>
      <div className='container px-6 mx-auto text-center'>
        <h2 className='mb-4 text-3xl font-bold'>Ready to Unlock the Full Potential of Your Data?</h2>
        <p className='mb-8 text-xl'>Start today and experience the power of AI-driven business intelligence.</p>
        <Link href='/user/login'>
          <Button size='lg'>Get Started Now</Button>
        </Link>
      </div>
    </section>
  );
}
