'use client';

import { useInteractiveConfig } from '@/components/interactive/InteractiveConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowDown, ArrowUp, Save, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { ChainSelector } from '../../Selectors/ChainSelector';
import { CommandSelector } from '../../Selectors/CommandSelector';
import PromptSelector from '../../Selectors/PromptSelector';
import { useChain, useChains } from '../../hooks/useChain';

const ignoreArgs = [
  'prompt_name',
  'prompt_category',
  'command_name',
  'chain',
  'user_input',
  'agent_name',
  'COMMANDS',
  'command_list',
  'date',
  'working_directory',
  'helper_agent_name',
  'conversation_history',
  'persona',
  'import_files',
  'output_url',
];

export default function ChainStep({
  step,
  last_step,
  agent_name,
  step_type,
  step_object,
}: {
  step: number;
  last_step: boolean;
  agent_name: string;
  step_type: string;
  step_object: any;
}) {
  const [agentName, setAgentName] = useState(agent_name);
  const [targetName, setTargetName] = useState(
    step_type === 'Prompt'
      ? step_object.prompt_name
      : step_type === 'Command'
        ? step_object.command_name
        : step_object.chain,
  );
  const [args, setArgs] = useState(step_object);
  const [targetCategory, setTargetCategory] = useState(step_object.category || 'Default');
  const [stepType, setStepType] = useState(step_type);
  const context = useInteractiveConfig();
  const [modified, setModified] = useState(false);
  const searchParams = useSearchParams();
  const { mutate } = useChain(searchParams.get('chain') ?? undefined);
  const { mutate: mutateChainList } = useChains();

  const { data: agentData } = useSWR('/agents', async () =>
    (await context.sdk.getAgents())
      .map((agent: any) => agent.name)
      .sort((a: any, b: any) => {
        const nameA = typeof a.name === 'string' ? a.name.trim().toLowerCase() : '';
        const nameB = typeof b.name === 'string' ? b.name.trim().toLowerCase() : '';
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      }),
  );

  const step_types = useMemo(
    () => ({
      Prompt: {
        component: (
          <div className='space-y-2'>
            {/* <PromptCategorySelector category={targetCategory.toString()} categoryMutate={setTargetCategory} /> */}
            <div>
              <Label htmlFor='prompt-name'>Prompt Name</Label>
              <PromptSelector value={targetName} onChange={setTargetName} />
            </div>
          </div>
        ),
      },
      Command: {
        component: (
          <div>
            <Label htmlFor='command-name'>Command Name</Label>
            <CommandSelector agentName={agentName} value={targetName} mutate={setTargetName} />
          </div>
        ),
      },
      Chain: {
        component: (
          <div>
            <Label htmlFor='chain-name'>Chain Name</Label>
            <ChainSelector value={targetName} mutate={setTargetName} />
          </div>
        ),
      },
    }),
    [agentName, targetName, targetCategory],
  );

  useEffect(() => {
    (async (): Promise<void> => {
      let newArgs;
      if (stepType === 'Prompt') {
        newArgs = await context.sdk.getPromptArgs(targetName, targetCategory);
      } else if (stepType === 'Chain') {
        newArgs = await context.sdk.getChainArgs(targetName);
      } else {
        newArgs = await context.sdk.getCommandArgs(targetName);
        if (typeof newArgs === 'string' && newArgs.includes('AxiosError')) {
          setArgs({});
          return;
        }
        newArgs = Object.keys(newArgs);
      }
      if (newArgs.includes('AxiosError')) {
        setArgs({});
      } else {
        const filteredArr = newArgs.filter((x) => !ignoreArgs.includes(x.name));
        const newObj = filteredArr.reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {});
        setArgs(newObj);
      }
    })();
  }, [stepType, targetName, targetCategory]);

  useEffect(() => {
    if (step_object.prompt_category) {
      setTargetCategory(step_object.prompt_category);
    } else {
      setTargetCategory('Default');
    }
  }, [step_object.prompt_category]);

  const handleIncrement = async (): Promise<void> => {
    await context.sdk.moveStep(searchParams.get('chain') ?? '', step, Number(step) + 1);
    mutate();
  };

  const handleDecrement = async (): Promise<void> => {
    await context.sdk.moveStep(searchParams.get('chain') ?? '', step, Number(step) - 1);
    mutate();
  };

  const handleSave = async (): Promise<void> => {
    const nameObj = {};
    if (stepType === 'Prompt') {
      nameObj['prompt_name'] = targetName;
      nameObj['prompt_category'] = targetCategory;
    } else if (stepType === 'Command') {
      nameObj['command_name'] = targetName;
    } else {
      nameObj['chain_name'] = targetName;
    }
    await context.sdk.updateStep(searchParams.get('chain') ?? '', step, agentName, stepType, { ...args, ...nameObj });
    mutate();
    setModified(false);
  };

  const handleDelete = async (): Promise<void> => {
    await context.sdk.deleteStep(searchParams.get('chain') ?? '', step);
    mutateChainList();
  };

  return (
    <div className='p-4 space-y-4'>
      <div className='flex items-center'>
        <h3 className='text-lg font-semibold mr-6'>Step {step}</h3>
        <TooltipProvider>
          <div className='flex items-center space-x-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' onClick={handleDecrement} disabled={step === 1}>
                  <ArrowUp className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Step Up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' onClick={handleIncrement} disabled={last_step}>
                  <ArrowDown className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Step Down</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' onClick={handleSave} disabled={!modified}>
                  <Save className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{modified ? 'Save Changes' : 'No Changes to Save'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' onClick={handleDelete}>
                  <X className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Step</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div>
          <Label htmlFor='step-type'>Step Type</Label>
          <Select
            value={stepType.toString()}
            onValueChange={(value) => {
              setTargetName('');
              setTargetCategory('Default');
              setStepType(value);
              setModified(true);
            }}
          >
            <SelectTrigger id='step-type'>
              <SelectValue placeholder='Select a Type...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='-1'>Select a Type...</SelectItem>
              {Object.keys(step_types).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='agent-name'>Agent Name</Label>
          <Select
            value={agentName}
            onValueChange={(value) => {
              setAgentName(value);
              setModified(true);
            }}
          >
            <SelectTrigger id='agent-name'>
              <SelectValue placeholder='Select an Agent' />
            </SelectTrigger>
            <SelectContent>
              {agentData &&
                agentData.map(
                  (agent) =>
                    agent !== 'undefined' && (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ),
                )}
            </SelectContent>
          </Select>
        </div>
        <div>{stepType && step_types[stepType].component}</div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {Object.keys(args)
          .filter((key) => !ignoreArgs.includes(key))
          .map((name) => {
            const label = name.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());

            if (typeof args[name] === 'boolean') {
              return (
                <div key={name} className='flex items-center space-x-2'>
                  <Switch
                    id={name}
                    checked={args[name]}
                    onCheckedChange={(checked) => {
                      setArgs({ ...args, [name]: checked });
                      setModified(true);
                    }}
                  />
                  <Label htmlFor={name}>{label}</Label>
                </div>
              );
            }

            return (
              <div key={name}>
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  value={args[name]}
                  type={typeof args[name] === 'number' ? 'number' : 'text'}
                  onChange={(e) => {
                    setArgs({ ...args, [name]: e.target.value });
                    setModified(true);
                  }}
                  className='w-full'
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
