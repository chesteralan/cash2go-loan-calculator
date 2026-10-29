import { LoanInput, SavedLoanRecord } from '../types/loan';
import { CASH2GO_PRESET, STANDARD_MORTGAGE_PRESET } from './loanCalculations';

const SAVED_LOANS_KEY = 'loanmatrix_saved_loans_v1';
const CURRENT_LOAN_KEY = 'loanmatrix_active_loan_v1';
const SYNC_CLOUD_ID_KEY = 'loanmatrix_sync_id_v1';
const DARK_MODE_KEY = 'loanmatrix_theme_dark';

export function getSavedLoans(): SavedLoanRecord[] {
  try {
    const raw = localStorage.getItem(SAVED_LOANS_KEY);
    if (!raw) {
      // Seed with initial sample presets so user immediately has Cash2Go and standard mortgage
      const initial: SavedLoanRecord[] = [
        {
          id: CASH2GO_PRESET.id,
          title: CASH2GO_PRESET.title,
          timestamp: Date.now() - 1000 * 60 * 60,
          input: CASH2GO_PRESET,
        },
        {
          id: STANDARD_MORTGAGE_PRESET.id,
          title: STANDARD_MORTGAGE_PRESET.title,
          timestamp: Date.now() - 1000 * 60 * 120,
          input: STANDARD_MORTGAGE_PRESET,
        },
      ];
      localStorage.setItem(SAVED_LOANS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLoanToStorage(input: LoanInput): SavedLoanRecord[] {
  const current = getSavedLoans();
  const existingIdx = current.findIndex((item) => item.id === input.id);
  const record: SavedLoanRecord = {
    id: input.id || `loan-${Date.now()}`,
    title: input.title || 'Untitled Loan',
    timestamp: Date.now(),
    input: { ...input, id: input.id || `loan-${Date.now()}` },
  };

  let updated: SavedLoanRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = record;
  } else {
    updated = [record, ...current];
  }

  localStorage.setItem(SAVED_LOANS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteSavedLoan(id: string): SavedLoanRecord[] {
  const current = getSavedLoans();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(SAVED_LOANS_KEY, JSON.stringify(updated));
  return updated;
}

export function getActiveLoanFromStorage(): LoanInput {
  try {
    const raw = localStorage.getItem(CURRENT_LOAN_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return CASH2GO_PRESET;
}

export function setActiveLoanToStorage(input: LoanInput): void {
  try {
    localStorage.setItem(CURRENT_LOAN_KEY, JSON.stringify(input));
  } catch {
    // ignore
  }
}

export function getSyncID(): string {
  let id = localStorage.getItem(SYNC_CLOUD_ID_KEY);
  if (!id) {
    id =
      'LM-' +
      Math.random().toString(36).substring(2, 8).toUpperCase() +
      '-' +
      Date.now().toString(36).toUpperCase();
    localStorage.setItem(SYNC_CLOUD_ID_KEY, id);
  }
  return id;
}

export interface SyncPayload {
  version: 1;
  syncId: string;
  timestamp: number;
  loans: SavedLoanRecord[];
}

export function generateSyncBundle(): string {
  const loans = getSavedLoans();
  const payload: SyncPayload = {
    version: 1,
    syncId: getSyncID(),
    timestamp: Date.now(),
    loans,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function restoreSyncBundle(base64Bundle: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  try {
    const jsonStr = decodeURIComponent(escape(atob(base64Bundle.trim())));
    const payload = JSON.parse(jsonStr) as SyncPayload;
    if (!payload || !Array.isArray(payload.loans)) {
      return { success: false, count: 0, error: 'Invalid sync bundle structure' };
    }

    const current = getSavedLoans();
    const map = new Map<string, SavedLoanRecord>();
    current.forEach((l) => map.set(l.id, l));
    payload.loans.forEach((l) => map.set(l.id, l));

    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(SAVED_LOANS_KEY, JSON.stringify(merged));
    return { success: true, count: payload.loans.length };
  } catch (err: unknown) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Failed to decode sync bundle',
    };
  }
}

export function getStoredDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function setStoredDarkMode(isDark: boolean): void {
  try {
    localStorage.setItem(DARK_MODE_KEY, String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // ignore
  }
}
