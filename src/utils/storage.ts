import { LoanInput, SavedLoanRecord } from '../types/loan';
import { CASH2GO_PRESET, STANDARD_MORTGAGE_PRESET } from './loanCalculations';

const SAVED_LOANS_KEY = 'loanmatrix_saved_loans_v1';
const CURRENT_LOAN_KEY = 'loanmatrix_active_loan_v1';
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
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveLoanToStorage(input: LoanInput): SavedLoanRecord[] {
  const current = getSavedLoans();
  const existingIdx = current.findIndex((item) => item.id === input.id);
  const id = input.id || `loan-${Date.now()}`;
  const record: SavedLoanRecord = {
    id,
    title: input.title || 'Untitled Loan',
    timestamp: Date.now(),
    input: { ...input, id },
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

export function clearAllLoans(): SavedLoanRecord[] {
  localStorage.removeItem(SAVED_LOANS_KEY);
  return getSavedLoans();
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

export interface ExportPayload {
  app: 'loanmatrix';
  version: 1;
  exportedAt: number;
  loans: SavedLoanRecord[];
}

export function buildExportData(): ExportPayload {
  return {
    app: 'loanmatrix',
    version: 1,
    exportedAt: Date.now(),
    loans: getSavedLoans(),
  };
}

export function exportLoansJson(): void {
  const payload = buildExportData();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `loanmatrix-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importLoansJson(jsonText: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  try {
    const payload = JSON.parse(jsonText) as ExportPayload;
    if (!payload || !Array.isArray(payload.loans)) {
      return { success: false, count: 0, error: 'Invalid backup file structure' };
    }

    const valid = payload.loans.filter((l) => l && typeof l === 'object' && l.id && l.input);

    const current = getSavedLoans();
    const map = new Map<string, SavedLoanRecord>();
    current.forEach((l) => map.set(l.id, l));
    valid.forEach((l) => map.set(l.id, l));

    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(SAVED_LOANS_KEY, JSON.stringify(merged));
    return { success: true, count: valid.length };
  } catch (err: unknown) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Failed to read backup file',
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
