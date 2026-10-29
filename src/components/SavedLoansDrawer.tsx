import React, { useRef } from 'react';
import { LoanInput, SavedLoanRecord } from '../types/loan';
import { formatCurrency } from '../utils/currencies';
import { ImportPreview, getStorageUsage, StorageUsage } from '../utils/storage';
import {
  BookmarkCheck,
  Trash2,
  ArrowUpRight,
  X,
  FolderOpen,
  Upload,
  Download,
  Eraser,
  FileCheck2,
  HardDrive,
} from 'lucide-react';

interface SavedLoansDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedLoans: SavedLoanRecord[];
  onSelectLoan: (loan: LoanInput) => void;
  onDeleteLoan: (id: string) => void;
  onClearAllLoans: () => void;
  onExportLoans: () => void;
  onImportFile: (file: File) => void;
  importPreview: ImportPreview | null;
  onCancelImport: () => void;
  onApplyImport: () => void;
  activeLoanId: string;
}

const formatBytes = (bytes: number): string =>
  bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;

const StorageUsageBar: React.FC = () => {
  const usage: StorageUsage = getStorageUsage();
  const pct = Math.min(100, (usage.totalBytes / usage.quotaBytes) * 100);
  const warn = usage.totalBytes > usage.quotaBytes * 0.8;
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 text-[10px] text-slate-500 dark:text-slate-400">
      <div className="flex items-center justify-between font-semibold">
        <span className="flex items-center gap-1">
          <HardDrive className="h-3 w-3" />
          Local storage used: {formatBytes(usage.totalBytes)}
        </span>
        {warn && (
          <span className="text-amber-600 dark:text-amber-400">Near quota — export a backup</span>
        )}
      </div>
      <div className="mt-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-1 rounded-full ${warn ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
};

export const SavedLoansDrawer: React.FC<SavedLoansDrawerProps> = ({
  isOpen,
  onClose,
  savedLoans,
  onSelectLoan,
  onDeleteLoan,
  onClearAllLoans,
  onExportLoans,
  onImportFile,
  importPreview,
  onCancelImport,
  onApplyImport,
  activeLoanId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        {/* Import preview */}
        {importPreview && (
          <div className="mx-5 mt-4 rounded-xl border border-blue-300 bg-blue-50/70 p-3.5 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              <FileCheck2 className="h-4 w-4" />
              <span>Review backup before applying</span>
            </div>
            <p className="mt-1 text-[11px] text-blue-800/80 dark:text-blue-300/80 font-mono">
              +{importPreview.newCount} new · {importPreview.updatedCount} updated ·{' '}
              {importPreview.unchangedCount} unchanged
              {importPreview.invalidCount > 0 && ` · ${importPreview.invalidCount} skipped`}
            </p>
            <div className="mt-2.5 flex items-center justify-end gap-2">
              <button
                onClick={onCancelImport}
                className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={onApplyImport}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700"
              >
                Apply Import
              </button>
            </div>
          </div>
        )}

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
                      aria-label={`Load ${item.title} into Calculator`}
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

        {/* Footer: Local Backup Management */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            data-testid="import-backup-input"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportFile(file);
              }
              e.target.value = '';
            }}
          />
          <StorageUsageBar />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExportLoans}
              className="flex items-center gap-1.5 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Download all saved loans as a JSON backup file"
            >
              <Download className="h-3.5 w-3.5" />
              Export Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Import loans from a LoanMatrix backup file"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Backup
            </button>
            <button
              onClick={onClearAllLoans}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
              title="Remove all saved loan calculations"
              aria-label="Remove all saved loan calculations"
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            All data lives only in this browser's local storage. Backups are plain JSON files you
            control.
          </p>
        </div>
      </div>
    </div>
  );
};
