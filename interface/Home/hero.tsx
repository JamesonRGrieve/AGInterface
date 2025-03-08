'use client';
import React from 'react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className='py-24 text-foreground bg-linear-to-r from-primary-700 to-primary-900'>
      <div className='container px-6 mx-auto text-center'>
        <h1 className='mb-4 text-4xl font-bold md:text-6xl'>Your AI-Powered Business Intelligence Partner</h1>
        <p className='mb-8 text-xl'>Unlock deep insights from your databases with natural language conversations</p>
        <Link
          href='/user/login'
          className='inline-block px-6 py-3 font-semibold transition duration-300 border rounded-lg bg-primary text-primary-foreground hover:bg-primary-50'
        >
          Get Started Now
        </Link>
      </div>
    </section>
  );
}
