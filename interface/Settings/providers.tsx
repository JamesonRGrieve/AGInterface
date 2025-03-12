'use client';

import { useTeam } from '@/auth/hooks/useTeam';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MarkdownBlock from '@/interactive/Chat/Message/MarkdownBlock';
import { useInteractiveConfig } from '@/interactive/InteractiveConfigContext';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { Plus, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LuUnlink as Unlink } from 'react-icons/lu';
import { useAgent } from '../hooks/useAgent';
import { useProviders } from '../hooks/useProvider';

// Types remain the same
type Command = {
  friendly_name: string;
  description: string;
  command_name: string;
  command_args: Record<string, string>;
  enabled?: boolean;
  extension_name?: string;
};

type Extension = {
  extension_name: string;
  description: string;
  settings: string[];
  commands: Command[];
};

type ErrorState = {
  type: 'success' | 'error';
  message: string;
} | null;

interface ExtensionSettings {
  agent_name: string;
  settings: Record<string, string>;
}

export function Providers() {
  const { agent } = useInteractiveConfig();
  const { data: agentData, mutate } = useAgent(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [error, setError] = useState<ErrorState>(null);
  const agent_name = (getCookie('aginteractive-agent') || process.env.NEXT_PUBLIC_AGINTERACTIVE_AGENT) ?? agent;
  const { data: activeCompany } = useTeam();
  const { data: providerData } = useProviders();

  console.log('ACTIVE COMPANY', activeCompany);

  // Filter connected providers
  const providers = useMemo(() => {
    console.log('Starting categorization...');
    console.log('Agent settings length:', agentData?.settings?.length);
    console.log('Provider data length:', providerData?.length);
    console.log('AGENT DATA', agentData);
    console.log('PROVIDER DATA', providerData);
    // Return empty arrays if no data
    if (!agentData?.settings || !providerData?.length) {
      return {
        connected: [],
        available: [],
      };
    }

    const connected = providerData.filter((provider) => {
      console.log(`\nChecking provider: ${provider.name}`);
      // Skip providers without settings
      if (!provider.settings?.length) return false;

      // Find sensitive settings that exist in both provider and agent settings
      const relevantSettings = provider.settings.filter((setting) => {
        const isSensitive = ['KEY', 'SECRET', 'PASSWORD'].some((keyword) => setting.name.includes(keyword));

        // Only include if it exists in agent settings
        return isSensitive && agentData.settings.some((s) => s.name === setting.name);
      });

      // If no relevant settings found, provider is not connected
      if (relevantSettings.length === 0) return false;

      // Check if ALL relevant settings are HIDDEN
      return relevantSettings.every((setting) => {
        const agentSetting = agentData.settings.find((s) => s.name === setting.name);
        return agentSetting && agentSetting.value === 'HIDDEN';
      });
    });

    return {
      connected,
      available: providerData.filter((provider) => !connected.includes(provider)),
    };
  }, [agentData, providerData]);

  const handleSaveSettings = async (extensionName: string, settings: Record<string, string>) => {
    try {
      setError(null);
      const response = await axios.put<{ status: number; data: any }>(
        `${process.env.NEXT_PUBLIC_API_URI}/api/agent/${agent_name}`,
        {
          agent_name: agent_name,
          settings: settings,
        } as ExtensionSettings,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: getCookie('jwt'),
          },
        },
      );

      if (response.status === 200) {
        setError({
          type: 'success',
          message: 'Extension connected successfully!',
        });
        window.location.reload();
      }
    } catch (error: any) {
      setError({
        type: 'error',
        message: error.response?.data?.detail || error.message || 'Failed to connect extension',
      });
    }
    mutate();
  };

  const handleDisconnect = async (name: string) => {
    const extension = providerData?.find((ext) => ext.name === name);
    console.log('DELETION', extension);
    const emptySettings = extension.settings
      .filter((setting) => {
        return ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'].some((keyword) =>
          setting.name.replaceAll('TOKENS', '').includes(keyword),
        );
      })
      .reduce((acc, setting) => {
        console.log('DELETION PROCESSING SETTING', setting);
        return { ...acc, [setting.name]: '' };
      }, {});
    console.log('SETTING DELETION', emptySettings);
    await handleSaveSettings(extension.name, emptySettings);
  };

  console.log('PROVIDERS', providerData);

  console.log(providers);
  return (
    <div className='space-y-6'>
      <div className='grid gap-4'>
        {providers.connected?.map &&
          providers.connected.map((provider) => (
            <div
              key={provider.name}
              className='flex flex-col gap-4 p-4 transition-colors border rounded-lg bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60'
            >
              <div className='flex items-center gap-4'>
                <div className='flex items-center flex-1 min-w-0 gap-3.5'>
                  <Wrench className='shrink-0 w-5 h-5 text-muted-foreground' />
                  <div>
                    <h4 className='font-medium truncate'>{provider.name}</h4>
                    <p className='text-sm text-muted-foreground'>Connected</p>
                  </div>
                </div>
                <Button variant='outline' size='sm' className='gap-2' onClick={() => handleDisconnect(provider.name)}>
                  <Unlink className='w-4 h-4' />
                  Disconnect
                </Button>
              </div>
              <div className='text-sm text-muted-foreground'>
                <MarkdownBlock content={provider.description} />
              </div>
            </div>
          ))}

        {providers.available?.map &&
          providers.available.map((provider) => (
            <div
              key={provider.name}
              className='flex flex-col gap-4 p-4 transition-colors border rounded-lg bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60'
            >
              <div className='flex items-center gap-4'>
                <div className='flex items-center flex-1 min-w-0 gap-3.5'>
                  <Wrench className='shrink-0 w-5 h-5 text-muted-foreground' />
                  <div>
                    <h4 className='font-medium truncate'>{provider.friendlyName}</h4>
                    <p className='text-sm text-muted-foreground'>Not Connected</p>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      className='gap-2'
                      onClick={() => {
                        // Initialize settings with the default values from provider.settings
                        setSettings(
                          provider.settings.reduce((acc, setting) => {
                            acc[setting.name] = setting.value;
                            return acc;
                          }, {}),
                        );
                      }}
                    >
                      <Plus className='w-4 h-4' />
                      Connect
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                      <DialogTitle>Configure {provider.name}</DialogTitle>
                      <DialogDescription>
                        Enter the required credentials to enable this service. {provider.description}
                      </DialogDescription>
                    </DialogHeader>

                    <div className='grid gap-4 py-4'>
                      {provider.settings.map((prov) => (
                        <div key={prov.name} className='grid gap-2'>
                          <Label htmlFor={prov.name}>{prov.name}</Label>
                          <Input
                            id={prov.name}
                            type={
                              prov.name.toLowerCase().includes('key') || prov.name.toLowerCase().includes('password')
                                ? 'password'
                                : 'text'
                            }
                            defaultValue={prov.value}
                            value={settings[prov.name]}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                [prov.name]: e.target.value,
                              }))
                            }
                            placeholder={`Enter ${prov.name.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>

                    <DialogFooter>
                      <Button onClick={() => handleSaveSettings(provider.name, settings)}>Connect Provider</Button>
                    </DialogFooter>

                    {error && (
                      <Alert variant={error.type === 'success' ? 'default' : 'destructive'}>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              <div className='text-sm text-muted-foreground'>
                <MarkdownBlock content={provider.description || 'No description available'} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Providers;
