'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { LuCheck as CheckIcon, LuMinus as MinusIcon } from 'react-icons/lu';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
import useProducts from '@/components/jrg/auth/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
// const defaultPricingData = [
//   {
//     name: 'Free',
//     description: 'Free forever',
//     price: 'Free',
//     priceAnnual: 'Free',
//     marketing_features: ['1 user', '5 projects', 'Up to 1GB storage', 'Basic support', 'Community access'],
//     isMostPopular: false,
//   },
//   {
//     name: 'Pro',
//     description: 'All the marketing_features of the Pro plan, plus unlimited users and storage.',
//     price: '$49/mo',
//     priceAnnual: '$499/yr',
//     marketing_features: [
//       'Unlimited users',
//       'Unlimited public projects',
//       'Unlimited private projects',
//       'Dedicated phone support',
//       'Priority email support',
//     ],
//     isMostPopular: true,
//   },
//   {
//     name: 'Team',
//     description: 'All the marketing_features of the Pro plan, plus unlimited users and storage.',
//     price: '$69/mo',
//     priceAnnual: '$699/yr',
//     marketing_features: [
//       'Unlimited users',
//       'Unlimited public projects',
//       'Unlimited private projects',
//       'Dedicated phone support',
//       'Priority email support',
//     ],
//     isMostPopular: false,
//   },
// ];
type Product = {
  name: string;
  description: string;
  prices: {
    id: string;
    amount: number;
    currency: string;
    interval: string;
    interval_count: number;
    usage_type: string;
  }[];
  priceAnnual: string;
  marketing_features: { name: string }[];
  isMostPopular: boolean;
};
type PricingCardProps = Product & {
  isAnnual?: boolean;
  price: {
    id: string;
    amount: number;
    currency: string;
    interval: string;
    interval_count: number;
    usage_type: string;
  };
};
export default function PricingTable() {
  // const [isAnnual, setIsAnnual] = useState(false);
  const { data: pricingData, isLoading, error } = useProducts();
  return (
    <>
      {/* <div className='flex items-center justify-center'>
        <Label htmlFor='payment-schedule' className='me-3'>
          Monthly
        </Label>
        <Switch id='payment-schedule' checked={isAnnual} onCheckedChange={setIsAnnual} />
        <Label htmlFor='payment-schedule' className='relative ms-3'>
          Annual
          <span className='absolute -top-10 start-auto -end-28'>
            <Badge className='mt-3 uppercase'>Save up to 10%</Badge>
          </span>
        </Label>
      </div> */}
      {pricingData.length > 0 && (
        <>
          <p className='mt-1 text-muted-foreground'>Whatever your status, our offers evolve according to your needs.</p>

          <div className='flex flex-col items-center max-w-4xl gap-4 px-3 mx-auto my-10 md:items-end md:flex-row'>
            {pricingData.map((product: Product) => (
              <PricingCard key={product.name} price={product.prices[0]} {...product} /> //isAnnual={isAnnual}
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function PricingCard({
  id,
  name,
  description,
  price,
  marketing_features,
  priceAnnual,
  isMostPopular,
  flatRate = false,
  isAnnual = false,
}: PricingCardProps) {
  const [quantity, setQuantity] = useState(1);
  return (
    <Card
      className={cn(
        'w-full max-w-96 border-muted',
        isMostPopular ? 'mb-4 shadow-lg bg-primary text-primary-foreground' : 'mt-2',
      )}
    >
      <CardHeader className='pb-2 text-center'>
        {isMostPopular && (
          <Badge className='self-center mb-3 uppercase w-max bg-primary-foreground text-primary'>Most popular</Badge>
        )}
        <CardTitle className={isMostPopular ? 'mb-7!' : 'mb-7'}>{name}</CardTitle>
        {flatRate && (
          <span className='text-5xl font-bold'>
            {isAnnual
              ? priceAnnual
              : `$${price.unit_amount / 100}${price.currency.toLocaleUpperCase()} / ${price.recurring.interval_count} ${price.recurring.interval}`}
          </span>
        )}
      </CardHeader>
      <CardDescription className={isMostPopular ? 'w-11/12 mx-auto text-primary-foreground' : 'text-center'}>
        {description}
      </CardDescription>
      <CardContent>
        <ul className='mt-7 space-y-2.5 text-sm'>
          {marketing_features?.map((feature) => (
            <li className='flex space-x-2' key={feature.name}>
              {feature.name.startsWith('-') ? (
                <MinusIcon className='shrink-0 mt-0.5 h-4 w-4' />
              ) : (
                <CheckIcon className='shrink-0 mt-0.5 h-4 w-4' />
              )}
              <span className={isMostPopular ? 'text-primary-foreground' : 'text-muted-foreground'}>{feature.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className='flex flex-col gap-4'>
        {getCookie('jwt') ? (
          <>
            <Label htmlFor='quantity'>Initial Users</Label>
            <Input id='quantity' type='number' value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />

            <Button
              className='w-full text-foreground'
              variant={'outline'}
              onClick={async () => {
                const checkout_uri = (
                  await axios.post(
                    process.env.NEXT_PUBLIC_API_URI + '/v1/checkout',
                    {
                      cart: [
                        {
                          price: price.id,
                          quantity: quantity,
                        },
                      ],
                    },
                    {
                      headers: {
                        Authorization: getCookie('jwt'),
                      },
                    },
                  )
                ).data.detail;
                window.location.href = checkout_uri;
              }}
            >
              Sign up
            </Button>
          </>
        ) : (
          <Link href='/user' className='w-full'>
            <Button className='w-full text-foreground' variant={'outline'}>
              Sign up
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
