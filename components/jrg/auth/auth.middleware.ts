import { NextRequest, NextResponse } from 'next/server';
import { AuthMode, generateCookieString, getAuthMode, getJWT, getQueryParams, getRequestedURI, verifyJWT } from './utils';

export type MiddlewareHook = (req: NextRequest) => Promise<{
  activated: boolean;
  response: NextResponse;
}>;

export const useAuth: MiddlewareHook = async (req) => {
  const toReturn = {
    activated: false,
    response: NextResponse.redirect(new URL(process.env.AUTH_URI as string), { headers: {} }),
  };
  const requestedURI = getRequestedURI(req);
  const authMode = getAuthMode();

  console.log('Requested: ' + requestedURI);
  if (authMode) {
    const queryParams = getQueryParams(req);
    if (requestedURI.endsWith('/user/logout')) {
      return toReturn;
    }
    if (queryParams['verify_email'] && queryParams['email']) {
      console.log('VERIFYING EMAIL: ', queryParams['email'], queryParams['verify_email']);
      await fetch(`${process.env.API_URI}/v1/user/verify/email`, {
        method: 'POST',
        body: JSON.stringify({
          email: queryParams['email'],
          code: queryParams['verify_email'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    console.log('-Query Params-');
    console.log(queryParams);
    if (queryParams.invitation_id && queryParams.email) {
      console.log(`DETECTED INVITE - ${process.env.AUTH_URI}/register`);
      const cookieArray = [
        generateCookieString('email', queryParams.email, (86400).toString()),
        generateCookieString('invitation', queryParams.invitation_id, (86400).toString()),
      ];
      if (queryParams.company) {
        cookieArray.push(generateCookieString('company', queryParams.company, (86400).toString()));
      }
      toReturn.activated = true;
      toReturn.response = NextResponse.redirect(`${process.env.AUTH_URI}/register`, {
        // @ts-expect-error NextJS' types are wrong.
        headers: {
          'Set-Cookie': cookieArray,
        },
      });
    }

    if (
      !process.env.PRIVATE_ROUTES?.split(',').some((path) => req.nextUrl.pathname.startsWith(path)) &&
      !req.nextUrl.pathname.startsWith('/user')
    ) {
      console.log('Private routes: ', process.env.PRIVATE_ROUTES?.split(','));
      console.log('Public route: ', req.nextUrl.pathname);
      return toReturn;
    }
    if (req.nextUrl.pathname.startsWith('/user/close')) {
      // Let oauth close happen on subsequent links.
      return toReturn;
    }
    const jwt = getJWT(req);
    if (jwt) {
      try {
        const response = await verifyJWT(jwt);
        console.log('Response Status: ', response.status);
        const responseJSON = await response.json();
        console.log(responseJSON);
        if (response.status === 402) {
          console.log('- NO SUBSCRIPTION GUARD CLAUSE INVOKED -');
          // Payment Required
          // No body = no stripe ID present for user.
          // Body = that is the session ID for the user to get a new subscription.
          if (!requestedURI.startsWith(`${process.env.AUTH_URI}/subscribe`)) {
            console.log(
              `Payment required. Redirecting to: ${process.env.AUTH_URI}/subscribe${
                responseJSON.detail.customer_session.client_secret
                  ? '?customer_session=' + responseJSON.detail.customer_session.client_secret
                  : ''
              }`,
            );

            toReturn.response = NextResponse.redirect(
              new URL(
                `${process.env.AUTH_URI}/subscribe${
                  responseJSON.detail.customer_session.client_secret
                    ? '?customer_session=' + responseJSON.detail.customer_session.client_secret
                    : ''
                }`,
              ),
            );
            toReturn.activated = true;
          }
        } else if (responseJSON?.missing_requirements || response.status === 403) {
          console.log('- MISSING REQUIREMENTS GUARD CLAUSE INVOKED -');
          // Forbidden (Missing Values for User)
          if (!requestedURI.startsWith(`${process.env.AUTH_URI}/manage`)) {
            toReturn.response = NextResponse.redirect(new URL(`${process.env.AUTH_URI}/manage`));
            toReturn.activated = true;
          }
        } else if (response.status === 502) {
          console.log('- SERVER DOWN GUARD CLAUSE INVOKED -');
          const cookieArray = [generateCookieString('href', requestedURI, (86400).toString())];
          toReturn.activated = true;
          toReturn.response = NextResponse.redirect(new URL(`${process.env.AUTH_URI}/down`, req.url), {
            // @ts-expect-error NextJS' types are wrong.
            headers: {
              'Set-Cookie': cookieArray,
            },
          });
        } else if (response.status >= 500 && response.status < 600) {
          console.log('- SERVER ERROR GUARD CLAUSE INVOKED -');
          // Internal Server Error
          // This should not delete the JWT.
          console.error(
            `Invalid token response, status ${response.status}, detail ${responseJSON.detail}. Server error, please try again later.`,
          );

          toReturn.response = NextResponse.redirect(new URL(`${process.env.AUTH_URI}/error`, req.url));
          toReturn.activated = true;
        } else if (response.status !== 200) {
          console.log('- UNKNOWN RESPONSE CODE GUARD CLAUSE INVOKED -');
          // @ts-expect-error NextJS' types are wrong.
          toReturn.response.headers.set('Set-Cookie', [
            generateCookieString('jwt', '', (0).toString()),
            generateCookieString('href', requestedURI, (86400).toString()),
          ]);
          throw new Error(`Invalid token response, status ${response.status}, detail ${responseJSON.detail}.`);
        } else if (
          authMode === AuthMode.MagicalAuth &&
          requestedURI.startsWith(process.env.AUTH_URI || '') &&
          jwt.length > 0 &&
          !['/user/manage'].includes(req.nextUrl.pathname)
        ) {
          console.log('- AUTHED USER TO UNAUTHED PATH GUARD CLAUSE INVOKED -');
          console.log(
            `Detected authenticated user attempting to visit non-management page. Redirecting to ${process.env.AUTH_URI}/manage...`,
          );
          toReturn.response = NextResponse.redirect(new URL(`${process.env.AUTH_URI}/manage`));
          toReturn.activated = true;
        } else {
          console.log('JWT is valid and no guard clauses tripped.');
        }
        console.log('JWT is valid (or server was unable to verify it).');
      } catch (exception) {
        if (exception instanceof TypeError && exception.cause instanceof AggregateError) {
          console.error(
            `Invalid token. Failed with TypeError>AggregateError. Logging out and redirecting to authentication at ${process.env.AUTH_URI}. ${exception.message} Exceptions to follow.`,
          );
          for (const anError of exception.cause.errors) {
            console.error(anError.message);
          }
        } else if (exception instanceof AggregateError) {
          console.error(
            `Invalid token. Failed with AggregateError. Logging out and redirecting to authentication at ${process.env.AUTH_URI}. ${exception.message} Exceptions to follow.`,
          );
          for (const anError of exception.errors) {
            console.error(anError.message);
          }
        } else if (exception instanceof TypeError) {
          console.error(
            `Invalid token. Failed with TypeError. Logging out and redirecting to authentication at ${process.env.AUTH_URI}. ${exception.message} Cause: ${exception.cause}.`,
          );
        } else {
          console.error(
            `Invalid token. Logging out and redirecting to authentication at ${process.env.AUTH_URI}.`,
            exception,
          );
        }
        toReturn.activated = true;
      }
    } else {
      console.log(
        `${requestedURI} does ${requestedURI.startsWith(process.env.AUTH_URI as string) ? '' : 'not '}start with ${process.env.AUTH_URI}.`,
      );

      if (
        authMode === AuthMode.MagicalAuth &&
        requestedURI.startsWith(process.env.AUTH_URI || '') &&
        req.nextUrl.pathname !== '/user/manage'
      ) {
        console.log('Pathname: ' + req.nextUrl.pathname);
      } else {
        console.log(
          `Detected unauthenticated user attempting to visit non-auth page, redirecting to authentication at ${process.env.AUTH_URI}...`,
        );
        toReturn.response = NextResponse.redirect(new URL(process.env.AUTH_URI as string), {
          headers: { 'Set-Cookie': generateCookieString('href', requestedURI, (86400).toString()) },
        });
        toReturn.activated = true;
      }
    }
  }
  console.log('Going to:');
  console.log(toReturn);
  return toReturn;
};

export const useOAuth2: MiddlewareHook = async (req) => {
  const provider = req.nextUrl.pathname.split('?')[0].split('/').pop();
  const redirect = new URL(`${process.env.AUTH_URI}/close/${provider}`);
  let toReturn = {
    activated: false,
    response: NextResponse.redirect(redirect),
  };
  const queryParams = getQueryParams(req);
  if (queryParams.code) {
    const oAuthEndpoint = `${process.env.API_URI || ''.replace('localhost', (process.env.SERVERSIDE_API_URI || '').split(',')[0])}/v1/oauth2/${provider}`;

    // Use the state parameter as the JWT if present
    const jwt = queryParams.state || getJWT(req);
    console.log('Using JWT from state:', jwt);

    try {
      const response = await fetch(oAuthEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          code: queryParams.code,
          referrer: redirect.toString(),
          state: jwt,
          invitation: req.cookies.get('invitation')?.value,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: jwt || '',
        },
      });

      console.log('Middleware OAuth2 response status:', response.status);
      const auth = await response.json();
      console.log('Middleware OAuth2 response:', auth);

      if (response.status !== 200) {
        throw new Error(`Invalid token response, status ${response.status}.`);
      }

      // Forward the original JWT in the response if present
      const headers = new Headers();
      if (jwt) {
        headers.set('Authorization', jwt);
      }

      toReturn = {
        activated: true,
        response: NextResponse.redirect(auth.detail, {
          headers: headers,
        }),
      };
    } catch (error) {
      console.error('Middleware OAuth2 error:', error);
    }
  }
  return toReturn;
};
export const useJWTQueryParam: MiddlewareHook = async (req) => {
  const queryParams = getQueryParams(req);
  const requestedURI = getRequestedURI(req);
  const toReturn = {
    activated: false,
    // This should set the cookie and then re-run the middleware (without query params).
    response: req.nextUrl.pathname.startsWith('/user/close')
      ? NextResponse.next({
          // @ts-expect-error NextJS' types are wrong.
          headers: {
            'Set-Cookie': [generateCookieString('jwt', queryParams.token ?? queryParams.jwt, (86400 * 7).toString())],
          },
        })
      : NextResponse.redirect(req.cookies.get('href')?.value ?? process.env.APP_URI ?? '', {
          // @ts-expect-error NextJS' types are wrong.
          headers: {
            'Set-Cookie': [
              generateCookieString('jwt', queryParams.token ?? queryParams.jwt, (86400 * 7).toString()),
              generateCookieString('href', '', (0).toString()),
            ],
          },
        }),
  };
  if (queryParams.token || queryParams.jwt) {
    toReturn.activated = true;
  }
  return toReturn;
};
