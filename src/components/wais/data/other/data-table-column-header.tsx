import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className='flex items-center gap-2'>
      <div>
        <span>{title}</span>
      </div>
      <div className={cn('flex items-center space-x-2', className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 data-[state=open]:bg-accent'>
              {column.getIsSorted() === 'desc' ? (
                <ArrowDown className='w-5 h-5' />
              ) : column.getIsSorted() === 'asc' ? (
                <ArrowUp className='w-5 h-5' />
              ) : (
                <ChevronsUpDown className='w-5 h-5' />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start'>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUp className='h-3.5 w-3.5 mr-2 text-muted-foreground/70' />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDown className='h-3.5 w-3.5 mr-2 text-muted-foreground/70' />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.clearSorting()}>
              <ChevronsUpDown className='w-4 h-4 mr-2 text-muted-foreground/70' />
              Clear Sorting
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className='h-3.5 w-3.5 mr-2 text-muted-foreground/70' />
              Hide
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
