'use client';

import usePathname from '@/auth/hooks/usePathname';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useAgent } from '../hooks/useAgent';

export function CommandSelector({
  value,
  onChange,
  category = 'Default',
}: {
  agentName: string;
  value?: string;
  onChange?: (value: string) => void;
  category?: string;
}): React.JSX.Element {
  const { data: agentData, error } = useAgent();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  if (error) return <div>Failed to load commands</div>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='w-full'>
            <Select
              disabled={!agentData.commands}
              value={value || searchParams.get('command') || undefined}
              onValueChange={
                onChange
                  ? (value) => onChange(value)
                  : (value) => {
                      const current = new URLSearchParams(Array.from(searchParams.entries()));
                      current.set('command', value);
                      const search = current.toString();
                      const query = search ? `?${search}` : '';
                      router.push(`${pathname}${query}`);
                    }
              }
            >
              <SelectTrigger className='w-full text-xs'>
                <SelectValue placeholder='Select a Command' />
              </SelectTrigger>
              <SelectContent>
                {!pathname.includes('settings/commands') && <SelectItem value='/'>- Use Agent Default -</SelectItem>}
                {agentData.commands &&
                  Object.keys(agentData.commands).map(
                    (command) =>
                      command && (
                        <SelectItem key={command} value={command}>
                          {command}
                        </SelectItem>
                      ),
                  )}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Select a Command</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
