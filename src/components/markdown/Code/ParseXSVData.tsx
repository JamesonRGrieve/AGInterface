interface ColumnType {
  field: string;
  width: number;
  flex: number;
  headerName: string;
}

interface RowType {
  id: string | number;
  [key: string]: string | number;
}

export function parseXSVData(
  xsvData: string[],
  separator: RegExp | string,
): { rows: RowType[]; columns: ColumnType[] } | { error: string } {
  if (!xsvData) {
    return { error: 'No data provided.' };
  }

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
    return { error: 'XSV data is not valid.' };
  }

  const isIdHeader = rawData[0][0].toLowerCase().includes('id');

  return {
    columns: (isIdHeader ? rawData[0].slice(1) : rawData[0]).map((header) => ({
      field: header,
      width: Math.max(160, header.length * 10),
      flex: 1,
      headerName: header,
    })),
    rows: rawData.slice(1).map((row, index) =>
      isIdHeader
        ? {
            id: row[0],
            ...Object.fromEntries(row.slice(1).map((cell, i) => [rawData[0][i + 1], cell])),
          }
        : {
            id: index,
            ...Object.fromEntries(row.map((cell, i) => [rawData[0][i], cell])),
          },
    ),
  };
}
