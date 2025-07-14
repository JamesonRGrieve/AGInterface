'use client';

import { ConnectedServices } from '@/auth/management/ConnectedServices';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProviders } from '@/hooks/useProvider';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Extension from './extension';

import { useTeam } from '@/auth/hooks/useTeam';
import MarkdownBlock from '@/components/markdown/MarkdownBlock';
import { Input } from '@/components/ui/input';

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

export function Extensions() {
  const pathname = usePathname();
  const { data: agentData, mutate: mutateAgent } = null;
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [error, setError] = useState<ErrorState>(null);
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);
  const agent_name = (getCookie('aginteractive-agent') || process.env.NEXT_PUBLIC_AGINTERACTIVE_AGENT) ?? agent;
  const { data: activeCompany, mutate: mutateCompany } = useTeam();

  const { data: providerData } = useProviders();
  const searchParams = useSearchParams();
  // Filter extensions for the enabled commands view
  const extensions = searchParams.get('mode') === 'company' ? activeCompany?.extensions || [] : agentData?.extensions || [];
  const extensionsWithCommands = extensions.filter((ext) => ext.commands?.length > 0);
  const allEnabledCommands = extensions.flatMap((ext) =>
    ext.commands.filter((cmd) => cmd.enabled).map((cmd) => ({ ...cmd, extension_name: ext.extension_name })),
  );
  // Categorize extensions for the available tab
  const categorizeExtensions = (exts: Extension[]) => {
    return {
      // Connected extensions are those with settings and at least one command
      connectedExtensions: filterExtensions(
        exts.filter((ext) => ext.settings?.length > 0 && ext.commands?.length > 0),
        searchText,
      ),
      // Available extensions are those with settings that aren't connected yet
      availableExtensions: filterExtensions(
        exts.filter((ext) => ext.settings?.length > 0 && !ext.commands?.length),
        searchText,
      ),
    };
  };
  // Categorize extensions for the available tab
  const categorizeProviders = (providers: any[]) => {
    const connected = providers.filter(
      (provider) =>
        provider.settings &&
        Object.entries(provider.settings).every(
          ([key, defaultValue]) =>
            !['KEY', 'SECRET', 'PASSWORD', 'TOKEN'].some((this_key) => key.endsWith(this_key)) ||
            (['KEY', 'SECRET', 'PASSWORD', 'TOKEN'].some((this_key) => key.endsWith(this_key)) &&
              agentData?.settings[key] &&
              agentData?.settings[key] === 'HIDDEN'),
        ),
    );
    return agentData && agentData.settings
      ? {
          // Connected providers have all their settings fields present with non-default values
          connectedProviders: connected,
          // Available providers are those that have settings but at least one field is missing or has default value
          availableProviders: providers.filter((provider) => !connected.includes(provider)),
        }
      : {
          connectedProviders: [],
          availableProviders: [],
        };
  };

  const handleToggleCommand = async (commandName: string, enabled: boolean) => {
    try {
      const result = await axios.patch(
        searchParams.get('mode') === 'company'
          ? `${process.env.NEXT_PUBLIC_API_URI}/v1/companies/${activeCompany?.id}/command`
          : `${process.env.NEXT_PUBLIC_API_URI}/api/agent/${agent_name}/command`,

        {
          command_name: commandName,
          enable: enabled,
        },
        {
          headers: {
            Authorization: getCookie('jwt'),
          },
        },
      );

      if (result.status === 200) {
        if (searchParams.get('mode') === 'company') {
          mutateCompany();
        } else {
          mutateAgent();
        }
      }
    } catch (error) {
      console.error('Failed to toggle command:', error);
      setError({
        type: 'error',
        message: 'Failed to toggle command. Please try again.',
      });
    }
  };

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
  };

  const handleDisconnect = async (extension: Extension) => {
    const emptySettings = extension.settings.reduce((acc, setting) => ({ ...acc, [setting]: '' }), {});
    await handleSaveSettings(extension.extension_name, emptySettings);
  };

  function filterExtensions(extensions, text) {
    return text
      ? extensions
      : extensions.filter(
          (ext) =>
            ext.extension_name.toLowerCase().includes(text.toLowerCase()) ||
            ext.description.toLowerCase().includes(text.toLowerCase()),
        );
  }
  const filterCommands = useCallback(
    (commands) => {
      return searchText
        ? commands
        : commands.filter(
            (cmd) =>
              cmd.friendly_name.toLowerCase().includes(searchText.toLowerCase()) ||
              cmd.description.toLowerCase().includes(searchText.toLowerCase()),
          );
    },
    [searchText],
  );
  useEffect(() => {
    if (!searchParams.get('tab')) {
      router.push(`${pathname}?tab=extensions`);
    }
  }, [searchParams]);
  const { connectedExtensions, availableExtensions } = categorizeExtensions(extensions);
  const { connectedProviders, availableProviders } = categorizeProviders(Object.values(providerData));
  return (
    <div className='space-y-6'>
      <Tabs defaultValue={searchParams.get('tab') || 'extensions'} className='space-y-4'>
        <div className='flex items-center gap-2'>
          <TabsList>
            <TabsTrigger value='extensions' onClick={() => router.push(`${pathname}?tab=extensions`)}>
              Extensions
            </TabsTrigger>
            <TabsTrigger value='abilities' onClick={() => router.push(`${pathname}?tab=abilities`)}>
              Abilities
            </TabsTrigger>
          </TabsList>
          {/* {activeCompany?.my_role >= 2 && (
            <>
              <Switch
                id='company-mode'
                checked={searchParams.get('mode') === 'company'}
                onCheckedChange={(checked) => {
                  const params = new URLSearchParams(searchParams);
                  if (checked) {
                    params.set('mode', 'company');
                  } else {
                    params.delete('mode');
                  }
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
              <Label htmlFor='company-mode'>Company Mode</Label>
            </>
          )} */}
        </div>
        <TabsContent value='abilities' className='space-y-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium'>Enabled Abilities</h3>
            <div className='flex items-center gap-2'>
              <Label htmlFor='show-enabled-only'>Show Enabled Only</Label>
              <Switch id='show-enabled-only' checked={showEnabledOnly} onCheckedChange={setShowEnabledOnly} />
            </div>
          </div>

          {extensionsWithCommands.length === 0 ? (
            <Alert>
              <AlertDescription>
                No extensions are currently enabled. Enable extensions to see their abilities here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className='grid gap-4'>
              <Input placeholder='Search...' value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              {extensionsWithCommands
                .sort((a, b) => a.extension_name.localeCompare(b.extension_name))
                .map((extension) => (
                  <Card key={extension.extension_name}>
                    <CardHeader>
                      <CardTitle>{extension.extension_name}</CardTitle>
                      <CardDescription>
                        <MarkdownBlock content={extension.description || 'No description available'} />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {extension.commands
                        .filter((command) =>
                          [command.command_name, command.extension_name, command.friendly_name, command.description].some(
                            (value) => value?.toLowerCase().includes(searchText.toLowerCase()),
                          ),
                        )
                        .filter((command) => !showEnabledOnly || command.enabled)
                        .map((command) => (
                          <Card key={command.command_name} className='p-4 border border-border/50'>
                            <div className='flex items-center mb-2'>
                              <Switch
                                checked={command.enabled}
                                onCheckedChange={(checked) => handleToggleCommand(command.friendly_name, checked)}
                              />
                              <h4 className='text-lg font-medium'>&nbsp;&nbsp;{command.friendly_name}</h4>
                            </div>
                            <MarkdownBlock content={command.description?.split('\nArgs')[0] || 'No description available'} />
                          </Card>
                        ))}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='extensions' className='space-y-4'>
          <div className='grid gap-4'>
            <p className='text-sm text-muted-foreground'>
              Manage your connected third-party extensions that grant your agent additional capabilities through abilities.
            </p>
            {searchParams.get('mode') !== 'company' &&
              [
                {
                  extension_name: 'text-to-speech',
                  friendly_name: 'Text to Speech',
                  description: 'Convert text responses to spoken audio output.',
                  settings: [],
                },
                {
                  extension_name: 'web-search',
                  friendly_name: 'Web Search',
                  description: 'Search and reference current web content.',
                  settings: [],
                },
                {
                  extension_name: 'image-generation',
                  friendly_name: 'Image Generation',
                  description: 'Create AI-generated images from text descriptions.',
                  settings: [],
                },
                {
                  extension_name: 'analysis',
                  friendly_name: 'File Analysis',
                  description: 'Analyze uploaded files and documents for insights.',
                  settings: [],
                },
              ].map((ext) => (
                <Extension
                  key={ext.extension_name}
                  extension={ext}
                  connected={false}
                  onConnect={() => {}}
                  onDisconnect={() => {}}
                  settings={{}}
                  setSettings={() => {}}
                  error={null}
                  setSelectedExtension={() => {}}
                />
              ))}
            {searchParams.get('mode') !== 'company' && <ConnectedServices />}
            {connectedExtensions.map((extension) => (
              <Extension
                key={extension.extension_name}
                extension={extension}
                connected
                onDisconnect={handleDisconnect}
                settings={settings}
                onConnect={handleSaveSettings}
                setSettings={setSettings}
                error={error}
              />
            ))}

            {availableExtensions.map((extension) => (
              <Extension
                key={extension.extension_name}
                extension={extension}
                onDisconnect={handleDisconnect}
                connected={false}
                onConnect={handleSaveSettings}
                settings={settings}
                setSettings={setSettings}
                error={error}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Extensions;
