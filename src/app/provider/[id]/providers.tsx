'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import DynamicForm from '@/dynamic-form/DynamicForm';
import { DataTable } from '../../../components/wais/data/data-table';
import { DataTableColumnHeader } from '../../../components/wais/data/data-table-column-header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { LuPencil, LuCheck } from 'react-icons/lu';
import { useProviderInstance, useProviderInstances } from './useProviders';


function Providers() {
  const { toast } = useToast();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [providerInstanceSettings, setProviderInstanceSettings] = useState<any>(null);
  const [providerInstanceUsage, setProviderInstanceUsage] = useState<any>(null);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const {mutate} = useProviderInstances();
  const {data:providerInstance ,isLoading} = useProviderInstance(String(id));

  
  const settingsArray = providerInstanceSettings ? [providerInstanceSettings] : [];
  
  // DataTable columns for settings
  const settingsColumns = [
    {
      accessorKey: 'key',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Key" />,
      cell: ({ row }: any) => <span>{row.getValue('key')}</span>,
      meta: { headerName: 'Key' },
    },
    {
      accessorKey: 'value',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Value" />,
      cell: ({ row }: any) => {
        const rowId = row.original.id;
        if (editRowId === rowId) {
          return (
            <input
              className="border rounded px-2 py-1 w-24"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
            />
          );
        }
        return row.getValue('value');
      },
      meta: { headerName: 'Value' },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Updated At" />,
      cell: ({ row }: any) => <span>{new Date(row.getValue('updated_at')).toLocaleString()}</span>,
      meta: { headerName: 'Updated At' },
    },
    {
      id: 'actions',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title="Action" />,
      cell: ({ row }: any) => {
        const rowId = row.original.id;
        const prevVal = providerInstanceSettings.value;
        if (editRowId === rowId) {
          
          return (
            <Button
              variant="ghost"
              size="icon"
              title="Confirm"
              onClick={async () => {
                setProviderInstanceSettings((prev: any) => {
                  const updated = { ...prev };
                  updated.value = editValue;
                  return updated;
                });
                setEditRowId(null);
                try {
                  await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URI}/v1/provider-instance-setting/${rowId}`,
                    {
                      provider_instance_setting: {
                        provider_instance_id: providerInstance.provider_id,
                        key: providerInstanceSettings.key,
                        value: editValue,
                      },
                    },
                    {
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie('jwt')}`,
                      },
                    }
                  );
                  toast({
                    title: 'Success',
                    description: 'Setting updated successfully!',
                  });
                } catch (err) {
                  toast({
                    title: 'Error',
                    description: 'Failed to update setting',
                    variant: 'destructive',
                  });
                  setProviderInstanceSettings((prev: any) => {
                  const updated = { ...prev };
                  updated.value = prevVal;
                  return updated;
                });
                }
              }}
            >
              <LuCheck className="w-4 h-4 text-green-600" />
            </Button>
          );
        }
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditRowId(rowId);
              setEditValue(row.original.value);
            }}
            title="Edit"
          >
            <LuPencil className="w-4 h-4" />
          </Button>
        );
      },
      enableHiding: true,
      enableSorting: false,
      meta: { headerName: 'Actions' },
    },
  ];

  const usageColumns = [
    {
      accessorKey: 'input_tokens',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title='Input Tokens' />,
      cell: ({ row }: any) => <span>{row.getValue('input_tokens')}</span>,
      meta: { headerName: 'Input Tokens' },
    },
    {
      accessorKey: 'output_tokens',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title='Output Tokens' />,
      cell: ({ row }: any) => <span>{row.getValue('output_tokens')}</span>,
      meta: { headerName: 'Output Tokens' },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }: any) => <DataTableColumnHeader column={column} title='Updated At' />,
      cell: ({ row }: any) => <span>{new Date(row.getValue('updated_at')).toLocaleString()}</span>,
      meta: { headerName: 'Updated At' },
    },
  ];

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchAll = async () => {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getCookie('jwt')}`,
      };
      const settingPromise = axios.get(`${process.env.NEXT_PUBLIC_API_URI}/v1/provider-instance/${id}/setting`, { headers });
      const usagePromise = axios.get(`${process.env.NEXT_PUBLIC_API_URI}/v1/provider-instance/usage/${id}`, { headers });

      const [settingResult, usageResult] = await Promise.allSettled([
        settingPromise,
        usagePromise,
      ]);


      if (settingResult.status === 'fulfilled') {
        setProviderInstanceSettings(settingResult.value.data.provider_instance_setting);
      } else {
        setProviderInstanceSettings(null);
      }

      if (usageResult.status === 'fulfilled') {
        setProviderInstanceUsage(usageResult.value.data.provider_instance_usage);
      } else {
        setProviderInstanceUsage(null);
      }

      setLoading(false);
    };
    fetchAll();
  }, [id]);

  if (!id) {
    return <div className="flex items-center justify-center h-64 text-lg font-semibold">Please select a instance</div>;
  }

  if (loading || isLoading) {
    return <div className="flex items-center justify-center h-64 text-lg font-semibold">Loading...</div>;
  }

  if (!providerInstance) {
    return <div className="flex items-center justify-center h-64 text-lg font-semibold">No data found.</div>;
  }

  return (
    <div className="w-full px-2 md:px-8 py-6 space-y-8">
      {/* Instance Details Section */}
      <section className="border rounded-lg p-4 bg-white shadow w-full">
        <h2 className="text-lg font-bold mb-2">Provider Instance Details</h2>
        <div className="max-w-lg w-full">
          <DynamicForm
            fields={{
              name: {
                type: 'text',
                display: 'Name',
                validation: (value) => typeof value === 'string' && value.length > 0,
                value: providerInstance.name,
              },
              model_name: {
                type: 'text',
                display: 'Model Name',
                validation: (value) => typeof value === 'string' && value.length > 0,
                value: providerInstance.model_name,
              },
              api_key: {
                type: 'text',
                display: 'API Key',
                validation: (value) => typeof value === 'string' && value.length > 0,
                value: providerInstance.api_key,
              },
            }}
            toUpdate={providerInstance}
            submitButtonText="Update"
            onConfirm={async (formData) => {
              await axios.put(
                `${process.env.NEXT_PUBLIC_API_URI}/v1/provider/instance/${providerInstance.id}`,
                {
                  provider_instance: {
                    name: formData.name,
                    provider_id: providerInstance.provider_id,
                    model_name: formData.model_name,
                    api_key: formData.api_key,
                    enabled: formData.enabled,
                  },
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getCookie('jwt')}`,
                  },
                }
              );
              mutate();
            }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mt-4">
          {/* <div><span className="font-medium">Provider:</span> {providerInstance.provider?.name || ''}</div>
          <div><span className="font-medium">Team:</span> {providerInstance.team?.name || ''}</div> */}
          <div><span className="font-medium">Created At:</span> {new Date(providerInstance.created_at).toLocaleString()}</div>
          <div><span className="font-medium">Updated At:</span> {new Date(providerInstance.updated_at).toLocaleString()}</div>
          </div>
      </section>

      {/* Settings Section */}
      <section className="border rounded-lg p-4 bg-white shadow w-full">
        
        {(!settingsArray || settingsArray.length === 0 || !settingsArray[0]) ? (
          <>
            <h4 className="text-2xl font-bold mr-auto mb-2">Instance Settings</h4>
            <div className="flex items-center justify-center p-4 border rounded-md text-center">
              <span className="text-sm text-muted-foreground">No settings configured for this instance.</span>
            </div>
          </>
        ) : (
          <DataTable
            data={settingsArray}
            columns={settingsColumns}
            meta={{
              title: 'Instance Settings',
              hideSelectionCount: true,
              emptyMessage: 'No data',
            }}
          />
        )}
      </section>

      {/* Usage Section as Data Grid */}
      <section className="border rounded-lg p-4 bg-white shadow w-full">
       
        <DataTable
          data={Array.isArray(providerInstanceUsage) ? providerInstanceUsage : providerInstanceUsage ? [providerInstanceUsage] : []}
          meta={{ title: 'Instance Usage', hideSelectionCount: true, emptyMessage: 'No data' }}
          columns={usageColumns}
        />
      </section>
    </div>
  );
}

export default Providers;