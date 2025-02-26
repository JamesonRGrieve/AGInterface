'use client';

import { useInteractiveConfig } from '@/components/interactive/InteractiveConfigContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { mutate } from 'swr';
import { useAgent } from '../../hooks/useAgent';

export default function AgentMenu() {
  const context = useInteractiveConfig();

  const { data: agentData } = useAgent();

  const handleToggleAll = async () => {
    const allEnabled = Object.values(agentData.commands).every((command) => command);
    await context.sdk.toggleCommand(context.agent, '*', !allEnabled);
    mutate(`/agent/commands?agent=${context.agent}`);
  };

  return (
    <Card>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='toggle-all'>All Commands</Label>
          <Switch
            id='toggle-all'
            checked={agentData.commands && Object.values(agentData.commands).every((command) => command)}
            onCheckedChange={handleToggleAll}
          />
        </div>
        {agentData.commands &&
          Object.entries(agentData.commands)
            .sort()
            .map(([command, enabled]) => <AgentMenuItem key={command} name={command} enabled={enabled} />)}
      </CardContent>
    </Card>
  );
}

function AgentMenuItem({ name, enabled }) {
  const context = useInteractiveConfig();

  const handleToggle = async () => {
    await context.sdk.toggleCommand(context.agent, name, !enabled);
    mutate(`/agent/commands?agent=${context.agent}`);
  };

  return (
    <div className='flex items-center justify-between'>
      <Label htmlFor={`toggle-${name}`}>{name}</Label>
      <Switch id={`toggle-${name}`} checked={enabled} onCheckedChange={handleToggle} />
    </div>
  );
}
