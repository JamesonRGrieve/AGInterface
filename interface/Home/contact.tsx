'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function Contact() {
  return (
    <section id='contact' className='py-20 bg-background'>
      <div className='w-full max-w-2xl mx-auto space-y-8'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold'>Contact Us</h1>
          <p className='text-gray-500 dark:text-gray-400'>Please fill in the form below to get in touch.</p>
        </div>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' placeholder='Enter your name' />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' placeholder='Enter your email' type='email' />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='message'>Message</Label>
            <Textarea id='message' placeholder='Enter your message' className='min-h-[100px]' />
          </div>
          <Button type='submit'>Submit</Button>
        </div>
      </div>
    </section>
  );
}
