'use client';
import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { AddResident } from '../admin/dialogs/add-resident-dialog';
import { BatchUpload } from '../admin/dialogs/batch-upload-dialog';
import { DataTableFilter } from './data-table-filter';
import { DataTableViewOptions } from './data-table-view-options';
import usePathname from '@/hooks/usePathname';
import { Button } from '@/components/ui/button';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const pathname = usePathname();
  return (
    <div className='flex items-center justify-end gap-2 flex-wrap'>
      {pathname.includes('resident') && (
        <>
          <AddResident />
          <BatchUpload />
        </>
      )}

      {isFiltered && (
        <Button variant='ghost' onClick={() => table.resetColumnFilters()} className='h-8 px-2 lg:px-3'>
          Reset
          <X />
        </Button>
      )}
      <DataTableFilter table={table} />
      <DataTableViewOptions table={table} />
    </div>
  );
}
