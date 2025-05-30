import { Column } from '@tanstack/react-table';
import {
  LuArrowDown as ArrowDown,
  LuArrowUp as ArrowUp,
  LuChevronsUpDown as ChevronsUpDown,
  LuEyeOff as EyeOff,
} from 'react-icons/lu';

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
        <span className='font-semibold text-foreground'>{title}</span>
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
            <DropdownMenuItem onClick={() => column.toggleSorting(false)} key='table-asc'>
              <ArrowUp className='h-3.5 w-3.5 mr-2 text-muted-foreground' />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)} key='table-desc'>
              <ArrowDown className='h-3.5 w-3.5 mr-2 text-muted-foreground' />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator key='table-sep-1' />
            <DropdownMenuItem onClick={() => column.clearSorting()} key='table-clear'>
              <ChevronsUpDown className='w-4 h-4 mr-2 text-muted-foreground' />
              Clear Sorting
            </DropdownMenuItem>
            <DropdownMenuSeparator key='table-sep-2' />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)} key='table-hide'>
              <EyeOff className='h-3.5 w-3.5 mr-2 text-muted-foreground' />
              Hide
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
