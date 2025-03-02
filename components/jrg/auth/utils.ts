import { NextRequest } from 'next/server';

export const AuthMode = {
  None: 0,
  GTAuth: 1,
  MagicalAuth: 2,
};
export const getAuthMode = (): number => {
  let authMode = AuthMode.None;
  if (process.env.NEXT_PUBLIC_AUTH_URI && process.env.NEXT_PUBLIC_API_URI) {
    if (process.env.APP_URI && process.env.NEXT_PUBLIC_AUTH_URI.startsWith(process.env.APP_URI)) {
      authMode = AuthMode.MagicalAuth;
      if (!process.env.NEXT_PUBLIC_AUTH_URI.endsWith('/user')) {
        throw new Error('Invalid AUTH_URI. For Magical Auth implementations, AUTH_URI must point to APP_URI/user.');
      }
    } else {
      authMode = AuthMode.GTAuth;
    }
  }
  return authMode;
};
export const generateCookieString = (key: string, value: string, age: string): string =>
  `${key}=${value}; Domain=${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}; Path=/; Max-Age=${age}; SameSite=strict;`;

export const getQueryParams = (req: NextRequest): any =>
  req.url.includes('?')
    ? Object.assign(
        {},
        ...req.url
          .split('?')[1]
          .split('&')
          .map((param) => ({ [param.split('=')[0]]: param.split('=')[1] })),
      )
    : {};

export const getRequestedURI = (req: NextRequest): string => {
  console.log(`Processing: ${req.url}`);
  return req.url
    .split('?')[0]
    .replace(/localhost:\d+/, (process.env.APP_URI || '').replace('https://', '').replace('http://', ''));
};

export const getJWT = (req: NextRequest) => {
  const rawJWT = req.cookies.get('jwt')?.value;
  // Strip any and all 'Bearer 's off of JWT.
  const jwt = rawJWT?.split(' ')[rawJWT?.split(' ').length - 1] ?? rawJWT ?? '';
  console.log('JWT:', jwt);
  return jwt;
};
export const verifyJWT = async (jwt: string): Promise<Response> => {
  if (!process.env.SERVERSIDE_API_URI) {
    process.env.SERVERSIDE_API_URI = ['aginfrastructure', 'localhost', 'back-end', 'boilerplate', 'back-end-image'].join(
      ',',
    );
    console.log('Initialized container names: ', process.env.SERVERSIDE_API_URI);
  }
  const containerNames = process.env.SERVERSIDE_API_URI.split(',');
  const responses = {} as any;
  const authEndpoint = `${process.env.API_URI}/v1/user`;
  let response;
  for (const containerName of containerNames) {
    const testEndpoint = authEndpoint.replace('localhost', containerName);
    console.log(`Verifying JWT Bearer ${jwt} with server at ${testEndpoint}...`);
    try {
      response = await fetch(testEndpoint, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${jwt}`,
        },
      });

      if (response.status === 200 || [401, 402, 403].includes(response.status)) {
        console.log(`Successfully contacted server at ${testEndpoint}!`);
        if (Object.keys(responses).length > 0) {
          containerNames.sort((a, b) => {
            if (a === containerName) {
              return -1;
            } else if (b === containerName) {
              return 1;
            } else {
              return 0;
            }
          });
          process.env.SERVERSIDE_API_URI = containerNames.join(',');
          console.log('New container names: ', process.env.SERVERSIDE_API_URI);
        }
        return response;
      } else {
        responses[testEndpoint] = await response.text();
        console.log(`Failed to contact server at ${testEndpoint}.`);
      }
    } catch (exception) {
      responses[testEndpoint] = exception;
    }
  }
  console.error('Failed to contact any of the following servers: ', JSON.stringify(responses));
  for (const key of Object.keys(responses)) {
    console.error(key, responses[key]);
  }
  return new Response();
};
