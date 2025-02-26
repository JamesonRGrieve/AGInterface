'use client';

import DynamicForm from '@/components/jrg/dynamic-form/DynamicForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';
import Link from 'next/link';
import { mutate } from 'swr';
import log from '../../next-log/log';
import VerifySMS from '../mfa/SMS';

export const Profile = ({
  isLoading,
  error,
  data,
  router,
  authConfig,
  userDataSWRKey,
  responseMessage,
  userUpdateEndpoint,
  setResponseMessage,
}: {
  isLoading: boolean;
  error: any;
  data: any;
  router: any;
  authConfig: any;
  userDataSWRKey: string;
  responseMessage: string;
  userUpdateEndpoint: string;
  setResponseMessage: (message: string) => void;
}) => {
  return (
    <div>
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
      <div>
        <h3 className='text-lg font-medium'>Profile</h3>
        <p className='text-sm text-muted-foreground'>Apply basic changes to your profile</p>
      </div>
      <Separator className='my-4' />
      {isLoading ? (
        <p>Loading Current Data...</p>
      ) : error ? (
        <p>{error.message}</p>
      ) : (data.missing_requirements && Object.keys(data.missing_requirements).length === 0) ||
        !data.missing_requirements ? (
        <DynamicForm
          toUpdate={data}
          submitButtonText='Update'
          excludeFields={[
            'id',
            'agent_id',
            'missing_requirements',
            'email',
            'subscription',
            'stripe_id',
            'ip_address',
            'companies',
          ]}
          readOnlyFields={['input_tokens', 'output_tokens']}
          additionalButtons={[
            <Button key='done' className='col-span-2' onClick={() => router.push('/chat')}>
              Go to {authConfig.appName}
            </Button>,
          ]}
          onConfirm={async (data) => {
            const updateResponse = (
              await axios
                .put(
                  `${authConfig.authServer}${userUpdateEndpoint}`,
                  {
                    ...Object.entries(data).reduce((acc, [key, value]) => {
                      return value ? { ...acc, [key]: value } : acc;
                    }, {}),
                  },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: getCookie('jwt'),
                    },
                  },
                )
                .catch((exception: any) => exception.response)
            ).data;
            log(['Update Response', updateResponse], { client: 2 });
            setResponseMessage(updateResponse.detail.toString());
            await mutate('/user');
          }}
        />
      ) : (
        <>
          {data.missing_requirements.some((obj) => Object.keys(obj).some((key) => key === 'verify_email')) && (
            <p className='text-xl'>Please check your email and verify it using the link provided.</p>
          )}
          {data.missing_requirements.verify_sms && <VerifySMS verifiedCallback={async () => await mutate(userDataSWRKey)} />}
          {data.missing_requirements.some((obj) =>
            Object.keys(obj).some((key) => !['verify_email', 'verify_sms'].includes(key)),
          ) && (
            <DynamicForm
              submitButtonText='Submit Missing Information'
              fields={Object.entries(data.missing_requirements).reduce((acc, [key, value]) => {
                // @ts-expect-error This is a valid assignment.
                acc[Object.keys(value)[0]] = { type: Object.values(value)[0] };
                return acc;
              }, {})}
              excludeFields={['verify_email', 'verify_sms']}
              onConfirm={async (data) => {
                const updateResponse = (
                  await axios
                    .put(
                      `${authConfig.authServer}${userUpdateEndpoint}`,
                      {
                        ...data,
                      },
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: getCookie('jwt'),
                        },
                      },
                    )
                    .catch((exception: any) => exception.response)
                ).data;
                if (updateResponse.detail) {
                  setResponseMessage(updateResponse.detail.toString());
                }
                await mutate(userDataSWRKey);
                if (data.missing_requirements && Object.keys(data.missing_requirements).length === 0) {
                  const redirect = getCookie('href') ?? '/';
                  deleteCookie('href');
                  router.push(redirect);
                }
              }}
            />
          )}
          {responseMessage && <p>{responseMessage}</p>}
        </>
      )}
    </div>
  );
};
