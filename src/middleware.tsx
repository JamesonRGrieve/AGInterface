import { NextRequest, NextResponse } from 'next/server';
import { useAuth, useJWTQueryParam, useOAuth2 } from '@/auth/auth.middleware';
import { MiddlewareHook } from '@/auth/types/MiddlewareHook';
import { getRequestedURI } from '@/auth/utils';
import log from '@/next-log/log';

//import assert from 'assert';

export const mergeConfigs = (obj1: any, obj2: any): any =>
  Object.keys(obj2).reduce(
    (acc, key) => ({
      ...acc,
      [key]:
        typeof obj2[key] === 'object' && obj2[key] !== null && obj1[key] ? mergeConfigs(obj1[key], obj2[key]) : obj2[key],
    }),
    { ...obj1 },
  );

export const useNextAPIBypass: MiddlewareHook = async (req) => {
  const toReturn = {
    activated: false,
    response: NextResponse.next(),
  };
  if (
    req.nextUrl.pathname.startsWith('/_next/') ||
    req.nextUrl.pathname.startsWith('/api/') ||
    req.nextUrl.pathname === '/favicon.ico'
  ) {
    toReturn.activated = true;
  }
  return toReturn;
};

export const useSocketIOBypass: MiddlewareHook = async (req) => {
  const url = new URL(getRequestedURI(req));

  return {
    activated: url.host === 'socket.io',
    response: NextResponse.next(),
  };
};

export default async function Middleware(req: NextRequest): Promise<NextResponse> {
  log([`MIDDLEWARE INVOKED AT ${req.nextUrl.pathname}`], {
    server: 1,
  });
  const hooks = [useNextAPIBypass, useOAuth2, useJWTQueryParam, useAuth];
  for (const hook of hooks) {
    const hookResult = await hook(req);
    if (hookResult.activated) {
      hookResult.response.headers.set('x-next-pathname', req.nextUrl.pathname);
      return hookResult.response;
    }
  }
  return NextResponse.next({
    headers: {
      'x-next-pathname': req.nextUrl.pathname,
    },
  });
}
