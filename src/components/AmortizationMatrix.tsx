import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../types/loan';
import { formatCurrency } from '../utils/currencies';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportUtils';
import {
  Table,
  FileSpreadsheet,
  FileText,
  FileDown,
  Printer,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface AmortizationMatrixProps {
  result: CalculationResult;
}

export const AmortizationMatrix: React.FC<AmortizationMatrixProps> = ({ result }) => {
  const { schedule, annualMatrix, input, totalPrincipal, totalInterest, totalCost } = result;
  const [activeView, setActiveView] = useState<'annual' | 'detailed'>('annual');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 24; // 2 years of monthly payments per page

  // Filtered rows for detailed view
  const filteredSchedule = useMemo(() => {
    if (!searchQuery.trim()) return schedule;
    const q = searchQuery.toLowerCase().trim();
    return schedule.filter(
      (row) => row.date.toLowerCase().includes(q) || row.period.toString().includes(q)
    );
  }, [schedule, searchQuery]);

  const totalPages = Math.ceil(filteredSchedule.length / rowsPerPage);
  const paginatedSchedule = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredSchedule.slice(start, start + rowsPerPage);
  }, [filteredSchedule, page, rowsPerPage]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-7 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Amortization Schedule & Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed breakdown of principal reduction, interest allocation, and remaining balance
            over time.
          </p>
        </div>

        {/* View Switcher & Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Annual vs Detailed View Toggle */}
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveView('annual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeView === 'annual'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Annual Matrix</span>
            </button>
            <button
              onClick={() => setActiveView('detailed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeView === 'detailed'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Payment Schedule ({schedule.length})</span>
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportToPDF(result)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
              title="Download PDF Statement"
            >
              <FileText className="h-3.5 w-3.5 text-rose-500" />
              <span className="hidden sm:inline">Export</span> PDF
            </button>

            <button
              onClick={() => exportToExcel(result)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
              title="Download Excel Spreadsheet"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export</span> Excel
            </button>

            <button
              onClick={() => exportToCSV(result)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
              title="Download CSV Table"
            >
              <FileDown className="h-3.5 w-3.5 text-blue-600" />
              CSV
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
              title="Print Schedule"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span className="sr-only">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar for detailed view */}
      {activeView === 'detailed' && (
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by date (YYYY-MM) or period #..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Showing {filteredSchedule.length} payments
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        {activeView === 'annual' ? (
          /* ANNUAL MATRIX VIEW */
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-semibold">
                <th scope="col" className="py-3 px-4">
                  Year
                </th>
                <th scope="col" className="py-3 px-4">
                  Calendar Year
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Principal Paid
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Interest Paid
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Total Paid
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Ending Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-mono tabular-nums">
              {annualMatrix.map((row) => (
                <tr
                  key={row.yearIndex}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                    Year {row.yearIndex}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">
                    {row.calendarYear}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 font-medium">
                    {formatCurrency(row.principalPaid, input.currencyCode)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400">
                    {formatCurrency(row.interestPaid, input.currencyCode)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(row.totalPaid, input.currencyCode)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(row.endingBalance, input.currencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white font-mono tabular-nums">
                <td className="py-3.5 px-4 font-sans" colSpan={2}>
                  Total Loan Lifecycle
                </td>
                <td className="py-3.5 px-4 text-right text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalPrincipal, input.currencyCode)}
                </td>
                <td className="py-3.5 px-4 text-right text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalInterest, input.currencyCode)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {formatCurrency(totalCost, input.currencyCode)}
                </td>
                <td className="py-3.5 px-4 text-right font-sans text-emerald-600 dark:text-emerald-400">
                  Fully Paid (0.00)
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          /* DETAILED PERIODIC AMORTIZATION SCHEDULE */
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-semibold">
                <th scope="col" className="py-3 px-3 text-center">
                  #
                </th>
                <th scope="col" className="py-3 px-4">
                  Payment Date
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Payment
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Principal
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Interest
                </th>
                {input.extraPaymentPerPeriod > 0 && (
                  <th scope="col" className="py-3 px-4 text-right">
                    Extra
                  </th>
                )}
                <th scope="col" className="py-3 px-4 text-right">
                  Ending Balance
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Cum. Interest
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-mono tabular-nums">
              {paginatedSchedule.map((row) => (
                <tr
                  key={row.period}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-sans">{row.period}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-300">
                    {row.date}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(row.payment, input.currencyCode)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-blue-600 dark:text-blue-400">
                    {formatCurrency(row.principal, input.currencyCode)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-amber-600 dark:text-amber-400">
                    {formatCurrency(row.interest, input.currencyCode)}
                  </td>
                  {input.extraPaymentPerPeriod > 0 && (
                    <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {row.extraPayment > 0
                        ? formatCurrency(row.extraPayment, input.currencyCode)
                        : '-'}
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-right font-medium">
                    {formatCurrency(row.remainingBalance, input.currencyCode)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400">
                    {formatCurrency(row.cumulativeInterest, input.currencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination for detailed view */}
      {activeView === 'detailed' && totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-800 dark:text-white">{page}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
