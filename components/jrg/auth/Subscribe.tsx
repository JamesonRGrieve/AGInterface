'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { useAuthentication } from './Router';
import PricingTable from './stripe/PricingTable';

export type SubscribeProps = { redirectTo?: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function Subscribe({ searchParams }: { searchParams: any }): JSX.Element {
  const authConfig = useAuthentication();

  return (
    <>
      <div className='mb-4'>
        <Alert>
          <AlertTitle>Early Access Software</AlertTitle>
          <AlertDescription>
            This is an early-access deployment of open-source software. You may encounter problems or &quot;bugs&quot;. If
            you do, please make note of your most recent actions and{' '}
            <Link
              className='text-info hover:underline'
              href='https://github.com/JamesonRGrieve/AGInteractive/issues/new?template=bug_report_prod.yml'
            >
              let us know by making a report here
            </Link>
            . Your understanding as we build towards the future is much appreciated.
          </AlertDescription>
        </Alert>
      </div>
      {authConfig.subscribe.heading && <h2 className='text-3xl'>{authConfig.subscribe.heading}</h2>}
      {process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID ? (
        <Suspense fallback={<p>Loading pricing...</p>}>
          <h1>Subscribe</h1>
          <div id='stripe-box'>
            <script async src='https://js.stripe.com/v3/pricing-table.js' />
            <stripe-pricing-table
              pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID ?? ''}
              publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}
              customer-session-client-secret={searchParams?.customer_session}
              customer-email={searchParams?.customer_session ? undefined : searchParams?.email || getCookie('email')}
            />
          </div>
        </Suspense>
      ) : (
        <PricingTable />
      )}
    </>
  );
}
