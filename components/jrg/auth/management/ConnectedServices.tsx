'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import { LuPlus as Plus, LuUnlink as Unlink } from 'react-icons/lu';
import OAuth2Login from 'react-simple-oauth2-login';
import oAuth2Providers from '../oauth2/OAuthProviders';

interface ConnectedService {
  provider: string;
  connected: boolean;
}

const providerDescriptions = {
  Google:
    'Connect your Google account to enable AI interactions with Gmail and Google Calendar. This allows agents to read and send emails, manage your calendar events, and help organize your digital life.',
  Microsoft:
    'Link your Microsoft account to enable AI management of Outlook emails and calendar. Your agents can help schedule meetings, respond to emails, and keep your calendar organized.',
  GitHub:
    'Connect to GitHub to enable AI assistance with repository management. Agents can help analyze codebases, create pull requests, review code changes, and manage issues.',
  Tesla:
    'Link your Tesla account to enable AI control of your vehicle. Agents can help manage charging, climate control, and other vehicle settings.',
};

export const ConnectedServices = () => {
  const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnectDialog, setDisconnectDialog] = useState<{
    isOpen: boolean;
    provider: string | null;
  }>({
    isOpen: false,
    provider: null,
  });

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URI}/v1/oauth2`, {
        headers: {
          Authorization: getCookie('jwt'),
        },
      });

      const allServices = Object.keys(oAuth2Providers)
        .filter((key) => oAuth2Providers[key].client_id)
        .map((key) => ({
          provider: key,
          connected: response.data.includes(key.toLowerCase()),
        }));

      setConnectedServices(allServices);
      setError(null);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to fetch connected services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleDisconnect = async (provider: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URI}/v1/oauth2/${provider.toLowerCase()}`, {
        headers: {
          Authorization: getCookie('jwt'),
        },
      });
      await fetchConnections();
      setDisconnectDialog({ isOpen: false, provider: null });
    } catch (err) {
      console.error('Error disconnecting service:', err);
      setError('Failed to disconnect service');
    }
  };

  const onSuccess = async (response: any) => {
    const provider = disconnectDialog.provider?.toLowerCase() || '';
    try {
      const jwt = getCookie('jwt');
      console.log('Full OAuth response:', response); // See everything in the response
      console.log('Code from response:', response.code);
      console.log('Provider:', provider);

      if (!response.code) {
        console.error('No code received in OAuth response');
        await fetchConnections();
        return;
      }

      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URI}/v1/oauth2/${provider}`,
        {
          code: response.code,
          referrer: `${process.env.NEXT_PUBLIC_AUTH_URI}/close/${provider}`,
        },
        {
          headers: {
            Authorization: jwt,
          },
        },
      );
      console.log('OAuth API response:', result);
      await fetchConnections();
    } catch (err: any) {
      await fetchConnections();
      console.error('OAuth error:', err);
      if (err.config) {
        console.log('Failed request details:', {
          url: err.config.url,
          method: err.config.method,
          headers: err.config.headers,
          data: err.config.data,
        });
      }
    }
  };

  return (
    <>
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='grid gap-4'>
        {connectedServices.map((service) => {
          const provider = oAuth2Providers[service.provider];
          return (
            <div key={service.provider} className='flex flex-col space-y-4 p-4 border rounded-lg'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  {provider.icon}
                  <div>
                    <p className='font-medium'>{service.provider}</p>
                    <p className='text-sm text-muted-foreground'>{service.connected ? 'Connected' : 'Not connected'}</p>
                  </div>
                </div>

                {service.connected ? (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setDisconnectDialog({
                        isOpen: true,
                        provider: service.provider,
                      })
                    }
                    className='space-x-1'
                  >
                    <Unlink className='w-4 h-4 mr-2' />
                    Disconnect
                  </Button>
                ) : (
                  <OAuth2Login
                    authorizationUrl={provider.uri}
                    responseType='code'
                    clientId={provider.client_id}
                    state={getCookie('jwt')}
                    redirectUri={`${process.env.NEXT_PUBLIC_AUTH_URI}/close/${service.provider.toLowerCase()}`}
                    scope={provider.scope}
                    onSuccess={onSuccess}
                    onFailure={onSuccess}
                    isCrossOrigin
                    render={(renderProps) => (
                      <Button variant='outline' onClick={renderProps.onClick} className='space-x-1'>
                        <Plus className='w-4 h-4 mr-2' />
                        Connect
                      </Button>
                    )}
                  />
                )}
              </div>
              <p className='text-sm text-muted-foreground'>
                {providerDescriptions[service.provider] || 'Connect this service to enable AI integration.'}
              </p>
            </div>
          );
        })}
      </div>

      <Dialog
        open={disconnectDialog.isOpen}
        onOpenChange={(open) => setDisconnectDialog({ isOpen: open, provider: open ? disconnectDialog.provider : null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect {disconnectDialog.provider}</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your {disconnectDialog.provider} account? Your agents will no longer be
              able to interact with {disconnectDialog.provider} services.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDisconnectDialog({ isOpen: false, provider: null })}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => disconnectDialog.provider && handleDisconnect(disconnectDialog.provider)}
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
