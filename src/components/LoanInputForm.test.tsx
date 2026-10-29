import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoanInputForm } from './LoanInputForm';
import { LoanInput } from '../types/loan';
import { CASH2GO_PRESET } from '../utils/loanCalculations';

const baseInput: LoanInput = { ...CASH2GO_PRESET };

const setup = (overrides: Partial<LoanInput> = {}) => {
  const onChange = vi.fn();
  const onSaveLoan = vi.fn();
  const onReset = vi.fn();
  const utils = render(
    <LoanInputForm
      input={{ ...baseInput, ...overrides }}
      onChange={onChange}
      onSaveLoan={onSaveLoan}
      onReset={onReset}
    />
  );
  return { ...utils, onChange, onSaveLoan, onReset };
};

describe('LoanInputForm', () => {
  it('renders the headline form controls', () => {
    setup();
    expect(screen.getByText(/Loan Parameters & Structure/i)).toBeTruthy();
    expect(screen.getAllByLabelText(/Loan Title \/ Description/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Loan Amount \(Principal\)/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByLabelText(/Monthly Add-on Rate|Annual Interest Rate/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Loan Duration \/ Term/i).length).toBeGreaterThan(0);
  });

  it('propagates title edits through onChange', async () => {
    const { onChange } = setup();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Loan Title \/ Description/i), 'X');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: `${baseInput.title}X` })
    );
  });

  it('applies a preset when clicking the preset button', async () => {
    const { onChange } = setup();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /PH Mortgage/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/mortgage/i) })
    );
  });

  it('shows advanced parameters when expanded', async () => {
    setup();
    const user = userEvent.setup();
    expect(screen.queryByLabelText(/Extra Principal Payment per Period/i)).toBeNull();
    await user.click(screen.getByRole('button', { name: /Advanced Parameters/i }));
    expect(screen.getByLabelText(/Extra Principal Payment per Period/i)).toBeTruthy();
    expect(screen.getByLabelText(/One-Time Fees \/ Closing Costs/i)).toBeTruthy();
  });

  it('calls reset and save handlers', async () => {
    const { onReset, onSaveLoan } = setup();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Reset Inputs/i }));
    await user.click(screen.getByRole('button', { name: /Save to My Calculations/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onSaveLoan).toHaveBeenCalledTimes(1);
  });

  it('renders the six payment interval options', () => {
    setup();
    const intervalSelect = screen.getByLabelText(/Payment Interval/i) as HTMLSelectElement;
    expect(intervalSelect.options.length).toBe(6);
  });
});
