'use client';

import usePathname from '@/auth/hooks/usePathname';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InteractiveConfigContext } from '@/interactive/InteractiveConfigContext';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext } from 'react';
import { usePrompts } from '../hooks/usePrompt';

export type PromptSelectorProps = {
  category?: string;
  value?: string;
  onChange?: (value: string) => void;
};
export default function PromptSelector({ category = 'Default', value, onChange }: PromptSelectorProps): React.JSX.Element {
  const state = useContext(InteractiveConfigContext);
  const { data: promptData, error } = usePrompts();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
