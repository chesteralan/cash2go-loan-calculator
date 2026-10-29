import React, { useState } from 'react';
import { generateSyncBundle, getSyncID, restoreSyncBundle } from '../utils/storageAndSync';
import { Cloud, Copy, Check, ArrowDownToLine, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted,
}) => {
  const [syncId] = useState(getSyncID());
  const [copied, setCopied] = useState(false);
  const [importString, setImportString] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  const currentBundle = generateSyncBundle();

  const handleCopyBundle = () => {
    navigator.clipboard.writeText(currentBundle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRestore = () => {
    if (!importString.trim()) {
      setSyncStatus('Please paste a sync bundle first.');
      setStatusType('error');
      return;
    }

    const res = restoreSyncBundle(importString);
    if (res.success) {
      setSyncStatus(`Successfully synchronized ${res.count} loan calculation(s)!`);
      setStatusType('success');
      onSyncCompleted();
      setTimeout(() => {
        onClose();
        setSyncStatus(null);
      }, 1500);
    } else {
      setSyncStatus(res.error || 'Failed to restore sync payload.');
      setStatusType('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cross-Device Cloud Sync
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close sync modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Device Sync ID */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-850">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Your Device Sync Node
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Active
              </span>
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
              {syncId}
            </div>
          </div>

          {/* Export Bundle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Step 1: Export Current Device Data Bundle
            </label>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Copy this portable sync string to transfer your saved loan calculations to your phone,
              tablet, or another browser.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentBundle}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono text-slate-600 truncate dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
              <button
                onClick={handleCopyBundle}
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Import Bundle */}
          <div>
            <label
              htmlFor="import-sync-bundle"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Step 2: Sync from Another Device
            </label>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Paste the sync string from your other device to merge all calculations seamlessly.
            </p>
            <textarea
              id="import-sync-bundle"
              rows={3}
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              placeholder="Paste sync code or export string here..."
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500"
            />
          </div>

          {/* Status Message */}
          {syncStatus && (
            <div
              className={`rounded-xl p-3 text-xs font-semibold ${
                statusType === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {syncStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleRestore}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm"
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>Merge & Sync Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
