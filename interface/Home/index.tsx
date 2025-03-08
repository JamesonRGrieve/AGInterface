import PricingGrid from '@/auth/Stripe/PricingTable';
import { CallToAction } from '@/interface/Home/call-to-action';
import { Contact } from '@/interface/Home/contact';
import { Features } from '@/interface/Home/features';
import { Hero } from '@/interface/Home/hero';
import { HowItWorks } from '@/interface/Home/how-it-works';

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
