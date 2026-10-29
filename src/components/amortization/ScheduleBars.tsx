import React from 'react';
import { CalculationResult } from '../../types/loan';
import { FileSpreadsheet, FileText, FileDown, Printer, Search } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';

const exportButtonClass =
  'flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors';

export const ScheduleSearchBar: React.FC<{
  query: string;
  onChange: (q: string) => void;
  count: number;
}> = ({ query, onChange, count }) => (
  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by date (YYYY-MM) or period #..."
        className="w-full rounded-lg border border-slate-300 bg-white pr-3 py-1.5 pl-8 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
      Showing {count} payments
    </div>
  </div>
);

export const ScheduleActions: React.FC<{ result: CalculationResult; onPrint: () => void }> = ({
  result,
  onPrint,
}) => (
  <div className="flex items-center gap-1.5">
    <button
      onClick={() => exportToPDF(result)}
      className={exportButtonClass}
      title="Download PDF Statement"
    >
      <FileText className="h-3.5 w-3.5 text-rose-500" />
      <span className="hidden sm:inline">Export</span> PDF
    </button>
    <button
      onClick={() => exportToExcel(result)}
      className={exportButtonClass}
      title="Download Excel Spreadsheet"
    >
      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
      <span className="hidden sm:inline">Export</span> Excel
    </button>
    <button
      onClick={() => exportToCSV(result)}
      className={exportButtonClass}
      title="Download CSV Table"
    >
      <FileDown className="h-3.5 w-3.5 text-blue-600" />
      CSV
    </button>
    <button onClick={onPrint} className={exportButtonClass} title="Print Schedule">
      <Printer className="h-3.5 w-3.5 text-slate-500" />
      <span className="sr-only">Print</span>
    </button>
  </div>
);

export const PaginationBar: React.FC<{
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const buttonClass =
    'flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800';
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs">
      <div className="text-slate-500 dark:text-slate-400">
        Page <span className="font-semibold text-slate-800 dark:text-white">{page}</span> of{' '}
        <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={buttonClass}
        >
          <span>Previous</span>
        </button>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={buttonClass}
        >
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};
