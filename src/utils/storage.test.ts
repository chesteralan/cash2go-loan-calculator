import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyImport,
  buildImportPreview,
  clearAllLoans,
  deleteSavedLoan,
  exportLoansJson,
  buildExportData,
  getActiveLoanFromStorage,
  getSavedLoans,
  getStorageUsage,
  overwriteSavedLoans,
  saveLoanToStorage,
  setActiveLoanToStorage,
} from './storage';
import { LoanInput, SavedLoanRecord } from '../types/loan';
import { FIXED_ADDON_PRESET } from './loanCalculations';

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
    expect(loans.map((l) => l.id)).toContain('fixed-addon-preset');
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
      expect.arrayContaining(['fixed-addon-preset', 'standard-mortgage-preset'])
    );
    expect(after.find((l) => l.id === 'sample-1')).toBeUndefined();
  });
});

describe('active loan', () => {
  it('falls back to fixed add-on preset when nothing stored', () => {
    expect(getActiveLoanFromStorage().id).toBe(FIXED_ADDON_PRESET.id);
  });

  it('stores and retrieves the active loan', () => {
    setActiveLoanToStorage(sampleLoan);
    expect(getActiveLoanFromStorage()).toEqual(sampleLoan);
  });

  it('falls back on corrupt stored data', () => {
    localStorage.setItem('loanmatrix_active_loan_v1', '{not json');
    expect(getActiveLoanFromStorage().id).toBe(FIXED_ADDON_PRESET.id);
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

  it('previews and applies backup imports', () => {
    saveLoanToStorage(sampleLoan);
    const other: SavedLoanRecord = {
      id: 'other-1',
      title: 'Other',
      timestamp: Date.now(),
      input: sampleLoan,
    };
    const preview = buildImportPreview(
      JSON.stringify({ app: 'loanmatrix', version: 1, exportedAt: 1, loans: [other] })
    );
    expect(preview.newCount).toBe(1);
    expect(preview.updatedCount).toBe(0);
    const result = applyImport(preview);
    expect(result.success).toBe(true);
    expect(
      getSavedLoans()
        .map((l) => l.id)
        .sort()
    ).toEqual(['fixed-addon-preset', 'other-1', 'sample-1', 'standard-mortgage-preset']);
  });

  it('previews show updated vs unchanged by id comparison', () => {
    saveLoanToStorage(sampleLoan);
    const changed: SavedLoanRecord = {
      id: 'sample-1',
      title: 'Sample Loan (edited)',
      timestamp: Date.now(),
      input: sampleLoan,
    };
    const preview = buildImportPreview(
      JSON.stringify({ app: 'loanmatrix', version: 1, exportedAt: 1, loans: [changed] })
    );
    expect(preview.updatedCount).toBe(1);
    expect(preview.newCount).toBe(0);
  });

  it('returns empty preview for malformed payloads', () => {
    const preview = buildImportPreview('not json');
    expect(preview).toEqual({
      fileLoans: [],
      newCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      invalidCount: 0,
    });
    expect(buildImportPreview(JSON.stringify({ nope: true }))).toEqual({
      fileLoans: [],
      newCount: 0,
      updatedCount: 0,
      unchangedCount: 0,
      invalidCount: 0,
    });
  });

  it('counts invalid loan entries in the preview', () => {
    const preview = buildImportPreview(
      JSON.stringify({ app: 'loanmatrix', version: 1, exportedAt: 1, loans: [{ bad: true }, null] })
    );
    expect(preview.invalidCount).toBe(2);
    expect(preview.fileLoans.length).toBe(0);
    expect(applyImport(preview).success).toBe(false);
  });
});

describe('storage usage and undo helpers', () => {
  it('reports approximate byte usage', () => {
    saveLoanToStorage(sampleLoan);
    const usage = getStorageUsage();
    expect(usage.savedLoansBytes).toBeGreaterThan(0);
    expect(usage.totalBytes).toBe(usage.savedLoansBytes + usage.activeLoanBytes);
    expect(usage.quotaBytes).toBeGreaterThan(usage.totalBytes);
  });

  it('overwrites the saved list exactly (undo restore)', () => {
    const restored: SavedLoanRecord[] = [
      { id: 'only-1', title: 'Only', timestamp: 1, input: sampleLoan },
    ];
    const before = getSavedLoans();
    const result = overwriteSavedLoans(restored);
    expect(result.map((l) => l.id)).toEqual(['only-1']);
    overwriteSavedLoans(before);
    expect(getSavedLoans().map((l) => l.id)).toEqual(before.map((l) => l.id));
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
