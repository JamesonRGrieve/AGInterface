'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LuPencil, LuPlus, LuUsers, LuTrash2 } from 'react-icons/lu';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { useToast } from '@/hooks/useToast';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/src/hooks/useUser';
import { useProviderInstance, useProviderInstances } from './useProviders';
import { ArrowBigLeft } from 'lucide-react';


interface ProviderInstance {
  provider_id: string;
  team_id: string;
  user_id: string;
  name: string;
  updated_at: string;
  updated_by_user_id: string;
  id: string;
  created_at: string;
  created_by_user_id: string;
  model_name: string;
  api_key: string;
  enabled: boolean;
}

interface Provider {
  name: string;
  updated_at: string;
  updated_by_user_id: string;
  id: string;
  created_at: string;
  created_by_user_id: string;
  friendly_name: string;
  agent_settings_json: string;
}



export const ProviderSidebar = () => {
  const [selectedInstance, setSelectedInstance] = useState<ProviderInstance | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const {data:user} = useUser()
  const {data:providerInstances,mutate:mutateProviderInstances} = useProviderInstances()
  const {mutate:mutateInstance} = useProviderInstance(selectedInstance?.id);
  
  // Provider select state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  
  useEffect(()=>{
    if (providerInstances) {
      if (id) {
        const foundInstance = providerInstances.find((p) => p.id === id);
        setSelectedInstance(foundInstance || null);
      }
    }
  },[providerInstances,id])

  // Fetch providers for select list
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URI}/v1/provider`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('jwt')}`,
            },
          }
        );

        const data = response.data.providers as Provider[];
        
        setProviders(data || []);
        // Do not select any provider by default
        setSelectedProviderId(null);
      } catch (err) {
        setProviders([]);
      }
    };
    fetchProviders();
  }, []);

  function handleProviderChange(providerId: string | null) {
    setSelectedProviderId(providerId);
    const filtered =providerInstances!.filter(
      (instance:ProviderInstance) => instance.provider_id === providerId
    )
    if (filtered.length > 0) {
      setSelectedInstance(filtered[0]);
      router.push(`/provider/${filtered[0].id}`);
    } else {
      setSelectedInstance(null);
      router.push('/provider');
    }
  }

  // Handlers
  const handleSelectInstance = (id: string) => {
    const found = providerInstances!.find((p) => p.id === id);
    if (found){
      setSelectedInstance(found);
      router.push(`/provider/${found.id}`);
    };
  };

  const handleConfirmRename = async () => {
    if (!selectedInstance) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URI}/v1/provider/instance/${selectedInstance.id}`,
        {
          provider_instance: {
            name: newName,
            provider_id: selectedInstance.provider_id,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('jwt')}`,
          },
        }
      );
      // Use mutate to refresh provider instances from the API
      await mutateProviderInstances();
      mutateInstance();
      setSelectedInstance((prev) => (prev ? { ...prev, name: newName } : null));
      setIsRenameDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Provider instance renamed successfully!',
      });
    } catch (error: any) {
      setIsRenameDialogOpen(false);
      toast({
        title: 'Error',
        description: error?.response?.data?.detail?.message || 'Failed to rename provider instance',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmCreate = async () => {
    if (!newName || !newModelName || !newApiKey || !selectedProviderId) return;
    const teamId = getCookie('auth-team');
    if (!teamId) return;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URI}/v1/provider/instance`,
        {
          provider_instance: {
            name: newName,
            provider_id: selectedProviderId,
            model_name: newModelName,
            api_key: newApiKey,
            user_id: user?.id,
            team_id: teamId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('jwt')}`,
          },
        }
      );
      setIsCreateDialogOpen(false);
      // Use mutate to refresh provider instances from the API
      await mutateProviderInstances();
      
      const createdInstance = response.data.provider_instance;
      setSelectedInstance(createdInstance || null);
      setNewName('');
      setNewModelName('');
      setNewApiKey('');
      toast({
        title: 'Success',
        description: 'Provider instance created successfully!',
      });
      if (createdInstance) {
        router.push(`/provider/${createdInstance.id}`);
      }
    } catch (error) {
      setIsCreateDialogOpen(false);
      toast({
        title: 'Error',
        description: 'Failed to create provider instance',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInstance = async () => {
    if (!selectedInstance) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URI}/v1/provider/instance/${selectedInstance.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('jwt')}`,
          },
        }
      );
      setIsDeleteDialogOpen(false);
      // Use mutate to refresh provider instances from the API
      await mutateProviderInstances();
      
      const list = providerInstances!.filter((instance: ProviderInstance) => instance.provider_id === selectedProviderId && instance.id !== selectedInstance.id);
      if(list.length > 0) {
        setSelectedInstance(list[0]);
        router.push(`/provider/${list[0].id}`);
      }
      else{
        setSelectedInstance(null);
        //setSelectedProviderId(null);
        router.push(`/provider`);
      }
      
      toast({
        title: 'Success',
        description: 'Provider instance deleted successfully!',
      });
    } catch (error) {
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to delete provider instance',
        variant: 'destructive',
      });
    }
  };

  function handleCreateDialog(value:boolean){
    if (!selectedProviderId) {
      toast({
        title: 'Provider Required',
        description: 'Please select a provider to create an instance',
      });
    }
    else
    setIsCreateDialogOpen(value);
  }

  return (
    <SidebarContent title='Provider Instance Management'>
      {selectedInstance && (
        <SidebarGroup>
          <SidebarGroupLabel>{selectedInstance.name}</SidebarGroupLabel>
          <SidebarMenuButton className='group-data-[state=expanded]:hidden'>
            <ArrowBigLeft />
          </SidebarMenuButton>
          <div className='space-y-2 px-2 group-data-[collapsible=icon]:hidden'>
            <div className='text-sm text-muted-foreground'>
              <span className='font-medium'>Model:</span> {selectedInstance.model_name}
            </div>
            <div className='text-sm text-muted-foreground'>
              <span className='font-medium'>Enabled:</span> {selectedInstance.enabled ? 'Yes' : 'No'}
            </div>
            <div className='text-sm text-muted-foreground'>
              <span className='font-medium'>Created:</span> {new Date(selectedInstance.created_at).toLocaleString()}
            </div>
            <div className='text-sm text-muted-foreground'>
              <span className='font-medium'>Updated:</span> {new Date(selectedInstance.updated_at).toLocaleString()}
            </div>
          </div>
        </SidebarGroup>
      )}
      {/* Provider Select List */}
      <SidebarGroup>
        <SidebarGroupLabel>Select Provider</SidebarGroupLabel>
        <div className='w-full group-data-[collapsible=icon]:hidden'>
          <Select value={selectedProviderId ?? undefined} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue placeholder='Select a provider' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name || provider.friendly_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Select Provider Instance</SidebarGroupLabel>
        <div className='w-full group-data-[collapsible=icon]:hidden'>
          <Select
            value={selectedInstance?.id}
            onValueChange={handleSelectInstance}
            disabled={
              (selectedProviderId
                ? providerInstances!.filter((instance: ProviderInstance) => instance.provider_id === selectedProviderId).length === 0
                : providerInstances!.length === 0)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a Provider Instance' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(selectedProviderId ? providerInstances!
                  .filter((instance: ProviderInstance) => instance.provider_id === selectedProviderId)
                : providerInstances!).map((instance: ProviderInstance) => (
                    <SelectItem key={instance.id} value={instance.id}>
                      {instance.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <SidebarGroupLabel>Instance Actions</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setNewName(selectedInstance.name);
                setIsRenameDialogOpen(true);
              }}
              tooltip='Rename Instance'
            >
              <LuPencil className='w-4 h-4' />
              <span>Rename Instance</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setNewName('');
                setNewModelName('');
                setNewApiKey('');
                handleCreateDialog(true);
              }}
              tooltip='Create Instance'
            >
              <LuPlus className='w-4 h-4' />
              <span>Create Instance</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={selectedInstance ? () => setIsDeleteDialogOpen(true) : undefined} tooltip='Delete Instance'>
              <LuTrash2 className='w-4 h-4 text-red-500' />
              <span className='text-red-500'>Delete Instance</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Provider Instance</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='Enter new name' />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Provider Instance</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='Enter instance name' />
            <Input value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder='Enter model name' />
            <Input value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} placeholder='Enter API key' />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider Instance</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <p>Are you sure you want to delete this provider instance?</p>
            <div className='font-bold'>{selectedInstance?.name}</div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteInstance}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarContent>
  );
};

export default ProviderSidebar;
