import { CallToAction } from '@/components/interactive/Home/call-to-action';
import { Contact } from '@/components/interactive/Home/contact';
import { Features } from '@/components/interactive/Home/features';
import { Hero } from '@/components/interactive/Home/hero';
import { HowItWorks } from '@/components/interactive/Home/how-it-works';
import PricingGrid from '@/components/jrg/auth/stripe/PricingTable';

export default function InteractiveHome() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />

      <CallToAction />
      <div className='flex flex-col items-center justify-center'>
        <PricingGrid />
      </div>
      <Contact />
      <div className='flex flex-col items-center justify-center'>
        <a href='/privacy'>Privacy Policy</a>
      </div>
    </>
  );
}
