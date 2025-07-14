import MarkdownBlock from '@/components/markdown/MarkdownBlock';
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
import { getCookie, setCookie } from 'cookies-next';
import { Plus, Power, PowerOff, Unlink, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

const OVERRIDE_EXTENSIONS = {
  'text-to-speech': { name: 'tts', label: 'Text to Speech' },
  'web-search': { name: 'websearch', label: 'Web Search' },
  'image-generation': { name: 'create-image', label: 'Image Generation' },
  analysis: { name: 'analyze-user-input', label: 'File Analysis' },
};

export default function Extension({
  extension,
  connected,
  onDisconnect,
  onConnect,
  settings = {},
  setSettings,
  error,
  setSelectedExtension = () => {},
}) {
  const [state, setState] = useState(false);

  useEffect(() => {
    setState(
      Object.keys(OVERRIDE_EXTENSIONS).includes(extension.extension_name)
        ? getCookie(`aginteractive-${OVERRIDE_EXTENSIONS[extension.extension_name].name}`) === 'true'
        : false,
    );
  }, [extension.extension_name]);
  return (
    <div className='flex flex-col gap-2 p-3 transition-colors border rounded-lg bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center flex-1 min-w-0 gap-3.5'>
          <Wrench className='shrink-0 w-5 h-5 text-muted-foreground' />
          <div>
            <h4 className='font-medium truncate'>{extension.friendly_name || extension.extension_name}</h4>
            <p className='text-sm text-muted-foreground'>
              {Object.keys(OVERRIDE_EXTENSIONS).includes(extension.extension_name)
                ? state
                  ? 'Enabled'
                  : 'Disabled'
                : connected
                  ? 'Connected'
                  : 'Not Connected'}
            </p>
          </div>
        </div>

        {Object.keys(OVERRIDE_EXTENSIONS).includes(extension.extension_name) ? (
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={() => {
              setCookie(`aginteractive-${OVERRIDE_EXTENSIONS[extension.extension_name].name}`, (!state).toString(), {
                domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                maxAge: 2147483647,
                path: '/',
              });
              setState(!state);
            }}
          >
            {state ? <PowerOff className='w-4 h-4' /> : <Power className='w-4 h-4' />}
            {state ? 'Disable' : 'Enable'}
          </Button>
        ) : connected ? (
          <Button variant='outline' size='sm' className='gap-2' onClick={() => onDisconnect(extension)}>
            <Unlink className='w-4 h-4' />
            Disconnect
          </Button>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={() => {
                  setSelectedExtension(extension.extension_name);
                  setSettings(extension.settings.reduce((acc, setting) => ({ ...acc, [setting]: '' }), {}));
                }}
              >
                <Plus className='w-4 h-4' />
                Connect
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Configure {extension.friendly_name || extension.extension_name}</DialogTitle>
                <DialogDescription>Enter the required credentials to enable this service.</DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 py-4'>
                {extension.settings.map((setting) => (
                  <div key={setting} className='grid gap-2'>
                    <Label htmlFor={setting}>{setting}</Label>
                    <Input
                      id={setting}
                      type={
                        setting.toLowerCase().includes('key') || setting.toLowerCase().includes('password')
                          ? 'password'
                          : 'text'
                      }
                      value={settings[setting] || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          [setting]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${setting.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button onClick={() => onConnect(extension.extension_name, settings)}>Connect Extension</Button>
              </DialogFooter>

              {error && (
                <Alert variant={error.type === 'success' ? 'default' : 'destructive'}>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className='text-sm text-muted-foreground'>
        <MarkdownBlock content={extension.description || 'No description available'} />
      </div>
    </div>
  );
}
