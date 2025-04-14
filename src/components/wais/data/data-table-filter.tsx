'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Filter {
  column: string;
  value: string;
}

export function DataTableFilter<TData>({ table }: { table: Table<TData> }) {
  const columns = table.getAllColumns().filter((col) => col.getCanFilter());
  const [filter, setFilter] = useState<Filter>({
    column: '',
    value: '',
  });

  const updateFilter = (key: keyof Filter, value: string) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilter = () => {
    if (filter.column) {
      table.getColumn(filter.column)?.setFilterValue(filter.value);
    }
  };

  const resetFilter = () => {
    setFilter({
      column: '',
      value: '',
    });
    table.resetColumnFilters();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='rounded-lg'>
          <Filter className='w-4 h-4 mr-2' />
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Filter Table</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid items-center grid-cols-4 gap-4'>
            <Label htmlFor='column' className='text-right'>
              Column
            </Label>
            <Select onValueChange={(value) => updateFilter('column', value)} value={filter.column}>
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Select Column' />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {/* @ts-expect-error TODO: Figure out better solution */}
                    {column.columnDef.meta?.headerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid items-center grid-cols-4 gap-4'>
            <Label htmlFor='value' className='text-right'>
              Value
            </Label>
            <Input
              type='text'
              value={filter.value}
              onChange={(e) => updateFilter('value', e.target.value)}
              placeholder='Enter filter value'
              className='col-span-3'
            />
          </div>
        </div>
        <DialogFooter className='flex justify-end mt-4 space-x-4'>
          <Button variant='destructive' size='sm' onClick={resetFilter}>
            Reset Filter
          </Button>
          <Button onClick={applyFilter} variant='default' size='sm'>
            Apply Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
