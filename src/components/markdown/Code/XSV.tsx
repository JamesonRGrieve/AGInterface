'use client';

import { ReactNode, useContext, useEffect, useState } from 'react';
import { LuLightbulb as LightBulbIcon } from 'react-icons/lu';
import { InteractiveConfigContext } from '../../@/interactiveConfigContext';

interface Column {
  field: string;
  width: number;
  flex: number;
  headerName: string;
}

interface Row {
  id: string | number;
  [key: string]: string | number;
}

export const RendererXSV = ({
  xsvData,
  separator = ',',
  setLoading,
}: {
  xsvData: string[];
  separator?: RegExp | string;
  setLoading?: (loading: boolean) => void;
}): ReactNode => {
  const [open, setOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('Surprise me!');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [filteredColumns, setFilteredColumns] = useState<Column[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const context = useContext(InteractiveConfigContext);

  useEffect(() => {
    if (!xsvData) {
      setError('No data provided.');
    } else {
      const rawData = xsvData.map((row) =>
        row
          .split(separator)
          .map((cell) => cell.trim().replaceAll('"', ''))
          .filter((cell) => cell),
      );

      if (
        !rawData.every((row) => row.length === rawData[0].length) ||
        !rawData[0] ||
        rawData.some((row) => [0, 1].includes(row.length))
      ) {
        setError('XSV data is not valid.');
      } else {
        setError('');

        setColumns(
          (rawData[0][0].toLowerCase().includes('id') ? rawData[0].slice(1) : rawData[0]).map((header) => ({
            field: header,
            width: Math.max(160, header.length * 10),
            flex: 1,
            headerName: header,
          })),
        );

        setRows(
          rawData.slice(1).map((row, index) =>
            rawData[0][0].toLowerCase().includes('id')
              ? {
                  id: row[0],
                  ...Object.fromEntries(row.slice(1).map((cell, index) => [rawData[0][index + 1], cell])),
                }
              : {
                  id: index,
                  ...Object.fromEntries(row.map((cell, index) => [rawData[0][index], cell])),
                },
          ),
        );
      }
    }
  }, [xsvData, separator]);

  useEffect(() => {
    setFilteredRows(rows);
  }, [rows]);

  useEffect(() => {
    setFilteredColumns(columns);
  }, [columns]);

  const getInsights = async (userMessage: string): Promise<void> => {
    setLoading(true);
    const stringifiedColumns = filteredColumns.map((header) => header.field);
    const stringifiedRows = filteredRows.map((row) =>
      [row.id, ...filteredColumns.map((header) => row[header.field])].join(
        separator.toString() === '/\\t/' ? '\t' : separator.toString(),
      ),
    );

    await context.sdk.runChain('Data Analysis', userMessage, context.agent, false, 1, {
      conversation_name: context.overrides.conversation,
      text: [
        ['id', ...stringifiedColumns].join(separator.toString() === '/\\t/' ? '\t' : separator.toString()),
        ...stringifiedRows,
      ].join('\n'),
    });
    setLoading(false);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return rows.length > 0 ? (
    <div className='flex flex-col gap-4'>
      {error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {filteredColumns.map((column) => (
                    <th
                      key={column.field}
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      {column.headerName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row, rowIndex) => (
                  <tr key={row.id} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {filteredColumns.map((column) => (
                      <td key={`${row.id}-${column.field}`} className='px-6 py-4 whitespace-nowrap'>
                        {row[column.field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='flex justify-between items-center'>
            <div>
              <select
                className='border rounded px-2 py-1'
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {[5, 10, 20].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                className='px-2 py-1 border rounded mr-2'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {Math.ceil(filteredRows.length / pageSize)}
              </span>
              <button
                className='px-2 py-1 border rounded ml-2'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredRows.length / pageSize)}
              >
                Next
              </button>
            </div>
          </div>
          {setLoading && (
            <div className='mt-4'>
              <button
                className='flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-100'
                onClick={() => setOpen(true)}
              >
                <LightBulbIcon className='w-5 h-5 mr-2' />
                Get Insights
              </button>
            </div>
          )}
          {open && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
              <div className='bg-white p-6 rounded-lg'>
                <h2 className='text-xl font-bold mb-4'>Get Insights</h2>
                <input
                  className='w-full p-2 border rounded mb-4'
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onClick={() => {
                    if (userMessage === 'Surprise me!') {
                      setUserMessage('');
                    }
                  }}
                  placeholder='What would you like insights on?'
                />
                <div className='flex justify-end'>
                  <button className='px-4 py-2 text-red-500 mr-2' onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className='px-4 py-2 bg-blue-500 text-white rounded'
                    onClick={() => {
                      getInsights(userMessage);
                      setOpen(false);
                    }}
                  >
                    Get Insights
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  ) : (
    <>{xsvData}</>
  );
};

export default RendererXSV;
