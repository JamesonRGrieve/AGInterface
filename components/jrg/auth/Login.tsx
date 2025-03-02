'use client';

import { useAssertion } from '@/components/jrg/assert/assert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateURI } from '@/lib/validation';
import axios, { AxiosError } from 'axios';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { LuCheck as Check, LuCopy as Copy } from 'react-icons/lu';
import QRCode from 'react-qr-code';
import AuthCard from './AuthCard';
import { AuthenticatorHelp as MissingAuthenticator } from './mfa/MissingAuthenticator';
import { useAuthentication } from './Router';

export type LoginProps = {
  userLoginEndpoint?: string;
};
export default function Login({
  searchParams,
  userLoginEndpoint = '/v1/login',
}: { searchParams: any } & LoginProps): ReactNode {
  const [responseMessage, setResponseMessage] = useState('');
  const authConfig = useAuthentication();
  const router = useRouter();
  const [captcha, setCaptcha] = useState<string | null>(null);

  useAssertion(validateURI(authConfig.authServer + userLoginEndpoint), 'Invalid login endpoint.', [
    authConfig.authServer,
    userLoginEndpoint,
  ]);
  const submitForm = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (authConfig.recaptchaSiteKey && !captcha) {
      setResponseMessage('Please complete the reCAPTCHA.');
      return;
    }

    const formData = Object.fromEntries(new FormData((event.currentTarget as HTMLFormElement) ?? undefined));
    try {
      const response = await axios
        .post(`${authConfig.authServer}${userLoginEndpoint}`, {
          ...formData,
          referrer: getCookie('href') ?? window.location.href.split('?')[0],
        })
        .catch((exception: AxiosError) => exception.response);
      if (response) {
        if (response.status !== 200) {
          setResponseMessage(response.data.detail);
        } else {
          if (validateURI(response.data.detail)) {
            console.log('Is URI.');
            window.location.href = response.data.detail;
          } else {
            console.log('Is not URI.');
            setResponseMessage(response.data.detail);
          }
        }
      }
    } catch (exception) {
      console.error(exception);
    }
  };
  const otp_uri = searchParams.otp_uri;
  return (
    <AuthCard title='Login' description='Please login to your account.' showBackButton>
      <form onSubmit={submitForm} className='flex flex-col gap-4'>
        {otp_uri && (
          <div className='flex flex-col max-w-xs gap-2 mx-auto text-center'>
            <div
              style={{
                padding: '0.5rem',
                backgroundColor: 'white',
              }}
            >
              <QRCode
                size={256}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={otp_uri ?? ''}
                viewBox={`0 0 256 256`}
              />
            </div>
            <p className='text-sm text-center text-muted-foreground'>
              Scan the above QR code with Microsoft Authenticator, Google Authenticator or equivalent (or click the copy
              button if you are using your Authenticator device).
            </p>
            <CopyButton content={otp_uri} label={'Copy Link'} />
          </div>
        )}
        <input type='hidden' id='email' name='email' value={getCookie('email')} />
        {authConfig.authModes.basic && (
          <>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' placeholder='Password' name='password' autoComplete='password' />
          </>
        )}
        <Label htmlFor='token'>Multi-Factor Code</Label>
        <Input id='token' placeholder='Enter your 6 digit code' name='token' autoComplete='one-time-code' />
        <MissingAuthenticator />
        {authConfig.recaptchaSiteKey && (
          <div className='my-3'>
            <ReCAPTCHA
              sitekey={authConfig.recaptchaSiteKey}
              onChange={(token: string | null) => {
                setCaptcha(token);
              }}
            />
          </div>
        )}

        <Button type='submit'>{responseMessage ? 'Continue' : 'Login'}</Button>
        {responseMessage && <AuthCard.ResponseMessage>{responseMessage}</AuthCard.ResponseMessage>}
      </form>
    </AuthCard>
  );
}

export const CopyButton = ({ content, label = 'Copy' }: { content: string; label?: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Button
      variant='outline'
      size='sm'
      type='button'
      className='flex items-center gap-2 mx-auto'
      onClick={() => {
        setIsCopied(true);
        navigator.clipboard.writeText(content);
        setTimeout(() => setIsCopied(false), 2000);
      }}
    >
      {isCopied ? <Check className='w-4 h-4' /> : <Copy className='w-4 h-4' />}
      {isCopied ? 'Copied!' : label}
    </Button>
  );
};
