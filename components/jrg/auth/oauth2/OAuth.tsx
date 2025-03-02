'use client';

import { useAgent } from '@/components/interactive/hooks/useAgent';
import { Button } from '@/components/ui/button';
import deepMerge from '@/lib/objects';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback, useMemo } from 'react';
import OAuth2Login from 'react-simple-oauth2-login';
import log from '../../next-log/log';
import providers from './OAuthProviders';

export type OAuthProps = {
  overrides?: any;
};
export default function OAuth({ overrides }: OAuthProps): ReactNode {
  const router = useRouter();
  const oAuthProviders = useMemo(() => deepMerge(providers, overrides) as typeof providers, [providers, overrides]);
  const { mutate } = useAgent();
  log(['OAuth Providers: ', oAuthProviders], { client: 3 });
  const onOAuth2 = useCallback(
    (response: any) => {
      mutate();
      document.location.href = `${process.env.NEXT_PUBLIC_APP_URI}/chat`; // This should be fixed properly just low priority.

      // const redirect = getCookie('href') ?? '/';
      // deleteCookie('href');
      // router.push(redirect);
    },
    [router],
  );
  /*
  // Eventually automatically launch if it's the only provider.
  useEffect(() => {
    if (Object.values(providers).filter((provider) => provider.client_id).length === 1) {
      
    }
  }, []);
  */
  return (
    <>
      {Object.values(oAuthProviders).some((provider) => provider.client_id) &&
        process.env.NEXT_PUBLIC_ALLOW_EMAIL_SIGN_IN === 'true' && <hr />}
      {Object.entries(oAuthProviders).map(([key, provider]) => {
        return (
          provider.client_id && (
            <OAuth2Login
              key={key}
              authorizationUrl={provider.uri}
              responseType='code'
              clientId={provider.client_id}
              scope={provider.scope}
              redirectUri={`${process.env.NEXT_PUBLIC_AUTH_URI}/close/${key.replaceAll('.', '-').replaceAll(' ', '-').replaceAll('_', '-').toLowerCase()}`}
              onSuccess={onOAuth2}
              onFailure={onOAuth2}
              extraParams={provider.params}
              isCrossOrigin
              render={(renderProps) => (
                <Button variant='outline' type='button' className='space-x-1 bg-transparent' onClick={renderProps.onClick}>
                  <span className='text-lg'>{provider.icon}</span>
                  <span>Login with {key}</span>
                </Button>
              )}
            />
          )
        );
      })}
    </>
  );
}
