'use client';

import { Table } from '@tanstack/react-table';
import { LuX as X } from 'react-icons/lu';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableFilter } from './data-table-filter';
import { DataTableExport } from './data-table-export';
import { Button } from '@/components/ui/button';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className='flex items-center justify-end gap-2'>
      {isFiltered && (
        <Button variant='ghost' onClick={() => table.resetColumnFilters()} size='sm' className='h-8 px-2'>
          Reset
          <X className='w-4 h-4' />
        </Button>
      )}
      <DataTableFilter table={table} />
      <DataTableViewOptions table={table} />
      <DataTableExport table={table} />
    </div>
  );
}
