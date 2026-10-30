import React from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '../common/Button';

interface PaginatedTableProps {
  columns: string[];
  rows: Record<string, any>[];
  page: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (newPage: number) => void;
  searchValue: string;
  onSearchChange: (newSearch: string) => void;
  isLoading?: boolean;
}

export const PaginatedTable: React.FC<PaginatedTableProps> = ({
  columns,
  rows,
  page,
  totalPages,
  totalRows,
  onPageChange,
  searchValue,
  onSearchChange,
  isLoading = false
}) => {
  return (
    <div className="space-y-4">
      {/* Search and Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rows..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-border rounded-input focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-text-muted">
          Showing <span className="font-semibold text-text-main">{rows.length}</span> of{' '}
          <span className="font-semibold text-text-main">{totalRows.toLocaleString()}</span> rows
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 sticky top-0 border-b border-border z-10">
              <tr>
                <th className="py-2.5 px-3 font-semibold text-slate-500 w-12 text-center">#</th>
                {columns.map((col) => (
                  <th key={col} className="py-2.5 px-4 font-semibold text-text-main whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-text-muted">
                    Loading rows...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-8 text-center text-text-muted">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px] text-center">
                      {(page - 1) * 20 + idx + 1}
                    </td>
                    {columns.map((col) => {
                      const val = row[col];
                      const isNull = val === null || val === undefined;
                      return (
                        <td key={col} className="py-2 px-4 whitespace-nowrap text-slate-700">
                          {isNull ? (
                            <span className="text-slate-400 italic">null</span>
                          ) : typeof val === 'number' ? (
                            <span className="font-mono text-blue-900">{val.toLocaleString()}</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-border">
          <span className="text-xs text-text-muted">
            Page <span className="font-semibold text-text-main">{page}</span> of{' '}
            <span className="font-semibold text-text-main">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              icon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
