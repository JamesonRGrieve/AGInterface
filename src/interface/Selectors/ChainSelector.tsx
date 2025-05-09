'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useChains } from '../hooks/useChain';
import usePathname from '@/auth/hooks/usePathname';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ChainSelector({
  value,
  onChange,
}: {
  category?: string;
  value?: string;
  onChange?: (value: string) => void;
}): React.JSX.Element {
  const { data: chainData, error } = useChains();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  if (error) return <div>Failed to load chains</div>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='w-full'>
            <Select
              disabled={!chainData || chainData.length === 0}
              value={value || searchParams.get('chain') || undefined}
              onValueChange={
                onChange
                  ? (value) => onChange(value)
                  : (value) => {
                      const current = new URLSearchParams(Array.from(searchParams.entries()));
                      current.set('chain', value);
                      const search = current.toString();
                      const query = search ? `?${search}` : '';
                      router.push(`${pathname}${query}`);
                    }
              }
            >
              <SelectTrigger className='w-full text-xs'>
                <SelectValue placeholder='Select a Chain' />
              </SelectTrigger>
              <SelectContent>
                {!pathname.includes('settings/chains') && <SelectItem value='/'>- Use Agent Default -</SelectItem>}

                {chainData?.map((chain) => (
                  <SelectItem key={chain.id} value={chain.chainName}>
                    {chain.chainName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Select a Chain</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
