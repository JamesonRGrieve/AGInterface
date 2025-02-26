'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { TooltipBasic } from '@/components/ui/tooltip';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

export function OverrideSwitch({ name, label }: { name: string; label: string }): React.JSX.Element {
  const [state, setState] = useState<boolean | null>(
    getCookie('aginteractive-' + name) === undefined ? null : getCookie('aginteractive-' + name) !== 'false',
  );
  useEffect(() => {
    if (state === null) {
      deleteCookie('aginteractive-' + name, { domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN });
    } else {
      setCookie('aginteractive-' + name, state.toString(), {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        maxAge: 2147483647,
      });
    }
  }, [state, name]);
  return (
    <div className='flex flex-col items-center gap-1'>
      <span className='text-lg'>{label}</span>
      <div className='flex items-center gap-2'>
        <Checkbox checked={state === null} onClick={() => setState((old) => (old === null ? false : null))} />
        <p>Use Default</p>
      </div>
      {state !== null && (
        <TooltipBasic title={label}>
          <div className='flex flex-row items-center space-x-2'>
            <p>{state === null ? null : state ? 'Allowed' : 'Never'}</p>
            <Switch id={label} checked={state} onClick={() => setState((old) => !old)} />
          </div>
        </TooltipBasic>
      )}
    </div>
  );
}
