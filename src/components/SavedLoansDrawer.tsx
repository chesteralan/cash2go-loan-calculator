import React from 'react';
import { LoanInput, SavedLoanRecord } from '../types/loan';
import { formatCurrency } from '../utils/currencies';
import { BookmarkCheck, Trash2, ArrowUpRight, X, FolderOpen } from 'lucide-react';

interface SavedLoansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedLoans: SavedLoanRecord[];
  onSelectLoan: (loan: LoanInput) => void;
  onDeleteLoan: (id: string) => void;
  activeLoanId: string;
}

export const SavedLoansDrawer: React.FC<SavedLoansDrawerProps> = ({
  isOpen,
  onClose,
  savedLoans,
  onSelectLoan,
  onDeleteLoan,
  activeLoanId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Saved Loan Calculations ({savedLoans.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close saved loans drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {savedLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderOpen className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                No saved calculations yet
              </p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Click "Save to My Calculations" on any loan setup to easily compare and recall them
                later.
              </p>
            </div>
          ) : (
            savedLoans.map((item) => {
              const isActive = item.input.id === activeLoanId;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      {isActive && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>{formatCurrency(item.input.principal, item.input.currencyCode)}</span>
                      <span>·</span>
                      <span>
                        {item.input.interestRate}%{' '}
                        {item.input.structure === 'fixed_addon' ? 'Add-on' : 'APR'}
                      </span>
                      <span>·</span>
                      <span>
                        {item.input.termValue} {item.input.termUnit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onSelectLoan(item.input);
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Load into Calculator"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteLoan(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                      title="Delete saved loan"
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
