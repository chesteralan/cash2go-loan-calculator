import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAllLoans,
  deleteSavedLoan,
  exportLoansJson,
  buildExportData,
  getActiveLoanFromStorage,
  getSavedLoans,
  getStoredDarkMode,
  importLoansJson,
  saveLoanToStorage,
  setActiveLoanToStorage,
  setStoredDarkMode,
} from './storage';
import { LoanInput, SavedLoanRecord } from '../types/loan';
import { CASH2GO_PRESET } from './loanCalculations';

const sampleLoan: LoanInput = {
  id: 'sample-1',
  title: 'Sample Loan',
  principal: 50000,
  interestRate: 6.5,
  ratePeriod: 'annual',
  structure: 'diminishing_balance',
  termValue: 12,
  termUnit: 'months',
  paymentInterval: 'monthly',
  startDate: '2026-01-15',
  extraPaymentPerPeriod: 0,
  oneTimeFee: 0,
  currencyCode: 'PHP',
};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  vi.restoreAllMocks();
});

describe('saved loans CRUD', () => {
  it('seeds presets on first read', () => {
    const loans = getSavedLoans();
    expect(loans.length).toBe(2);
    expect(loans.map((l) => l.id)).toContain('cash2go-preset');
    expect(getSavedLoans()).toEqual(loans);
  });

  it('saves a new loan and persists it', () => {
    saveLoanToStorage(sampleLoan);
    const loans = getSavedLoans();
    expect(loans[0].id).toBe('sample-1');
    expect(loans.find((l) => l.id === 'sample-1')?.input.principal).toBe(50000);
  });

  it('updates an existing loan by id instead of duplicating', () => {
    saveLoanToStorage(sampleLoan);
    saveLoanToStorage({ ...sampleLoan, title: 'Renamed', principal: 60000 });
    const loans = getSavedLoans();
    expect(loans.filter((l) => l.id === 'sample-1').length).toBe(1);
    expect(loans.find((l) => l.id === 'sample-1')?.title).toBe('Renamed');
  });

  it('assigns fallback id/title for anonymous loans', () => {
    const loans = saveLoanToStorage({ ...sampleLoan, id: '', title: '' });
    const saved = loans[0];
    expect(saved.id).toMatch(/^loan-/);
    expect(saved.title).toBe('Untitled Loan');
  });

  it('deletes a saved loan by id', () => {
    saveLoanToStorage(sampleLoan);
    const after = deleteSavedLoan('sample-1');
    expect(after.find((l) => l.id === 'sample-1')).toBeUndefined();
    expect(getSavedLoans().find((l) => l.id === 'sample-1')).toBeUndefined();
  });

  it('clears all loans and re-seeds presets', () => {
    saveLoanToStorage(sampleLoan);
    const after = clearAllLoans();
    expect(after.map((l) => l.id)).toEqual(
      expect.arrayContaining(['cash2go-preset', 'standard-mortgage-preset'])
    );
    expect(after.find((l) => l.id === 'sample-1')).toBeUndefined();
  });
});

describe('active loan', () => {
  it('falls back to Cash2Go preset when nothing stored', () => {
    expect(getActiveLoanFromStorage().id).toBe(CASH2GO_PRESET.id);
  });

  it('stores and retrieves the active loan', () => {
    setActiveLoanToStorage(sampleLoan);
    expect(getActiveLoanFromStorage()).toEqual(sampleLoan);
  });

  it('falls back on corrupt stored data', () => {
    localStorage.setItem('loanmatrix_active_loan_v1', '{not json');
    expect(getActiveLoanFromStorage().id).toBe(CASH2GO_PRESET.id);
  });
});

describe('JSON export/import', () => {
  it('builds an export payload with all saved loans', () => {
    saveLoanToStorage(sampleLoan);
    const data = buildExportData();
    expect(data.app).toBe('loanmatrix');
    expect(data.version).toBe(1);
    expect(typeof data.exportedAt).toBe('number');
    expect(data.loans.map((l) => l.id)).toContain('sample-1');
  });

  it('merges loans from a backup file', () => {
    saveLoanToStorage(sampleLoan);
    const other: SavedLoanRecord = {
      id: 'other-1',
      title: 'Other',
      timestamp: Date.now(),
      input: sampleLoan,
    };
    const result = importLoansJson(
      JSON.stringify({ app: 'loanmatrix', version: 1, exportedAt: 1, loans: [other] })
    );
    expect(result.success).toBe(true);
    expect(
      getSavedLoans()
        .map((l) => l.id)
        .sort()
    ).toEqual(['cash2go-preset', 'other-1', 'sample-1', 'standard-mortgage-preset']);
  });

  it('rejects malformed import payloads', () => {
    expect(importLoansJson('not json')).toEqual({
      success: false,
      count: 0,
      error: expect.any(String),
    });
    expect(importLoansJson(JSON.stringify({ nope: true }))).toEqual({
      success: false,
      count: 0,
      error: 'Invalid backup file structure',
    });
  });

  it('skips invalid loan entries on import', () => {
    const result = importLoansJson(
      JSON.stringify({ app: 'loanmatrix', version: 1, exportedAt: 1, loans: [{ bad: true }, null] })
    );
    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
  });
});

describe('dark mode', () => {
  it('persists and restores the flag', () => {
    setStoredDarkMode(true);
    expect(getStoredDarkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    setStoredDarkMode(false);
    expect(getStoredDarkMode()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

describe('export download', () => {
  it('triggers a JSON file download', () => {
    saveLoanToStorage(sampleLoan);
    const clickMock = vi.fn();
    const anchorStub = {
      href: '',
      download: '',
      click: clickMock,
      remove: vi.fn(),
    } as unknown as HTMLAnchorElement;
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchorStub);
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(() => anchorStub);
    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

    exportLoansJson();

    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(createElementSpy).toHaveBeenCalledTimes(1);
    expect(anchorStub.download).toContain('loanmatrix-backup-');
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);

    appendSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});
