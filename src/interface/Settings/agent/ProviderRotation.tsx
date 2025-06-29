'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProviders } from '@/hooks/useProvider';
import { useAgent } from '@/interface/hooks/useAgent';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import { useToast } from '@/hooks/useToast';

export function ProviderRotation() {
  const { data: providers, isLoading: providersLoading } = useProviders();
  const { data: agentData, mutate: mutateAgent } = useAgent();
  const [selectedRotationId, setSelectedRotationId] = useState<string | undefined>(undefined);
  const context = useInteractiveConfig();
  const { toast } = useToast();

  useEffect(() => {
    if (agentData?.rotationId && !selectedRotationId) {
      setSelectedRotationId(agentData.rotationId);
    }
  }, [agentData, selectedRotationId]);

  const handleRotationChange = async (rotationId: string) => {
    setSelectedRotationId(rotationId);
    if (!agentData) return;
    try {
      await context.sdk.updateAgentSettings(agentData.name, {
        ...agentData,
        rotationId: rotationId,
      });
      mutateAgent();
      toast({ title: 'Success', description: 'Provider rotation updated.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || error?.message || 'Failed to update provider rotation',
        variant: 'destructive',
      });
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Provider Rotation</SidebarGroupLabel>
      <Select value={selectedRotationId} onValueChange={handleRotationChange} disabled={providersLoading || !agentData}>
        <SelectTrigger>
          <SelectValue placeholder='Select a Provider Rotation' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {providers && providers.length > 0 ? (
              providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.friendlyName || provider.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value='no_providers' disabled>
                No providers available
              </SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </SidebarGroup>
  );
}
