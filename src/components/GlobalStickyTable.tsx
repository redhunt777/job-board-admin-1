import React from "react";

interface Column<T> {
  key: string;
  header: React.ReactNode;
  width?: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface GlobalStickyTableProps<T> {
  columns: Column<T>[];
  data: T[];
  stickyFirst?: boolean;
  stickyLastTwo?: boolean;
  className?: string;
}

export default function GlobalStickyTable<T>({
  columns,
  data,
  stickyFirst = true,
  stickyLastTwo = true,
  className = "",
}: GlobalStickyTableProps<T>) {
  const colCount = columns.length;
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => {
              let stickyClass = "";
              if (stickyFirst && idx === 0) stickyClass = "sticky left-0 z-20 bg-white";
              if (stickyLastTwo && idx === colCount - 2) stickyClass = "sticky right-24 z-20 bg-white";
              if (stickyLastTwo && idx === colCount - 1) stickyClass = "sticky right-0 z-20 bg-white";
              return (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${stickyClass} ${col.className || ""}`}
                  style={col.width ? { width: col.width, minWidth: col.width, maxWidth: col.width } : {}}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-6 py-12 text-center text-gray-500">
                <p className="text-lg font-medium">No data found</p>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, idx) => {
                  let stickyClass = "";
                  if (stickyFirst && idx === 0) stickyClass = "sticky left-0 z-10 bg-white";
                  if (stickyLastTwo && idx === colCount - 2) stickyClass = "sticky right-24 z-10 bg-white";
                  if (stickyLastTwo && idx === colCount - 1) stickyClass = "sticky right-0 z-10 bg-white";
                  return (
                    <td
                      key={col.key}
                      className={`px-6 py-4 whitespace-nowrap ${stickyClass} ${col.className || ""}`}
                      style={col.width ? { width: col.width, minWidth: col.width, maxWidth: col.width } : {}}
                    >
                      {col.render(row)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 