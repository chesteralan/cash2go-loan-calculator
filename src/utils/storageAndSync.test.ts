import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteSavedLoan,
  generateSyncBundle,
  getActiveLoanFromStorage,
  getSavedLoans,
  getStoredDarkMode,
  getSyncID,
  restoreSyncBundle,
  saveLoanToStorage,
  setActiveLoanToStorage,
  setStoredDarkMode,
} from './storageAndSync';
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

describe('sync id', () => {
  it('generates and persists a stable id', () => {
    const first = getSyncID();
    expect(first).toMatch(/^LM-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(getSyncID()).toBe(first);
  });
});

describe('sync bundle', () => {
  it('round-trips through base64', () => {
    saveLoanToStorage(sampleLoan);
    const bundle = generateSyncBundle();
    expect(typeof bundle).toBe('string');
    localStorage.clear();
    const result = restoreSyncBundle(bundle);
    expect(result.success).toBe(true);
    // Bundle includes the 2 seeded presets + sample loan
    expect(result.count).toBe(3);
    const restored = getSavedLoans().find((l) => l.id === 'sample-1');
    expect(restored?.title).toBe('Sample Loan');
  });

  it('merges with existing loans on restore', () => {
    const other: SavedLoanRecord = {
      id: 'other-1',
      title: 'Other',
      timestamp: Date.now(),
      input: sampleLoan,
    };
    saveLoanToStorage(sampleLoan);
    const bundle = btoa(
      unescape(
        encodeURIComponent(
          JSON.stringify({ version: 1, syncId: 'X', timestamp: 1, loans: [other] })
        )
      )
    );
    const result = restoreSyncBundle(bundle);
    expect(result.success).toBe(true);
    // 2 seeded presets + sample + other from bundle
    expect(
      getSavedLoans()
        .map((l) => l.id)
        .sort()
    ).toEqual(['cash2go-preset', 'other-1', 'sample-1', 'standard-mortgage-preset']);
  });

  it('rejects malformed bundles', () => {
    expect(restoreSyncBundle('not-base64!')).toEqual({
      success: false,
      count: 0,
      error: expect.any(String),
    });
  });

  it('rejects valid base64 with wrong structure', () => {
    const bundle = btoa(unescape(encodeURIComponent(JSON.stringify({ nope: true }))));
    const result = restoreSyncBundle(bundle);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid sync bundle structure');
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
