import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../types/loan';
import { Table, Calendar, Layers } from 'lucide-react';
import { TogglePill } from './ui/TogglePill';
import { AnnualMatrixTable } from './amortization/AnnualMatrixTable';
import { DetailedScheduleTable } from './amortization/DetailedScheduleTable';
import { ScheduleSearchBar, ScheduleActions, PaginationBar } from './amortization/ScheduleBars';

const ROWS_PER_PAGE = 24; // 2 years of monthly payments per page

export const AmortizationMatrix: React.FC<{ result: CalculationResult }> = ({ result }) => {
  const { schedule } = result;
  const [activeView, setActiveView] = useState<'annual' | 'detailed'>('annual');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const filteredSchedule = useMemo(() => {
    if (!searchQuery.trim()) return schedule;
    const q = searchQuery.toLowerCase().trim();
    return schedule.filter(
      (row) => row.date.toLowerCase().includes(q) || row.period.toString().includes(q)
    );
  }, [schedule, searchQuery]);

  const totalPages = Math.ceil(filteredSchedule.length / ROWS_PER_PAGE);
  const paginatedSchedule = useMemo(
    () => filteredSchedule.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [filteredSchedule, page]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-7 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Amortization Schedule &amp; Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed breakdown of principal reduction, interest allocation, and remaining balance
            over time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TogglePill
            value={activeView}
            onChange={setActiveView}
            options={[
              {
                value: 'annual',
                label: (
                  <>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Annual Matrix</span>
                  </>
                ),
              },
              {
                value: 'detailed',
                label: (
                  <>
                    <Layers className="h-3.5 w-3.5" />
                    <span>Payment Schedule ({schedule.length})</span>
                  </>
                ),
              },
            ]}
          />
          <ScheduleActions result={result} onPrint={() => window.print()} />
        </div>
      </div>

      {activeView === 'detailed' && (
        <ScheduleSearchBar
          query={searchQuery}
          onChange={handleSearch}
          count={filteredSchedule.length}
        />
      )}

      <div className="overflow-x-auto">
        {activeView === 'annual' ? (
          <AnnualMatrixTable result={result} />
        ) : (
          <DetailedScheduleTable result={result} rows={paginatedSchedule} />
        )}
      </div>

      {activeView === 'detailed' && (
        <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  );
};
