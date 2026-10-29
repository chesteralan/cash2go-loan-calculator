import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SavedLoansDrawer } from './SavedLoansDrawer';
import { LoanInput, SavedLoanRecord } from '../types/loan';
import { CASH2GO_PRESET } from '../utils/loanCalculations';

const sampleInput: LoanInput = { ...CASH2GO_PRESET, id: 'sample-1', title: 'Sample Loan' };

const records: SavedLoanRecord[] = [
  { id: 'sample-1', title: 'Sample Loan', timestamp: Date.now(), input: sampleInput },
];

const setup = () => {
  const handlers = {
    onClose: vi.fn(),
    onSelectLoan: vi.fn(),
    onDeleteLoan: vi.fn(),
    onClearAllLoans: vi.fn(),
    onExportLoans: vi.fn(),
    onImportLoans: vi.fn(),
    onCancelImport: vi.fn(),
    onApplyImport: vi.fn(),
  };
  render(
    <SavedLoansDrawer
      isOpen
      onClose={handlers.onClose}
      savedLoans={records}
      onSelectLoan={handlers.onSelectLoan}
      onDeleteLoan={handlers.onDeleteLoan}
      onClearAllLoans={handlers.onClearAllLoans}
      onExportLoans={handlers.onExportLoans}
      onImportFile={handlers.onImportLoans}
      importPreview={null}
      onCancelImport={handlers.onCancelImport}
      onApplyImport={handlers.onApplyImport}
      activeLoanId="sample-1"
    />
  );
  return handlers;
};

describe('SavedLoansDrawer', () => {
  it('lists saved loans and marks the active one', () => {
    setup();
    expect(screen.getByText(/My Saved Loan Calculations \(1\)/i)).toBeTruthy();
    expect(screen.getByText('Sample Loan')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('loads a selected loan into the calculator', async () => {
    const handlers = setup();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Load Sample Loan into Calculator/i }));
    expect(handlers.onSelectLoan).toHaveBeenCalledWith(sampleInput);
  });

  it('deletes, exports, and clears via the footer controls', async () => {
    const handlers = setup();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Delete Sample Loan/i }));
    expect(handlers.onDeleteLoan).toHaveBeenCalledWith('sample-1');
    await user.click(screen.getByRole('button', { name: /Export Backup/i }));
    expect(handlers.onExportLoans).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /Remove all saved loan calculations/i }));
    expect(handlers.onClearAllLoans).toHaveBeenCalledTimes(1);
  });

  it('passes a chosen file to the importer', async () => {
    const handlers = setup();
    const input = screen.getByTestId('import-backup-input');
    const file = new File(['{}'], 'backup.json', { type: 'application/json' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);
    expect(handlers.onImportLoans).toHaveBeenCalledWith(file);
  });
});
