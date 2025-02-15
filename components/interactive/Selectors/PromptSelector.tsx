'use client';

import usePathname from '@/components/jrg/auth/hooks/usePathname';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect } from 'react';
import { InteractiveConfigContext } from '../InteractiveConfigContext';
import { usePrompts } from '../hooks/usePrompt';

export default function PromptSelector({
  category = 'Default',
  value,
  onChange,
}: {
  category?: string;
  value?: string;
  onChange?: (value: string) => void;
}): React.JSX.Element {
  const state = useContext(InteractiveConfigContext);
  const { data: promptData, error } = usePrompts();
  const searchParams = useSearchParams();
  console.log('PROMPT DATA', promptData);
  const router = useRouter();
  const pathname = usePathname();
  console.log(error);
  useEffect(() => {
    console.log('Value changed to ', value);
  }, [value]);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='w-full'>
            <Select
              disabled={promptData?.length === 0}
              value={value || searchParams.get('prompt') || undefined}
              onValueChange={
                onChange
                  ? (value) => {
                      onChange(value);
                    }
                  : (value) => router.push(`/settings/prompts?category=${category}&prompt=${value}`)
              }
            >
              <SelectTrigger className='w-full text-xs'>
                <SelectValue placeholder='Select a Prompt' />
              </SelectTrigger>
              <SelectContent>
                {!pathname.includes('settings/prompts') && <SelectItem value='/'>- Use Agent Default -</SelectItem>}
                {promptData?.map((prompt, index) => (
                  <SelectItem key={prompt.name} value={prompt.name}>
                    {prompt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Select a Prompt</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
