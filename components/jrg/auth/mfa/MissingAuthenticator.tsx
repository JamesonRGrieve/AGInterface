import { Button } from '@/components/ui/button';
import { Disclosure, DisclosureContent, DisclosureTrigger } from '@/components/ui/disclosure';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { LuLoader as Loader2, LuMail as Mail } from 'react-icons/lu';

export const AuthenticatorHelp = () => {
  const [loading, setLoading] = useState({
    email: false,
    sms: false,
  });

  const handleEmailSend = async () => {
    setLoading((prev) => ({ ...prev, email: true }));
    axios.post(
      `${process.env.NEXT_PUBLIC_API_URI}/v1/user/mfa/email`,
      {
        email: getCookie('email'),
      },
      {
        headers: {
          Authorization: getCookie('jwt'),
        },
      },
    );
    setLoading((prev) => ({ ...prev, email: false }));
  };

  const handleSMSSend = async () => {
    setLoading((prev) => ({ ...prev, sms: true }));
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading((prev) => ({ ...prev, sms: false }));
  };

  return (
    <Disclosure>
      <DisclosureTrigger>
        <Button className='w-full bg-transparent' type='button' variant='outline'>
          I don&apos;t have my authenticator
        </Button>
      </DisclosureTrigger>
      <DisclosureContent>
        <div className='p-2 space-y-2'>
          <Button
            onClick={handleEmailSend}
            disabled={loading.email}
            variant='outline'
            type='button'
            size='sm'
            className='flex w-full gap-2 bg-transparent'
          >
            {loading.email ? <Loader2 className='w-4 h-4 animate-spin' /> : <Mail className='w-4 h-4' />}
            Send Email Code
          </Button>

          {/* <Button
            onClick={handleSMSSend}
            disabled={loading.sms}
            variant='outline'
            type='button'
            size='sm'
            className='flex w-full gap-2 bg-transparent'
          >
            {loading.sms ? <Loader2 className='w-4 h-4 animate-spin' /> : <MessageSquare className='w-4 h-4' />}
            Send SMS Code
          </Button> */}
        </div>
      </DisclosureContent>
    </Disclosure>
  );
};
