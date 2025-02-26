'use client';
import assert from '@/components/jrg/assert/assert';
import deepMerge from '@/lib/objects';
import { notFound } from 'next/navigation';
import { ReactNode, useContext } from 'react';
import { AuthenticationContext } from './AuthenticationContext';
import ErrorPage, { ErrorPageProps } from './ErrorPage';
import User, { IdentifyProps } from './Identify';
import Login, { LoginProps } from './Login';
import Logout, { LogoutProps } from './Logout';
import Manage, { ManageProps } from './management';
import Close, { CloseProps } from './oauth2/Close';
import oAuth2Providers from './oauth2/OAuthProviders';
import OrganizationalUnit, { OrganizationalUnitProps } from './OU';
import Register, { RegisterProps } from './Register';
import Subscribe, { SubscribeProps } from './Subscribe';

type RouterPageProps = {
  path: string;
  heading?: string;
};

export type AuthenticationConfig = {
  identify: RouterPageProps & { props?: IdentifyProps };
  login: RouterPageProps & { props?: LoginProps };
  manage: RouterPageProps & { props?: ManageProps };
  register: RouterPageProps & { props?: RegisterProps };
  close: RouterPageProps & { props?: CloseProps };
  subscribe: RouterPageProps & { props?: SubscribeProps };
  logout: RouterPageProps & { props: LogoutProps };
  ou: RouterPageProps & { props?: OrganizationalUnitProps };
  error: RouterPageProps & { props?: ErrorPageProps };
  authModes: {
    basic: boolean;
    oauth2: boolean;
    magical: boolean;
  };
  authServer: string;
  appName: string;
  authBaseURI: string;
  recaptchaSiteKey?: string;
  enableOU: boolean;
};

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  assert(!context.authModes.basic || !context.authModes.magical, 'Basic and Magical modes cannot both be enabled.');
  if (context === undefined) {
    throw new Error('useAuthentication must be used within an AuthenticationProvider');
  }
  return context;
};

const pageConfigDefaults: AuthenticationConfig = {
  identify: {
    path: '/',
    heading: 'Welcome',
  },
  login: {
    path: '/login',
    heading: 'Please Authenticate',
  },
  manage: {
    path: '/manage',
    heading: 'Account Management',
  },
  register: {
    path: '/register',
    heading: 'Welcome, Please Register',
  },
  close: {
    path: '/close',
    heading: '',
  },
  subscribe: {
    path: '/subscribe',
    heading: 'Please Subscribe to Access The Application',
  },
  ou: {
    path: '/ou',
    heading: 'Organizational Unit Management',
  },
  logout: {
    path: '/logout',
    props: undefined,
    heading: '',
  },
  error: {
    path: '/error',
    heading: 'Error',
  },
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  authBaseURI: process.env.NEXT_PUBLIC_AUTH_WEB,
  authServer: process.env.NEXT_PUBLIC_AGINTERACTIVE_SERVER,
  authModes: {
    basic: false,
    oauth2: Object.values(oAuth2Providers).some((provider) => !!provider.client_id),
    magical: process.env.NEXT_PUBLIC_ALLOW_EMAIL_SIGN_IN === 'true',
  },
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  enableOU: false,
};

export default function AuthRouter({
  params,
  searchParams,
  corePagesConfig = pageConfigDefaults,
  additionalPages = {},
}: {
  params: { slug?: string[] };
  searchParams: any;
  corePagesConfig?: AuthenticationConfig;
  additionalPages: { [key: string]: ReactNode };
}) {
  corePagesConfig = deepMerge(pageConfigDefaults, corePagesConfig);

  console.log('Core Pages Config', corePagesConfig);
  const pages = {
    [corePagesConfig.identify.path]: <User {...corePagesConfig.identify.props} />,
    [corePagesConfig.login.path]: <Login searchParams={searchParams} {...corePagesConfig.login.props} />,
    [corePagesConfig.manage.path]: <Manage {...corePagesConfig.manage.props} />,
    [corePagesConfig.register.path]: <Register {...corePagesConfig.register.props} />,
    [corePagesConfig.close.path]: <Close {...corePagesConfig.close.props} />,
    [corePagesConfig.subscribe.path]: <Subscribe searchParams={searchParams} {...corePagesConfig.subscribe.props} />,
    [corePagesConfig.logout.path]: <Logout {...corePagesConfig.logout.props} />,
    ...(corePagesConfig.enableOU
      ? { [corePagesConfig.ou.path]: <OrganizationalUnit searchParams={searchParams} {...corePagesConfig.ou.props} /> }
      : {}),
    [corePagesConfig.error.path]: <ErrorPage {...corePagesConfig.error.props} />,
    ...additionalPages,
  };

  const path = params.slug ? `/${params.slug.join('/')}` : '/';
  if (path in pages || path.startsWith(corePagesConfig.close.path)) {
    return (
      <AuthenticationContext.Provider value={{ ...pageConfigDefaults, ...corePagesConfig }}>
        {path.startsWith(corePagesConfig.close.path) ? pages[corePagesConfig.close.path] : pages[path.toString()]}
      </AuthenticationContext.Provider>
    );
  } else {
    return notFound();
  }
}
