'use client';

import { ColumnDef } from '@tanstack/react-table';
import { LuCopy as Copy } from 'react-icons/lu';
import { DataTableColumnHeader } from './data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ColumnData {
  field: string;
  headerName: string;
}

export function createColumns<TData, TValue>(columns: ColumnData[]): ColumnDef<TData, TValue>[] {
  const selectColumn: ColumnDef<TData> = {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={!!(table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'))}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const actionsColumn: ColumnDef<TData> = {
    id: 'actions',
    enableHiding: false,
    enableSorting: false,
    header: () => <span className='sr-only'>Actions</span>,
    cell: ({ row }) => {
      const data = row.original;
      const copyData = () => {
        navigator.clipboard.writeText(Object.values(data as Record<string, unknown>).join(', '));
      };

      return (
        <TooltipProvider>
          <div className='flex justify-end gap-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='outline' size='icon' className='w-8 h-8 bg-transparent' onClick={copyData}>
                  <Copy className='w-3 h-3' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Data</p>
              </TooltipContent>
            </Tooltip>
            {/* <Tooltip title='View Details'>
              <Button variant='outline' size='icon' className='w-8 h-8 bg-transparent'>
                <SquareArrowOutUpRight className='w-3 h-3' />
              </Button>
            </Tooltip> */}
          </div>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='w-8 h-8 p-0 border md:hidden'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(row.original))}>
                Copy Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </TooltipProvider>
      );
    },
  };

  const dynamicColumns: ColumnDef<TData>[] = columns.map((col) => ({
    id: col.field,
    accessorKey: col.field,
    header: ({ column }) => <DataTableColumnHeader column={column} title={col.headerName} />,
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    cell: (info) => info.getValue(),
    meta: col,
  }));

  return [selectColumn, ...dynamicColumns, actionsColumn];
}
