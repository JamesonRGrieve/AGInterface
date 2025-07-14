'use client';

import { LuDownload as Download } from 'react-icons/lu';
import { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DataTableExport<TData>({ table }: { table: Table<TData> }) {
  const rows = table.getFilteredRowModel().rows.map((row) => row.original);
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())
    // @ts-expect-error TODO: Replace parseMarkdownTable helper to use Tanstack Table
    .map((column) => column.columnDef.meta?.headerName);

  const downloadCSV = () => {
    const csvRows = [['id', ...columns], ...rows.map((row) => [...Object.values(row as Record<string, unknown>)])]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const downloadPDF = () => {};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='rounded-lg'>
          <Download className='w-4 h-4 mr-2' />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Export As</DropdownMenuLabel>
        <DropdownMenuItem onClick={downloadCSV}>CSV (.csv)</DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() =>}>PDF (.pdf)</DropdownMenuItem> */}
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem onClick={() => {}}>Print</DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
